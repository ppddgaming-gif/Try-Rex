// Reading the "DATA FOR LIVE" CSV files for the assessment scripts. Plain
// Node, no dependencies. Only the six MT4 pairs are allowed in the
// assessment; their rows are `YYYY.MM.DD,HH:MM,o,h,l,c,v` on the MT4 broker
// clock, without a header.

import { readFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

export const ALLOWED_PAIRS = ["EURUSD", "USDJPY", "AUDUSD", "GBPUSD", "USDCAD", "EURJPY"]
export const FORBIDDEN_PAIRS = ["GBPNZD", "GBPCAD", "EURAUD"]
export const TF_SECONDS = { M15: 900, M30: 1800, H1: 3600, H4: 14400 }
/** A gap this long between two candles means the market closed (weekend, holiday). Same as MARKET.CLOSE_GAP_SECONDS in lib/live/config.ts. */
export const CLOSE_GAP = 6 * 3600
/** The data ends here (last candle Friday 4 March 2022). */
export const DATA_END_UTC = Date.parse("2022-03-31T23:59:59Z") / 1000

const here = dirname(fileURLToPath(import.meta.url))
export const REPO = resolve(here, "../../..")
export const DATA_DIR = process.env.DATA_FOR_LIVE ?? resolve(REPO, "..", "DATA FOR LIVE")

const HOUR = 3600
const at = (iso) => Date.parse(iso + "Z") / 1000

// Copied from scripts/build-live-data.mjs (not exported there): the MT4
// broker clock is EU summer time on a base of +1 until 22 Nov 2014 and +2
// after, plus three measured exceptions.
function lastSunday(year, month) {
  const d = new Date(Date.UTC(year, month + 1, 0, 1))
  d.setUTCDate(d.getUTCDate() - d.getUTCDay())
  return d.getTime() / 1000
}
const OFFSET_EXCEPTIONS = [
  { from: at("2013-06-05T22:00"), to: at("2013-06-13T21:00"), hours: 3 },
  { from: at("2013-06-26T22:00"), to: at("2013-06-29T00:00"), hours: 3 },
  { from: at("2017-10-29T01:00"), to: at("2017-11-02T14:30"), hours: 3 },
]
/** Hours the broker clock runs ahead of UTC at UTC moment `t`. */
export function brokerOffsetHours(t) {
  const hit = OFFSET_EXCEPTIONS.find((e) => t >= e.from && t < e.to)
  if (hit) return hit.hours
  const year = new Date(t * 1000).getUTCFullYear()
  const summer = t >= lastSunday(year, 2) && t < lastSunday(year, 9)
  return (t < at("2014-11-22T00:00") ? 1 : 2) + (summer ? 1 : 0)
}
/** Broker-clock seconds (as written in the CSV, read as if UTC) to real UTC seconds. */
export function brokerToUtc(b) {
  let u = b - 2 * HOUR
  for (let i = 0; i < 3; i++) u = b - brokerOffsetHours(u) * HOUR
  return u
}
export const utcToBroker = (u) => u + brokerOffsetHours(u) * HOUR

export const iso = (t) => new Date(t * 1000).toISOString().slice(0, 16).replace("T", " ")
export const pipSize = (pair) => (pair.endsWith("JPY") ? 0.01 : 0.0001)

const cache = new Map()
/** Candles of one pair and timeframe: { t (broker clock), o, h, l, c }, oldest first. */
export function load(pair, tf) {
  const key = `${pair}/${tf}`
  if (cache.has(key)) return cache.get(key)
  const text = readFileSync(join(DATA_DIR, pair, `${pair}_${tf}.csv`), "utf8")
  const bars = []
  for (const line of text.split(/\r?\n/)) {
    if (!line) continue
    const [d, hm, o, h, l, c] = line.split(",")
    const t = Date.parse(`${d.replace(/\./g, "-")}T${hm}:00Z`) / 1000
    bars.push({ t, o: +o, h: +h, l: +l, c: +c })
  }
  cache.set(key, bars)
  return bars
}

/** Index of the candle opening exactly at broker time `t`, or -1. */
export function indexAt(bars, t) {
  let lo = 0
  let hi = bars.length - 1
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    if (bars[mid].t === t) return mid
    if (bars[mid].t < t) lo = mid + 1
    else hi = mid - 1
  }
  return -1
}

/** Wilder ATR(n) at candle i (in price units), from the candles up to i. */
export function atrAt(bars, i, n = 14) {
  const from = Math.max(1, i - 10 * n)
  let atr = null
  const trs = []
  for (let k = from; k <= i; k++) {
    const b = bars[k]
    const pc = bars[k - 1].c
    const tr = Math.max(b.h - b.l, Math.abs(b.h - pc), Math.abs(b.l - pc))
    if (atr === null) {
      trs.push(tr)
      if (trs.length === n) atr = trs.reduce((a, x) => a + x, 0) / n
    } else atr = (atr * (n - 1) + tr) / n
  }
  return atr
}

/** EMA(n) of closes, value at every index (null until n closes). */
export function ema(bars, n) {
  const out = new Array(bars.length).fill(null)
  const k = 2 / (n + 1)
  let sum = 0
  let v = null
  for (let i = 0; i < bars.length; i++) {
    if (v === null) {
      sum += bars[i].c
      if (i === n - 1) v = sum / n
    } else v = bars[i].c * k + v * (1 - k)
    out[i] = v
  }
  return out
}

/** Swing highs and lows (n candles each side) among candles from..to. */
export function swings(bars, from, to, n = 3) {
  const out = []
  for (let i = from + n; i <= to - n; i++) {
    let hi = true
    let lo = true
    for (let k = 1; k <= n; k++) {
      if (bars[i - k].h >= bars[i].h || bars[i + k].h > bars[i].h) hi = false
      if (bars[i - k].l <= bars[i].l || bars[i + k].l < bars[i].l) lo = false
    }
    if (hi) out.push({ i, kind: "high", p: bars[i].h })
    if (lo) out.push({ i, kind: "low", p: bars[i].l })
  }
  return out
}

/** Every market close (gap of CLOSE_GAP or more) between candles a..b: [index before the gap]. */
export function closesBetween(bars, a, b) {
  const out = []
  for (let i = a; i < b; i++) if (bars[i + 1].t - bars[i].t >= CLOSE_GAP) out.push(i)
  return out
}
