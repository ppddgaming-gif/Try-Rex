import { BUST_REFUSAL, type Refusal } from "@/lib/demo/actions"
import { COSTS, PLAN, STAGES, type StageNumber } from "@/lib/demo/config"
import { isRevenge } from "@/lib/demo/disiplin"
import { closeAt, figuresAt, type Closure } from "@/lib/demo/fills"
import { instrument } from "@/lib/demo/instruments"
import { roundPrice, type Side } from "@/lib/demo/money"
import { levelPrice, orderProblems, quoteOrder, type OrderInput } from "@/lib/demo/orders"
import { accountBust, toOpenTrade, type TradingState } from "@/lib/demo/state"
import type { DemoEvent } from "@/lib/demo/view"
import { msg } from "@/lib/i18n/translator"
import { LIVE, M15 } from "@/lib/live/config"
import type { ReasonId } from "@/lib/reasons"

// Orders on the live chart. The price is the server's: the bid from the
// forming candle's path at the moment the order arrives, plus a fixed spread
// per pair for a BUY (it fills at the ask). Nothing about price comes from
// the request. Pure; the server-only engine supplies the market.

/** Where the market stands for one pair, worked out on the server at `real` (unix seconds). */
export type LiveMarket = {
  pair: string
  /** The market has a forming M15 candle right now. */
  open: boolean
  bid: number
  /** Real unix seconds of this moment. */
  real: number
  /** Average M15 range of the last candles: Rex's "SL too close" yardstick. */
  rangeAvg: number
}

/** The pair's fixed spread in price units, or null when it isn't configured. */
export function spreadPrice(pair: string) {
  const pips = COSTS.SPREAD_PIPS[pair]
  return pips === undefined ? null : roundPrice(pair, pips * instrument(pair).pipSize)
}

/** The ask: bid + spread. */
export const askOf = (pair: string, bid: number) => roundPrice(pair, bid + (spreadPrice(pair) ?? 0))

/** BUY fills at the ask, SELL at the bid. */
export const fillPrice = (pair: string, side: Side, bid: number) => (side === "buy" ? askOf(pair, bid) : bid)

/** A position closes on the other side: BUY on the bid, SELL on the ask. */
export const exitPrice = (pair: string, side: Side, bid: number) => (side === "buy" ? bid : askOf(pair, bid))

/** The account's candle clock on the live chart: real M15 candles since 1970. */
export const liveClock = (real: number) => Math.floor(real / M15)

/** A live trade as the database stores it; the trade number comes from the database. */
export type NewLiveTrade = {
  pair: string
  side: Side
  lot: number
  stage: StageNumber
  reasons: ReasonId[]
  entry_price: number
  /** Real unix seconds of the fill. */
  entry_index: number
  opened_clock: number
  sl: number | null
  tp: number | null
  balance_at_entry: number
  margin: number
  spread: number
  commission: number
  risk_amount: number | null
  risk_pct: number | null
  reward_risk: number | null
  range_avg: number
  revenge: boolean
}

/** The order panel's numbers for the live chart: the same functions, with the spread in the price. */
export function quoteLive(state: Pick<TradingState, "account" | "open">, market: Pick<LiveMarket, "pair" | "bid">, side: Side, input: Omit<OrderInput, "side" | "reasons">) {
  const entry = fillPrice(market.pair, side, market.bid)
  const figures = figuresAt(state.account.balance, [], entry)
  return quoteOrder({
    pair: market.pair,
    side,
    lot: input.lot,
    entry,
    slPips: input.slPips,
    tpPips: input.tpPips,
    balance: state.account.balance,
    freeMargin: figures.freeMargin,
    spreadInPrice: true,
  })
}

