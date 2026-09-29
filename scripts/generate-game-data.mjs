import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs"
import path from "node:path"

// Run from the repo root:  node scripts/generate-game-data.mjs
const ROOT = path.resolve(import.meta.dirname, "..")
const SRC = path.join(ROOT, "Game-data-main/src/data/pairs")
const OUT = path.join(ROOT, "lib/game-data.ts")

const ROW =
  /\{\s*date:\s*"([^"]+)"\s*,\s*time:\s*"([^"]+)"\s*,\s*open:\s*([-\d.]+)\s*,\s*high:\s*([-\d.]+)\s*,\s*low:\s*([-\d.]+)\s*,\s*close:\s*([-\d.]+)\s*,\s*volume:\s*([-\d.]+)\s*\}/g
const META_RE = /export const META\s*=\s*\{([^}]*)\}/

function metaField(body, key) {
  const m = body.match(new RegExp(key + ":\\s*'([^']*)'"))
  return m ? m[1] : undefined
}

const MIN_CANDLES = 45 // sliceGameData: 30 history + 15 future
const report = { skipped: [], droppedRows: 0, repairedCandles: 0, nonMonotonic: [] }
const datasets = []

for (const level of ["easy", "medium", "hard"]) {
  for (const file of readdirSync(path.join(SRC, level)).sort()) {
    const abs = path.join(SRC, level, file)
    const slug = `${level}/${file}`

    if (statSync(abs).size === 0) {
      report.skipped.push({ slug, why: "file is empty (0 bytes)" })
      continue
    }

    const text = readFileSync(abs, "utf8")
    const metaMatch = text.match(META_RE)
    if (!metaMatch) {
      report.skipped.push({ slug, why: "no META block" })
      continue
    }
    const meta = {
      pair: metaField(metaMatch[1], "pair"),
      level: metaField(metaMatch[1], "level"),
      timeframe: metaField(metaMatch[1], "timeframe"),
      period: metaField(metaMatch[1], "period"),
    }
    if (!meta.pair || !meta.level || !meta.timeframe || !meta.period) {
      report.skipped.push({ slug, why: `incomplete META: ${JSON.stringify(meta)}` })
      continue
    }

    const candles = []
    for (const m of text.matchAll(ROW)) {
      const [, date, time, o, h, l, c, v] = m
      // Same conversion as their utils/csvparse.js: dots to dashes, treat as UTC.
      const t = Math.floor(new Date(`${date.replace(/\./g, "-")}T${time}Z`).getTime() / 1000)
      if (Number.isNaN(t)) {
        report.droppedRows++
        continue
      }
      let hi = +h
      let lo = +l
      const open = +o
      const close = +c
      // Some rows are geometrically impossible (low above close, etc.). Clamp the
      // wick to contain the body rather than dropping a whole candle.
      const bodyHigh = Math.max(open, close)
      const bodyLow = Math.min(open, close)
      if (hi < bodyHigh || lo > bodyLow) {
        report.repairedCandles++
        hi = Math.max(hi, bodyHigh)
        lo = Math.min(lo, bodyLow)
      }
      candles.push([t, open, hi, lo, close, +v])
    }

    if (candles.length < MIN_CANDLES) {
      report.skipped.push({ slug, why: `only ${candles.length} candles, needs ${MIN_CANDLES}` })
      continue
    }

    let nonMono = 0
    for (let i = 1; i < candles.length; i++) if (candles[i][0] < candles[i - 1][0]) nonMono++
    if (nonMono) {
      report.nonMonotonic.push({ slug, nonMono })
      candles.sort((a, b) => a[0] - b[0])
    }

    const id = file.replace(/\.js$/, "").replace(/_/g, "-")
    // JPY crosses quote to 3 decimals, every other major to 5.
    const digits = meta.pair.endsWith("JPY") ? 3 : 5
    datasets.push({ id, ...meta, digits, candles })
  }
}

const lines = []
lines.push("// GENERATED FILE — do not edit by hand.")
lines.push("// Source: Game-data-main/src/data/pairs/**/*.js (regenerate if that data changes).")
lines.push("//")
lines.push(`// ${datasets.length} usable datasets. Conversion mirrors their utils/csvparse.js:`)
lines.push("// dotted dates to ISO, parsed as UTC, rows with unparseable dates dropped.")
lines.push("")
lines.push('export type GameLevel = "easy" | "medium" | "hard"')
lines.push("")
lines.push("export type RawCandle = {")
lines.push("  /** Unix seconds, UTC. */")
lines.push("  t: number")
lines.push("  o: number")
lines.push("  h: number")
lines.push("  l: number")
lines.push("  c: number")
lines.push("  v: number")
lines.push("}")
lines.push("")
lines.push("export type GameDataset = {")
lines.push("  id: string")
lines.push("  pair: string")
lines.push("  level: GameLevel")
lines.push("  timeframe: string")
lines.push("  period: string")
lines.push("  /** Price decimals for this quote convention (3 for JPY crosses, else 5). */")
lines.push("  digits: number")
lines.push("  candles: RawCandle[]")
lines.push("}")
lines.push("")
lines.push("// [t, o, h, l, c, v]")
lines.push("type Tuple = [number, number, number, number, number, number]")
lines.push("")
lines.push("const rows = (t: Tuple[]): RawCandle[] =>")
lines.push("  t.map(([t0, o, h, l, c, v]) => ({ t: t0, o, h, l, c, v }))")
lines.push("")
lines.push("export const gameDatasets: GameDataset[] = [")
for (const d of datasets) {
  lines.push("  {")
  lines.push(`    id: "${d.id}",`)
  lines.push(`    pair: "${d.pair}",`)
  lines.push(`    level: "${d.level}",`)
  lines.push(`    timeframe: "${d.timeframe}",`)
  lines.push(`    period: "${d.period}",`)
  lines.push(`    digits: ${d.digits},`)
  lines.push("    candles: rows([")
  for (const c of d.candles) lines.push(`      [${c.join(", ")}],`)
  lines.push("    ]),")
  lines.push("  },")
}
lines.push("]")
lines.push("")

writeFileSync(OUT, lines.join("\n"), "utf8")

console.log(`wrote ${OUT}`)
console.log(`datasets: ${datasets.length}`)
console.log(`candles total: ${datasets.reduce((s, d) => s + d.candles.length, 0)}`)
console.log(`rows dropped (bad dates): ${report.droppedRows}`)
console.log(`candles repaired (impossible OHLC): ${report.repairedCandles}`)
console.log(`non-monotonic (re-sorted): ${JSON.stringify(report.nonMonotonic)}`)
console.log("skipped:")
for (const s of report.skipped) console.log(`  ${s.slug} — ${s.why}`)
const byLevel = {}
for (const d of datasets) byLevel[d.level] = (byLevel[d.level] ?? 0) + 1
console.log("per level:", JSON.stringify(byLevel))
const byPair = {}
for (const d of datasets) byPair[d.pair] = (byPair[d.pair] ?? 0) + 1
console.log("per pair:", JSON.stringify(byPair))
