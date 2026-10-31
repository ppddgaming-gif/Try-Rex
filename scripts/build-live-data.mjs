// Packs the "DATA FOR LIVE" MT4 exports into small gzipped chunks for
// Supabase Storage (bucket `live-data`). M15 is the only source the live
// chart reads: M30, H1 and H4 are built from it on the server, so every
// timeframe agrees. This script first checks that claim against the exported
// M30/H1/H4 files and reports every candle that differs. Plain Node, no
// dependencies.
//
//   node scripts/build-live-data.mjs "<path to DATA FOR LIVE>" [outDir]
//
// Two input formats:
// - MT4 exports (no header): YYYY.MM.DD,HH:MM,open,high,low,close,volume.
//   Times are the broker's clock as exported; they are kept as is (treated as
//   UTC seconds), so hours and weekdays match what MT4 showed.
// - FXCM exports (EURAUD, GBPCAD, GBPNZD; header Datetime,Open,High,Low,Close):
//   YYYY-MM-DD HH:MM in real UTC, no volume. Their M30/H1/H4 are checked in
//   UTC, as the files were made, then every candle moves onto the MT4 broker
//   clock (brokerOffsetHours), so all nine pairs show the same moment at the
//   same data time. The script then proves it: EURAUD must track
//   EURUSD ÷ AUDUSD and GBPCAD must track GBPUSD × USDCAD, day by day.
//
// Output: <PAIR>/M15/<YYYY-MM>.json.gz plus manifest.json. Chunk format
// (gzipped JSON), decoded by lib/live/chunk.ts:
//   { pair, tf, digits, t: [first unix second, then deltas], o, h, l, c: integer prices × 10^digits, v }
// Never send a chunk to the browser: the server cuts slices from it.

