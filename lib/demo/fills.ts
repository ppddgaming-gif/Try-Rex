import { ACCOUNT } from "@/lib/demo/config"
import { accountFigures, grossPnl, pipsBetween, roundMoney, roundPrice, swapPerNight, type Side } from "@/lib/demo/money"

// What a new candle does to open trades: swap, SL/TP fills, stop out and the
// end of the segment. Pure; the server runs it on each candle, and every
// amount it books comes from lib/demo/money.

export type Bar = { t: number; o: number; h: number; l: number; c: number }

/** `market_close`: the live chart closed it at the last candle before the market closed. */
export type ExitReason = "sl" | "tp" | "manual" | "stop_out" | "segment_end" | "market_close"

export type OpenTrade = {
  id: string
  pair: string
  side: Side
  lot: number
  entry: number
  sl: number | null
  tp: number | null
  /** Spread + commission fixed at entry, positive USD. */
  costs: number
  /** Margin held since entry. */
  margin: number
  /** Accrued so far, signed. */
  swap: number
}

export type Closure = {
  id: string
  price: number
  reason: ExitReason
  pips: number
  gross: number
  /** gross − costs: the trade's own result, what the order panel predicted. */
  net: number
  /** Swap accrued while open, booked as its own row. */
  swap: number
}

/** Close `trade` at `price`. */
export function closeAt(trade: OpenTrade, price: number, reason: ExitReason): Closure {
  const gross = grossPnl(trade.pair, trade.side, trade.lot, trade.entry, price)
  return {
    id: trade.id,
    price,
    reason,
    pips: pipsBetween(trade.pair, trade.side, trade.entry, price),
    gross,
    net: roundMoney(gross - trade.costs),
    swap: trade.swap,
  }
}

/** Open P/L at `price`: gross, less the costs already fixed, plus swap. */
export const openPnl = (trade: OpenTrade, price: number) =>
  roundMoney(grossPnl(trade.pair, trade.side, trade.lot, trade.entry, price) - trade.costs + trade.swap)

/** The side panel's figures with every open trade valued at `price`. */
export const figuresAt = (balance: number, trades: OpenTrade[], price: number) =>
  accountFigures(
    balance,
    trades.map((t) => ({ pnl: openPnl(t, price), margin: t.margin })),
  )

/**
 * Where `trade` leaves the market during `bar`, if it does. A gap past SL or
 * TP fills at the open. Inside the candle the order is unknown, so when both
 * are touched SL is assumed to come first.
 */
export function barFill(trade: OpenTrade, bar: Bar): { price: number; reason: "sl" | "tp" } | null {
  const { sl, tp } = trade
  const buy = trade.side === "buy"
  const pastSl = (p: number) => sl !== null && (buy ? p <= sl : p >= sl)
  const pastTp = (p: number) => tp !== null && (buy ? p >= tp : p <= tp)

  if (pastSl(bar.o)) return { price: bar.o, reason: "sl" }
  if (pastTp(bar.o)) return { price: bar.o, reason: "tp" }
  if (pastSl(buy ? bar.l : bar.h)) return { price: sl!, reason: "sl" }
  if (pastTp(buy ? bar.h : bar.l)) return { price: tp!, reason: "tp" }
  return null
}

/** Whole UTC days between two candles: the nights a trade held across them pays swap for. */
export const nightsBetween = (fromT: number, toT: number) =>
  Math.max(0, Math.floor(toT / 86_400) - Math.floor(fromT / 86_400))

const marginLevel = (balance: number, trades: OpenTrade[], price: number) =>
  figuresAt(balance, trades, price).marginLevel ?? Infinity

/**
 * The price during `bar` where the margin level first reaches the stop-out
 * level, or null if it never does. Already there at the open means the open
 * (a gap); otherwise the level is traced from the open toward the candle's
 * worst extreme for these trades.
 */
export function stopOutPrice(balance: number, trades: OpenTrade[], bar: Bar): number | null {
  if (trades.length === 0) return null
  const limit = ACCOUNT.STOP_OUT_LEVEL
  const level = (p: number) => marginLevel(balance, trades, p)
  if (level(bar.o) <= limit) return bar.o
  const worst = level(bar.l) <= level(bar.h) ? bar.l : bar.h
  if (level(worst) > limit) return null
  let safe = bar.o
  let hit = worst
  for (let i = 0; i < 60; i++) {
    const mid = (safe + hit) / 2
    if (level(mid) <= limit) hit = mid
    else safe = mid
  }
  return roundPrice(trades[0].pair, hit)
}

export type StepResult = {
  closures: Closure[]
  /** Trades still open after the candle, swap updated. */
  open: OpenTrade[]
  /**
   * Balance after booking every closure (net + swap). Never below zero: a gap
   * past the stop-out level can lose more than the account holds, and the
   * difference is written off (negative balance protection).
   */
  balance: number
  /** Set when the margin level reached the stop-out level. */
  stopOut: { price: number } | null
}

const book = (balance: number, closures: Closure[]) =>
  roundMoney(closures.reduce((b, c) => b + c.net + c.swap, balance))

/**
 * One new candle, in the order that is fair to assume without seeing inside
 * it: swap for nights crossed, fills at the open (gaps), stop losses, stop
 * out, take profits. On the segment's last candle anything still open closes
 * at its close ("segmen habis").
 */
export function stepBar(input: { balance: number; trades: OpenTrade[]; prev: Bar; bar: Bar; last: boolean }): StepResult {
  const { bar } = input
  const nights = nightsBetween(input.prev.t, bar.t)
  let open = input.trades.map((t) => (nights > 0 ? { ...t, swap: roundMoney(t.swap + nights * swapPerNight(t.lot)) } : t))
  const closures: Closure[] = []
  const take = (keep: (t: OpenTrade) => Closure | null) => {
    const still: OpenTrade[] = []
    for (const t of open) {
      const c = keep(t)
      if (c) closures.push(c)
      else still.push(t)
    }
    open = still
  }

  // Gaps: price opened past SL or TP.
  take((t) => {
    const f = barFill(t, { ...bar, h: bar.o, l: bar.o })
    return f ? closeAt(t, f.price, f.reason) : null
  })
  // Stop losses and stop out, in the order price reaches them moving away
  // from the open: a stop out nearer the open than a trade's SL closes that
  // trade too.
  let stopOut: StepResult["stopOut"] = null
  for (;;) {
    const so = stopOutPrice(book(input.balance, closures), open, bar)
    const distance = (p: number) => Math.abs(p - bar.o)
    const slHit = open
      .filter((t) => barFill(t, bar)?.reason === "sl")
      .sort((a, b) => distance(a.sl!) - distance(b.sl!))[0]
    if (so !== null && (!slHit || distance(so) < distance(slHit.sl!))) {
      stopOut = { price: so }
      take((t) => closeAt(t, so, "stop_out"))
      break
    }
    if (!slHit) break
    take((t) => (t === slHit ? closeAt(t, t.sl!, "sl") : null))
  }

  // Take profits inside the candle.
  take((t) => {
    const f = barFill(t, bar)
    return f?.reason === "tp" ? closeAt(t, f.price, "tp") : null
  })

  if (input.last) take((t) => closeAt(t, bar.c, "segment_end"))

  return { closures, open, balance: Math.max(0, book(input.balance, closures)), stopOut }
}
