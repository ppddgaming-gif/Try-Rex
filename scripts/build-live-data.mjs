// Packs the "DATA FOR LIVE" MT4 exports into small gzipped chunks for
// Supabase Storage (bucket `live-data`). M15 is the only source the live
// chart reads: M30, H1 and H4 are built from it on the server, so every
// timeframe agrees. This script first checks that claim against the exported
// M30/H1/H4 files and reports every candle that differs. Plain Node, no
// dependencies.
//
//   node scripts/build-live-data.mjs "<path to DATA FOR LIVE>" [outDir]
//
// Input rows (no header): YYYY.MM.DD,HH:MM,open,high,low,close,volume
// Times are the broker's clock as exported; they are kept as is (treated as
// UTC seconds), so hours and weekdays match what MT4 showed.
//
// Output: <PAIR>/M15/<YYYY-MM>.json.gz plus manifest.json. Chunk format
// (gzipped JSON), decoded by lib/live/chunk.ts:
//   { pair, tf, digits, t: [first unix second, then deltas], o, h, l, c: integer prices × 10^digits, v }
// Never send a chunk to the browser: the server cuts slices from it.

import { createReadStream, mkdirSync, readdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { createInterface } from "node:readline"
import { gzipSync } from "node:zlib"

// The live chart's pairs (LIVE_PAIRS in lib/live/config.ts). EURAUD, GBPCAD and
// GBPNZD are left out: their exports are computed or synthetic, not real data.
const PAIRS = ["USDCAD", "EURJPY", "AUDUSD", "USDJPY", "GBPUSD", "EURUSD"]
const CHECK = { M30: 1800, H1: 3600, H4: 14400 }

const [, , src, out = "live-data-out"] = process.argv
if (!src) {
  console.error('Usage: node scripts/build-live-data.mjs "<DATA FOR LIVE folder>" [outDir]')
  process.exit(1)
}

const digitsOf = (pair) => (pair.endsWith("JPY") ? 3 : 5)

/** File for a pair and timeframe: "EURUSD_H4.csv", or with a "_SYNTHETIC" suffix. */
function findFile(pair, tf) {
  const dir = join(src, pair)
  const name = readdirSync(dir).find((f) => f.toUpperCase().startsWith(`${pair}_${tf}`) && f.toLowerCase().endsWith(".csv"))
  return name ? join(dir, name) : null
}

async function readBars(file, digits) {
  const scale = 10 ** digits
  const bars = []
  let skipped = 0
  const lines = createInterface({ input: createReadStream(file, "utf8"), crlfDelay: Infinity })
  for await (const raw of lines) {
    const line = raw.replace(/^﻿/, "").trim()
    if (!line) continue
    const [d, hm, o, h, l, c, v] = line.split(",")
    const m = /^(\d{4})\.(\d{2})\.(\d{2})$/.exec(d ?? "")
    const t = /^(\d{2}):(\d{2})$/.exec(hm ?? "")
    const nums = [o, h, l, c].map(Number)
    if (!m || !t || nums.some((n) => !Number.isFinite(n))) {
      skipped++
      continue
    }
    const time = Date.UTC(+m[1], +m[2] - 1, +m[3], +t[1], +t[2]) / 1000
    const [io, ih, il, ic] = nums.map((n) => Math.round(n * scale))
    // A wick must contain its body; clamp rather than drop.
    bars.push({ t: time, o: io, h: Math.max(ih, io, ic), l: Math.min(il, io, ic), c: ic, v: Math.max(0, Math.round(Number(v) || 0)) })
  }
  bars.sort((a, b) => a.t - b.t)
  const unique = bars.filter((b, i) => i === 0 || b.t !== bars[i - 1].t)
  return { bars: unique, skipped, duplicates: bars.length - unique.length }
}

/** M15 grouped into `step` candles, as lib/live/market.ts aggregate() does. */
function aggregate(m15, step) {
  const out = new Map()
  for (const b of m15) {
    const t = b.t - (b.t % step)
    const cur = out.get(t)
    if (cur) {
      cur.h = Math.max(cur.h, b.h)
      cur.l = Math.min(cur.l, b.l)
      cur.c = b.c
    } else out.set(t, { t, o: b.o, h: b.h, l: b.l, c: b.c })
  }
  return out
}

/** Compare the aggregate with the exported file where both cover the same span. */
function verify(pair, tf, step, m15, file) {
  const agg = aggregate(m15, step)
  const start = Math.max(file[0].t, m15[0].t)
  const end = Math.min(file[file.length - 1].t, m15[m15.length - 1].t - step)
  let compared = 0
  const mismatches = []
  for (const f of file) {
    if (f.t < start || f.t > end) continue
    compared++
    const a = agg.get(f.t)
    if (!a || a.o !== f.o || a.h !== f.h || a.l !== f.l || a.c !== f.c) mismatches.push({ t: f.t, file: f, m15: a ?? null })
  }
  const inFile = new Set(file.map((f) => f.t))
  const extra = [...agg.keys()].filter((t) => t >= start && t <= end && !inFile.has(t)).length
  const label = `${pair} ${tf}: ${compared} candles compared, ${mismatches.length} differ, ${extra} only in M15`
  console.log(mismatches.length || extra ? `MISMATCH ${label}` : `ok ${label}`)
  for (const m of mismatches.slice(0, 5)) console.log("   ", new Date(m.t * 1000).toISOString(), JSON.stringify(m.file), JSON.stringify(m.m15))
  return mismatches.length + extra
}

function encode(pair, digits, bars) {
  const t = bars.map((b, i) => (i === 0 ? b.t : b.t - bars[i - 1].t))
  const pick = (k) => bars.map((b) => b[k])
  return gzipSync(JSON.stringify({ pair, tf: "M15", digits, t, o: pick("o"), h: pick("h"), l: pick("l"), c: pick("c"), v: pick("v") }), { level: 9 })
}

const monthOf = (t) => new Date(t * 1000).toISOString().slice(0, 7)

const manifest = { version: 2, built: new Date().toISOString(), pairs: {} }
let total = 0
let problems = 0

for (const pair of PAIRS) {
  const digits = digitsOf(pair)
  const file = findFile(pair, "M15")
  if (!file) {
    console.log(`MISSING ${pair} M15`)
    problems++
    continue
  }
  const { bars, skipped, duplicates } = await readBars(file, digits)

  for (const [tf, step] of Object.entries(CHECK)) {
    const other = findFile(pair, tf)
    if (!other) {
      console.log(`(no ${pair} ${tf} file to check against)`)
      continue
    }
    problems += verify(pair, tf, step, bars, (await readBars(other, digits)).bars)
  }

  const months = {}
  for (const b of bars) (months[monthOf(b.t)] ??= []).push(b)
  const dir = join(out, pair, "M15")
  mkdirSync(dir, { recursive: true })
  for (const [month, list] of Object.entries(months)) {
    const buf = encode(pair, digits, list)
    writeFileSync(join(dir, `${month}.json.gz`), buf)
    total += buf.length
  }
  manifest.pairs[pair] = {
    digits,
    first: bars[0].t,
    last: bars[bars.length - 1].t,
    bars: bars.length,
    months: Object.keys(months),
    source: file.split(/[\\/]/).pop(),
  }
  console.log(`${pair} M15: ${bars.length} bars, ${Object.keys(months).length} monthly chunks, skipped ${skipped}, duplicates ${duplicates}\n`)
}

writeFileSync(join(out, "manifest.json"), JSON.stringify(manifest, null, 1))
console.log(`Wrote ${out}: ${(total / 1e6).toFixed(1)} MB of chunks`)
console.log(problems ? `${problems} problem(s) above.` : "Every M30/H1/H4 candle equals its M15 aggregate.")