/** A market order now. SL and TP are always required here, and only one position may be open. */
export function planLiveOrder(state: TradingState, input: OrderInput, market: LiveMarket): { trade: NewLiveTrade; events: DemoEvent[] } | Refusal {
  if (accountBust(state)) return BUST_REFUSAL
  if (!market.open) return { error: msg("errors.marketClosed") }
  if (spreadPrice(market.pair) === null) return { error: msg("errors.pairNotQuoted", { pair: market.pair }) }
  if (state.open.length >= LIVE.MAX_OPEN) return { error: msg("errors.onePosition") }

  const quote = quoteLive(state, market, input.side, input)
  const problems = orderProblems(
    input,
    { pair: market.pair, stage: state.stage, openTrades: state.open.length, candlesLeft: Number.MAX_SAFE_INTEGER, requireSlTp: true },
    quote,
  )
  if (problems.length > 0) return { error: problems[0].message }

  // SL must still be on the losing side of the price the position closes on
  // (a BUY's SL below the bid), or it would close the moment it opened.
  const exit = exitPrice(market.pair, input.side, market.bid)
  const buy = input.side === "buy"
  if (quote.sl !== null && (buy ? quote.sl >= exit : quote.sl <= exit)) {
    return { error: msg("errors.levelSide", { name: "SL", side: buy ? "below" : "above" }) }
  }
  if (quote.tp !== null && (buy ? quote.tp <= exit : quote.tp >= exit)) {
    return { error: msg("errors.levelSide", { name: "TP", side: buy ? "above" : "below" }) }
  }

  const clock = liveClock(market.real)
  const losses = state.history
    .filter((h) => h.accountId === state.account.id)
    .map((h) => ({ lot: h.lot, closedClock: h.closedClock, result: h.net + h.swap }))
  const revenge = isRevenge(quote.lot, clock, losses, LIVE.REVENGE_WINDOW_M15)
  const { digits } = instrument(market.pair)

  return {
    trade: {
      pair: market.pair,
      side: input.side,
      lot: quote.lot,
      stage: state.stage,
      reasons: input.reasons as ReasonId[],
      entry_price: fillPrice(market.pair, input.side, market.bid),
      entry_index: market.real,
      opened_clock: clock,
      sl: quote.sl,
      tp: quote.tp,
      balance_at_entry: state.account.balance,
      margin: quote.margin,
      spread: quote.costs.spread,
      commission: quote.costs.commission,
      risk_amount: quote.loss,
      risk_pct: quote.lossPct,
      reward_risk: quote.rewardRisk,
      range_avg: Number(market.rangeAvg.toFixed(digits + 1)),
      revenge,
    },
    events: [{ kind: "opened", number: 0, revenge, noTp: false, riskAbove: quote.risk === "above" || quote.risk === "danger" }],
  }
}

/** Manual close at the price the position closes on now. */
export function planLiveClose(state: TradingState, tradeId: string, market: LiveMarket): Closure | Refusal {
  const row = state.open.find((t) => t.id === tradeId)
  if (!row) return { error: msg("errors.tradeClosed") }
  if (row.pair !== market.pair) return { error: msg("errors.tradeClosed") }
  if (!market.open) return { error: msg("errors.marketClosed") }
  return closeAt(toOpenTrade(row), exitPrice(row.pair, row.side, market.bid), "manual")
}

export type LiveModify = { tradeId: string; field: "sl" | "tp"; price: number | null; atIndex: number }

/** Move SL or TP (never remove them here: the live chart requires both). Every change is kept. */
export function planLiveModify(
  state: TradingState,
  tradeId: string,
  field: "sl" | "tp",
  pips: number | null,
  market: LiveMarket,
): LiveModify | Refusal {
  const row = state.open.find((t) => t.id === tradeId)
  if (!row || row.pair !== market.pair) return { error: msg("errors.tradeClosed") }
  const name = field === "sl" ? "SL" : "TP"
  if (pips === null) return { error: msg("errors.slTpRequiredLive") }
  const tenths = Math.round(pips * 10)
  const valid =
    Number.isFinite(pips) &&
    Math.abs(tenths - pips * 10) < 1e-9 &&
    Math.abs(pips) <= PLAN.MAX_DISTANCE_PIPS &&
    (field === "sl" || pips > 0)
  if (!valid) return { error: msg("errors.distanceInvalid", { name }) }

  const price = levelPrice(row.pair, row.side, row.entryPrice, field, pips)
  if (price === (field === "sl" ? row.sl : row.tp)) return { error: msg("errors.noChange") }
  const now = exitPrice(row.pair, row.side, market.bid)
  const buy = row.side === "buy"
  const lossSide = field === "sl"
  const ok = lossSide === buy ? price < now : price > now
  if (!ok) return { error: msg("errors.levelSide", { name, side: lossSide === buy ? "below" : "above" }) }
  return { tradeId, field, price, atIndex: liveClock(market.real) }
}

/** Stage rules the live chart narrows: one position at a time, SL and TP always. */
export const liveStage = (stage: StageNumber) => ({ ...STAGES[stage], maxOpenTrades: LIVE.MAX_OPEN, slTpRequired: true })

const ORDER_KEYS = new Set(["pair", "side", "lot", "slPips", "tpPips", "reasons"])

/**
 * The order route's body: the pair and the plan, nothing else. A body that
 * tries to carry anything more (a price, an entry, a time) is refused
 * outright rather than ignored, so a client can never even appear to choose
 * its fill.
 */
export function parseOrderBody(body: Record<string, unknown>): { pair: string; input: OrderInput } | null {
  if (Object.keys(body).some((k) => !ORDER_KEYS.has(k))) return null
  const { pair, side, lot, slPips, tpPips, reasons } = body
  const distance = (v: unknown) => (v === null ? null : typeof v === "number" && Number.isFinite(v) ? v : undefined)
  const sl = distance(slPips)
  const tp = distance(tpPips)
  if (
    typeof pair !== "string" ||
    !/^[A-Z]{6}$/.test(pair) ||
    (side !== "buy" && side !== "sell") ||
    typeof lot !== "number" ||
    !Number.isFinite(lot) ||
    sl === undefined ||
    tp === undefined ||
    !Array.isArray(reasons) ||
    !reasons.every((r) => typeof r === "string")
  ) {
    return null
  }
  return { pair, input: { side, lot, slPips: sl, tpPips: tp, reasons: reasons as string[] } }
}