import { createReadStream, mkdirSync, readdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { createInterface } from "node:readline"
import { gzipSync } from "node:zlib"

// The live chart's pairs (LIVE_PAIRS in lib/live/config.ts). The FXCM pairs come
// last: their cross-check reads the MT4 pairs' bars.
const PAIRS = ["USDCAD", "EURJPY", "AUDUSD", "USDJPY", "GBPUSD", "EURUSD", "EURAUD", "GBPCAD", "GBPNZD"]
const FXCM_PAIRS = new Set(["EURAUD", "GBPCAD", "GBPNZD"])
const CHECK = { M30: 1800, H1: 3600, H4: 14400 }

const HOUR = 3600
const at = (iso) => Date.parse(iso + "Z") / 1000

/** Last Sunday of a month, 01:00 UTC: when EU summer time starts or ends. */
function lastSunday(year, month) {
  const d = new Date(Date.UTC(year, month + 1, 0, 1))
  d.setUTCDate(d.getUTCDate() - d.getUTCDay())
  return d.getTime() / 1000
}

/**
 * Stretches where the MT4 export ran an hour off its own rule, measured by
 * fitting EURAUD and GBPCAD against EURUSD ÷ AUDUSD and GBPUSD × USDCAD hour by
 * hour (UTC, `to` exclusive).
 */
const OFFSET_EXCEPTIONS = [
  { from: at("2013-06-05T22:00"), to: at("2013-06-13T21:00"), hours: 3 },
  { from: at("2013-06-26T22:00"), to: at("2013-06-29T00:00"), hours: 3 },
  // The autumn 2017 switch came on Thursday 2 November, not at the weekend.
  { from: at("2017-10-29T01:00"), to: at("2017-11-02T14:30"), hours: 3 },
]

/**
 * Hours the MT4 broker clock ran ahead of UTC at a UTC moment: EU summer time,
 * on a base of +1 until the weekend of 22 November 2014 and +2 after it
 * (+1/+2, then the usual +2/+3), plus OFFSET_EXCEPTIONS.
 */
function brokerOffsetHours(t) {
  const hit = OFFSET_EXCEPTIONS.find((e) => t >= e.from && t < e.to)
  if (hit) return hit.hours
  const year = new Date(t * 1000).getUTCFullYear()
  const summer = t >= lastSunday(year, 2) && t < lastSunday(year, 9)
  return (t < at("2014-11-22T00:00") ? 1 : 2) + (summer ? 1 : 0)
}

const [, , src, out = "live-data-out"] = process.argv
if (!src) {
  console.error('Usage: node scripts/build-live-data.mjs "<DATA FOR LIVE folder>" [outDir]')
  process.exit(1)
}

/** Fallback when the data doesn't say: 3 decimals for JPY pairs, 5 for the rest. */
const fallbackDigits = (pair) => (pair.endsWith("JPY") ? 3 : 5)

/**
 * The decimals of a pair's prices, from the data: the most decimals among the
 * first 1,000 closes. Must match PAIR_CONFIG in lib/live/config.ts, which the
 * chart formats with.
 */
async function detectDigits(file, pair) {
  let most = -1
  let rows = 0
  const lines = createInterface({ input: createReadStream(file, "utf8"), crlfDelay: Infinity })
  for await (const raw of lines) {
    const fields = raw.replace(/^﻿/, "").trim().split(",")
    if (fields.length < 5 || fields[0] === "Datetime") continue
    // The close is the 4th price: field 5 in MT4 rows ("date,time,o,h,l,c,v"), field 4 in FXCM rows ("datetime,o,h,l,c").
    const close = (fields[0].includes(" ") ? fields[4] : fields[5])?.trim() ?? ""
    if (!Number.isFinite(Number(close)) || close === "") continue
    most = Math.max(most, close.includes(".") ? close.split(".")[1].length : 0)
    if (++rows >= 1000) break
  }
  lines.close()
  return most >= 0 ? most : fallbackDigits(pair)
}

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
    // FXCM rows carry "date time" in one field and no volume: split them into the MT4 shape.
    const fields = line.split(",")
    if (fields[0] === "Datetime") continue
    const [d, hm, o, h, l, c, v] = fields[0].includes(" ") ? [...fields[0].split(" "), ...fields.slice(1)] : fields
    const m = /^(\d{4})[.-](\d{2})[.-](\d{2})$/.exec(d ?? "")
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

/**
 * UTC candles moved onto the broker clock. Where the clock falls back an hour
 * mid-week, two candles land on one time: the earlier one is kept. FXCM opens
 * the week with New York, which on the broker clock is Sunday 23:00 in some
 * weeks; the MT4 pairs have no Sunday candles (their week opens Monday 00:00),
 * so that hour is dropped and every pair opens together.
 */
function toBrokerClock(bars) {
  const moved = bars.map((b) => ({ ...b, t: b.t + brokerOffsetHours(b.t) * HOUR })).sort((a, b) => a.t - b.t)
  const unique = moved.filter((b, i) => i === 0 || b.t !== moved[i - 1].t)
  const weekdays = unique.filter((b) => new Date(b.t * 1000).getUTCDay() !== 0)
  return { bars: weekdays, overlaps: moved.length - unique.length, sundays: unique.length - weekdays.length }
}

const CROSS_REFS = {
  EURAUD: { refs: ["EURUSD", "AUDUSD"], implied: ([eu, au]) => eu / au },
  GBPCAD: { refs: ["GBPUSD", "USDCAD"], implied: ([gu, uc]) => gu * uc },
}

/**
 * Day by day, the median relative gap between the shifted cross and
 * EURUSD ÷ AUDUSD (or GBPUSD × USDCAD) at the same broker time, as it stands
 * and an hour either way. A day is off the broker clock when an hour's shift
 * fits better. Thin holiday markets widen every gap, so no fixed threshold.
 */
function crossCheck(pair, digits, bars, closes) {
  const spec = CROSS_REFS[pair]
  if (!spec) return 0
  const refs = spec.refs.map((p) => closes.get(p))
  const days = new Map()
  for (const b of bars) {
    const day = Math.floor(b.t / 86_400)
    const gaps = days.get(day) ?? days.set(day, [[], [], []]).get(day)
    ;[-HOUR, 0, HOUR].forEach((shift, i) => {
      const prices = refs.map((r) => r?.get(b.t + shift))
      if (prices.every((p) => p !== undefined)) gaps[i].push(Math.abs((spec.implied(prices) * 10 ** digits) / b.c - 1))
    })
  }
  const median = (xs) => xs.sort((a, b) => a - b)[xs.length >> 1]
  const bad = []
  for (const [day, gaps] of days) {
    if (gaps.some((g) => g.length < 24)) continue
    const [early, now, late] = gaps.map(median)
    if (early < now || late < now) bad.push([day, early < late ? "-1h" : "+1h"])
  }
  const label = `${pair} vs ${spec.refs.join(" & ")}: ${days.size} days compared, ${bad.length} fit better an hour off`
  console.log(bad.length ? `MISMATCH ${label}` : `ok ${label}`)
  for (const [day, fit] of bad.slice(0, 10)) console.log("   ", new Date(day * 86_400_000).toISOString().slice(0, 10), "fits", fit)
  return bad.length
}

const monthOf = (t) => new Date(t * 1000).toISOString().slice(0, 7)

const manifest = { version: 2, built: new Date().toISOString(), pairs: {} }
let total = 0
let problems = 0
/** Closes by broker time, per MT4 pair, for crossCheck. */
const closes = new Map()

for (const pair of PAIRS) {
  const file = findFile(pair, "M15")
  if (!file) {
    console.log(`MISSING ${pair} M15`)
    problems++
    continue
  }
  const digits = await detectDigits(file, pair)
  if (digits !== fallbackDigits(pair)) console.log(`NOTE ${pair}: ${digits} decimals in the data; update PAIR_CONFIG in lib/live/config.ts`)
  const read = await readBars(file, digits)
  const { skipped, duplicates } = read

  // Timeframes are checked on the file's own clock, before any shift.
  for (const [tf, step] of Object.entries(CHECK)) {
    const other = findFile(pair, tf)
    if (!other) {
      console.log(`(no ${pair} ${tf} file to check against)`)
      continue
    }
    problems += verify(pair, tf, step, read.bars, (await readBars(other, digits)).bars)
  }

  let bars = read.bars
  if (FXCM_PAIRS.has(pair)) {
    const shifted = toBrokerClock(bars)
    bars = shifted.bars
    console.log(`${pair}: moved from UTC to the broker clock; dropped ${shifted.overlaps} candle(s) where it falls back mid-week and ${shifted.sundays} Sunday candle(s)`)
    problems += crossCheck(pair, digits, bars, closes)
  } else {
    closes.set(pair, new Map(bars.map((b) => [b.t, b.c / 10 ** digits])))
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
    clock: FXCM_PAIRS.has(pair) ? "fxcm-utc-shifted" : "mt4-broker",
  }
  console.log(`${pair} M15: ${bars.length} bars, ${Object.keys(months).length} monthly chunks, skipped ${skipped}, duplicates ${duplicates}\n`)
}

writeFileSync(join(out, "manifest.json"), JSON.stringify(manifest, null, 1))
console.log(`Wrote ${out}: ${(total / 1e6).toFixed(1)} MB of chunks`)
console.log(problems ? `${problems} problem(s) above.` : "Every M30/H1/H4 candle equals its M15 aggregate.")
