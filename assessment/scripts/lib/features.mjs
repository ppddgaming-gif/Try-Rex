// What the chart shows before "Mulai", computed from the candles only, so a
// scenario's stated condition (trend up, trend down, sideways) and its rubric
// numbers (ATR, invalidation level, suggested lot) come from the data, not
// from the author. Nothing after "Mulai" is read here.

import { atrAt, closesBetween, ema, indexAt, load, pipSize, swings, TF_SECONDS } from "./data.mjs"

export const CONTEXT = 100

/** USD value of 1 pip on 1 lot of `pair` at candle i (USD account). */
export function pipValueUsd(pair, price, at) {
  if (pair.endsWith("USD")) return 10
  if (pair.startsWith("USD")) return (pipSize(pair) * 100_000) / price
  // EURJPY: 1,000 JPY per pip, converted at USDJPY of the same moment.
  const uj = load("USDJPY", "M15")
  let lo = 0
  let hi = uj.length - 1
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1
    if (uj[mid].t <= at) lo = mid
    else hi = mid - 1
  }
  return 1000 / uj[lo].c
}

/**
 * The context of a window: the CONTEXT candles before candle `s` ("Mulai").
 * Trend from EMA 20/50 and swing structure, volatility from ATR(14).
 */
export function contextOf(pair, tf, s) {
  const bars = load(pair, tf)
  const pip = pipSize(pair)
  const from = s - CONTEXT
  const last = s - 1
  const e20 = ema(bars.slice(0, s), 20)
  const e50 = ema(bars.slice(0, s), 50)
  const atr = atrAt(bars, last)
  const slope50 = (e50[last] - e50[last - 20]) / 20 / atr
  let crosses = 0
  for (let i = last - 60; i < last; i++) if (Math.sign(e20[i] - e50[i]) !== Math.sign(e20[i + 1] - e50[i + 1])) crosses++
  const sw = swings(bars, from, last, 3)
  const highs = sw.filter((x) => x.kind === "high").slice(-2)
  const lows = sw.filter((x) => x.kind === "low").slice(-2)
  const hh = highs.length === 2 && highs[1].p > highs[0].p
  const hl = lows.length === 2 && lows[1].p > lows[0].p
  const lh = highs.length === 2 && highs[1].p < highs[0].p
  const ll = lows.length === 2 && lows[1].p < lows[0].p
  let hiC = -Infinity
  let loC = Infinity
  for (let i = from; i <= last; i++) {
    hiC = Math.max(hiC, bars[i].h)
    loC = Math.min(loC, bars[i].l)
  }
  const rangeAtr = (hiC - loC) / atr
  const up = e20[last] > e50[last] && slope50 > 0.03 && hh && hl
  const down = e20[last] < e50[last] && slope50 < -0.03 && lh && ll
  const sideways = Math.abs(slope50) <= 0.03 && crosses >= 1 && rangeAtr <= 25
  const trend = up ? "up" : down ? "down" : sideways ? "sideways" : "mixed"
  const price = bars[last].c
  return {
    trend,
    price,
    atr_pips: +(atr / pip).toFixed(1),
    ema20: +e20[last].toFixed(pip === 0.01 ? 3 : 5),
    ema50: +e50[last].toFixed(pip === 0.01 ? 3 : 5),
    slope50_atr: +slope50.toFixed(3),
    ema_crosses_60: crosses,
    range_atr: +rangeAtr.toFixed(1),
    structure: `${hh ? "HH" : lh ? "LH" : "-"}/${hl ? "HL" : ll ? "LL" : "-"}`,
    last_swing_low: lows.length ? lows[lows.length - 1].p : null,
    last_swing_high: highs.length ? highs[highs.length - 1].p : null,
    context_high: hiC,
    context_low: loC,
    pip_value_usd_per_lot: +pipValueUsd(pair, price, bars[last].t).toFixed(4),
  }
}

/** The window's candle indexes and whether the trading part crosses a market close. */
export function windowOf(pair, tf, startT, after) {
  const bars = load(pair, tf)
  const s = indexAt(bars, startT)
  if (s < CONTEXT) return null
  const e = s + after - 1
  if (e >= bars.length) return null
  return { s, e, from: s - CONTEXT, closes: closesBetween(bars, s, e), step: TF_SECONDS[tf] }
}
