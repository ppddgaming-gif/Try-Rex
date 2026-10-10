import { roundPrice } from "@/lib/demo/money"
import { stepBar, type Closure, type OpenTrade } from "@/lib/demo/fills"
import { M15 } from "@/lib/live/config"
import { closesAfter, lastAtOrBefore, type Bar } from "@/lib/live/market"
import { extremes, firstTouch, priceAt } from "@/lib/live/path"

// Lazy replay: no cron. Whenever an account is read, the server plays the M15
// candles since its last check up to now against the open position, so a
// stop loss hit while the player was away closes at the candle that hit it,
// not when they come back. Online and offline run this same function, so they
// can't disagree. Pure; times are the data's clock.
//
// Inside a candle the order of the high and the low is unknown, so the rule
// is the replay's: if SL and TP are both reached in the same M15 candle, SL
// came first (lib/demo/fills barFill). The forming candle follows its drawn
// path (lib/live/path), and a level only counts once the path has reached it.

export type LivePosition = {
  trade: OpenTrade
  /** Data time the position opened, to the second. */
  openedAt: number
}

export type ReplayInput = {
  pair: string
  digits: number
  position: LivePosition
  balance: number
  /** Spread in price units: a SELL position closes on the ask (bid + spread). */
  spread: number
  /** M15 bars of the pair, ascending, from at least the last check to past `now` (look-ahead for the market close). */
  bars: readonly Bar[]
  /**
   * Data time of the last check (the position's open time if never checked
   * since). SL or TP may have moved then, so nothing before it is replayed.
   */
  from: number
  now: number
  /** End of the account's data range: the market is treated as closing before it. */
  stopAt?: number
}

export type ReplayClose = Closure & {
  /** Data time of the M15 candle it closed in. */
  barT: number
  reason: Closure["reason"] | "market_close"
}

export type ReplayResult = {
  /** The position after the replay (swap updated), or null once closed. */
  open: OpenTrade | null
  close: ReplayClose | null
  stopOut: { price: number } | null
  balance: number
}

/**
 * The part of `bar` a position lives through, in the prices it closes on:
 * from second `s0` to the close, shifted by `shift` (SELL: the ask). Whole
 * candles use their own OHLC; the candle it opened in uses its path from the
 * entry second.
 */
function exposure(pair: string, bar: Bar, s0: number, shift: number, digits: number): Bar {
  const p = (v: number) => roundPrice(pair, v + shift)
  if (s0 <= 0) return { t: bar.t, o: p(bar.o), h: p(bar.h), l: p(bar.l), c: p(bar.c) }
  const { h, l } = extremes(pair, bar, s0, M15, digits)
  return { t: bar.t, o: p(priceAt(pair, bar, s0, digits)), h: p(h), l: p(l), c: p(bar.c) }
}

export function replay(input: ReplayInput): ReplayResult {
  const { pair, digits, bars, now, position } = input
  const shift = position.trade.side === "sell" ? input.spread : 0
  const stopAt = input.stopAt ?? Infinity
  let trade = position.trade
  let balance = input.balance

  const start = Math.max(input.from, position.openedAt)
  let i = lastAtOrBefore(bars, start)
  if (i < 0) i = 0
  // Swap was booked up to the candle of the last check: count nights from it.
  let prev: Bar | null = null

  for (; i < bars.length && bars[i].t <= now && bars[i].t < stopAt; i++) {
    const bar = bars[i]
    if (bar.t + M15 <= start) continue
    // The candle of the open or of the last check is lived through from that second on.
    const s0 = start > bar.t ? start - bar.t : 0
    const done = bar.t + M15 <= now
    const seg = exposure(pair, bar, s0, shift, digits)
    const last = done && closesAfter(bars, i, stopAt)
    const step = stepBar({ balance, trades: [trade], prev: prev ?? seg, bar: seg, last })
    prev = seg

    const closure = step.closures[0]
    if (!closure) {
      trade = step.open[0]
      balance = step.balance
      continue
    }

    if (!done) {
      // Forming candle: only a level the path has already reached closes it.
      const sNow = now - bar.t
      const buy = trade.side === "buy"
      const target = closure.price
      const losing = closure.reason === "sl" || closure.reason === "stop_out"
      const reached = (p: number) => (losing === buy ? p <= target : p >= target)
      const at = closure.price === seg.o ? s0 : firstTouch(pair, bar, s0, M15, digits, reached, shift)
      if (at === null || at > sNow) {
        // Not yet: keep the nights' swap, stay open.
        trade = { ...trade, swap: closure.swap }
        return { open: trade, close: null, stopOut: null, balance }
      }
    }

    const reason = closure.reason === "segment_end" ? "market_close" : closure.reason
    return { open: null, close: { ...closure, reason, barT: bar.t }, stopOut: step.stopOut, balance: step.balance }
  }

  return { open: trade, close: null, stopOut: null, balance }
}
