// Checks that a briefing's claims show in the candles. A claimed event must
// leave a footprint at its time: the price range in the hours after it is
// several times the range of an ordinary window of the same length in the ten
// trading days before. Pure functions over lib/data.mjs.

import { brokerToUtc, iso, load, pipSize, utcToBroker } from "./data.mjs"

const M15 = 900

/** Range (high − low) of M15 candles opening in [from, to) broker time. */
function rangeOf(bars, from, to) {
  let h = -Infinity
  let l = Infinity
  let n = 0
  for (const b of bars) {
    if (b.t < from) continue
    if (b.t >= to) break
    h = Math.max(h, b.h)
    l = Math.min(l, b.l)
    n++
  }
  return n ? { range: h - l, n } : null
}

/**
 * An event at UTC `utc` (ISO, "2016-06-24T00:00"): the M15 range from 15
 * minutes before to `minutes` after, against the mean range of every
 * same-length window of the previous 10 calendar-week-days that has candles.
 */
export function spike(pair, utc, minutes = 180, minRatio = 2.5) {
  const bars = load(pair, "M15")
  const u = Date.parse(utc + "Z") / 1000
  const from = utcToBroker(u) - M15
  const len = (minutes + 15) * 60
  const ev = rangeOf(bars, from, from + len)
  if (!ev) return { ok: false, why: "no candles at the event time" }
  const ordinary = []
  for (let s = from - 14 * 86400; s + len <= from; s += len) {
    const r = rangeOf(bars, s, s + len)
    if (r && r.n >= (len / M15) * 0.8) ordinary.push(r.range)
  }
  const mean = ordinary.reduce((a, x) => a + x, 0) / ordinary.length
  const ratio = ev.range / mean
  const pip = pipSize(pair)
  return {
    ok: ratio >= minRatio,
    pair,
    utc,
    broker: iso(from + M15),
    eventPips: +(ev.range / pip).toFixed(1),
    ordinaryPips: +(mean / pip).toFixed(1),
    ratio: +ratio.toFixed(2),
    windows: ordinary.length,
  }
}

/** Net change over `days` calendar days before UTC `utc`, in pips, on H1 closes. */
export function drift(pair, utc, days) {
  const bars = load(pair, "H1")
  const end = utcToBroker(Date.parse(utc + "Z") / 1000)
  const startT = end - days * 86400
  const a = bars.find((b) => b.t >= startT)
  let z = null
  for (const b of bars) {
    if (b.t > end) break
    z = b
  }
  return { pips: +((z.c - a.c) / pipSize(pair)).toFixed(1), from: iso(brokerToUtc(a.t)), to: iso(brokerToUtc(z.t)) }
}
