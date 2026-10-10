// Packs the "DATA FOR LIVE" MT4 exports into small gzipped chunks for
// Supabase Storage (bucket `live-data`): one file per pair, timeframe and
// calendar year, plus manifest.json. Plain Node, no dependencies.
//
//   node scripts/build-live-data.mjs "<path to DATA FOR LIVE>" [outDir]
//
// Input rows (no header): YYYY.MM.DD,HH:MM,open,high,low,close,volume
// Times are the broker's clock as exported; they are kept as is (treated as
// UTC seconds), so hours and weekdays match what MT4 showed.
//
// Chunk format (gzipped JSON), decoded by lib/live/chunk.ts:
//   { pair, tf, digits, t: [first unix second, then deltas], o, h, l, c: integer prices × 10^digits, v }
// Never send a chunk to the browser: the server cuts slices from it.

import { createReadStream, mkdirSync, readdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { createInterface } from "node:readline"
import { gzipSync } from "node:zlib"

const PAIRS = ["GBPNZD", "EURAUD", "GBPCAD", "USDCAD", "EURJPY", "AUDUSD", "USDJPY", "GBPUSD", "EURUSD"]
const TIMEFRAMES = { M15: 900, M30: 1800, H1: 3600, H4: 14400 }

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

function encode(pair, tf, digits, bars) {
  const t = bars.map((b, i) => (i === 0 ? b.t : b.t - bars[i - 1].t))
  const pick = (k) => bars.map((b) => b[k])
  return gzipSync(JSON.stringify({ pair, tf, digits, t, o: pick("o"), h: pick("h"), l: pick("l"), c: pick("c"), v: pick("v") }), { level: 9 })
}

const manifest = { version: 1, built: new Date().toISOString(), pairs: {} }
let total = 0

for (const pair of PAIRS) {
  manifest.pairs[pair] = { digits: digitsOf(pair), timeframes: {} }
  for (const tf of Object.keys(TIMEFRAMES)) {
    const file = findFile(pair, tf)
    if (!file) {
      console.log(`MISSING ${pair} ${tf}`)
      continue
    }
    const { bars, skipped, duplicates } = await readBars(file, digitsOf(pair))
    const years = {}
    for (const b of bars) (years[new Date(b.t * 1000).getUTCFullYear()] ??= []).push(b)
    const dir = join(out, pair, tf)
    mkdirSync(dir, { recursive: true })
    for (const [year, list] of Object.entries(years)) {
      const buf = encode(pair, tf, digitsOf(pair), list)
      writeFileSync(join(dir, `${year}.json.gz`), buf)
      total += buf.length
    }
    manifest.pairs[pair].timeframes[tf] = {
      seconds: TIMEFRAMES[tf],
      first: bars[0].t,
      last: bars[bars.length - 1].t,
      bars: bars.length,
      years: Object.keys(years).map(Number),
      source: file.split(/[\\/]/).pop(),
    }
    console.log(`${pair} ${tf}: ${bars.length} bars, ${Object.keys(years).length} chunks, skipped ${skipped}, duplicates ${duplicates}`)
  }
}

writeFileSync(join(out, "manifest.json"), JSON.stringify(manifest, null, 1))
console.log(`\nWrote ${out}: ${(total / 1e6).toFixed(1)} MB of chunks`)
