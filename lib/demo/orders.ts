import { ACCOUNT, DISIPLIN, PLAN, REPLAY, STAGES, type StageNumber } from "@/lib/demo/config"
import { instrument, isApproximate } from "@/lib/demo/instruments"
import { msg, type Msg, type TValues } from "@/lib/i18n/translator"
import {
  grossPnl,
  isValidLot,
  marginFor,
  normalizeLot,
  openingCosts,
  pctOf,
  pipValue,
  roundMoney,
  roundPrice,
  swapPerNight,
  type Side,
} from "@/lib/demo/money"
import { isReasonId } from "@/lib/reasons"

// The order panel's calculator and the rules an order must pass. The panel
// runs these as the player types; the server runs the same ones before it
// books anything, so the prediction and the booking can't disagree. Pure.

/** SL or TP `pips` away from `entry`: SL on the losing side, TP on the winning side. */
export function levelPrice(pair: string, side: Side, entry: number, kind: "sl" | "tp", pips: number) {
  const { pipSize } = instrument(pair)
  const towardProfit = kind === "tp" ? 1 : -1
  const direction = side === "buy" ? towardProfit : -towardProfit
  return roundPrice(pair, entry + direction * pips * pipSize)
}

/** How many pips `price` sits from `entry` on `kind`'s side (negative: past entry). */
export function levelPips(pair: string, side: Side, entry: number, kind: "sl" | "tp", price: number) {
  const { pipSize } = instrument(pair)
  const towardProfit = kind === "tp" ? 1 : -1
  const direction = side === "buy" ? towardProfit : -towardProfit
  return Math.round(((price - entry) * direction * 10) / pipSize) / 10
}

/** A distance the panel accepts: tenths of a pip, above zero, below the cap. */
export const isValidDistance = (pips: number) =>
  Number.isFinite(pips) && pips > 0 && pips <= PLAN.MAX_DISTANCE_PIPS && Math.abs(Math.round(pips * 10) - pips * 10) < 1e-9

export type RiskLevel = "none" | "ok" | "above" | "danger"

export type OrderQuote = {
  lot: number
  pipValue: number
  margin: number
  freeMarginAfter: number
  /** Free margin covers the margin this trade needs. */
  covered: boolean
  sl: number | null
  tp: number | null
  costs: ReturnType<typeof openingCosts>
  swapPerNight: number
  /** Lost if SL is hit, costs included, positive USD; null without SL (no limit). */
  loss: number | null
  lossPct: number | null
  /** Gained if TP is hit, after costs; null without TP. */
  gain: number | null
  gainPct: number | null
  /** TP distance ÷ SL distance; null unless both are set. */
  rewardRisk: number | null
  risk: RiskLevel
  /** USD figures rely on a fixed conversion (crosses): "perkiraan". */
  approximate: boolean
}

/** Everything the order panel shows, for a trade opened now at `entry`. */
export function quoteOrder(input: {
  pair: string
  side: Side
  lot: number
  entry: number
  slPips: number | null
  tpPips: number | null
  balance: number
  freeMargin: number
  /**
   * The live chart fills BUY at the ask (bid + spread) and closes SELL on the
   * ask, so the spread is already in the prices: no separate spread cost.
   */
  spreadInPrice?: boolean
}): OrderQuote {
  const { pair, side, entry, balance } = input
  const lot = normalizeLot(input.lot)
  const opening = openingCosts(pair, lot, entry)
  const costs = input.spreadInPrice ? { ...opening, spread: 0, total: opening.commission } : opening
  const margin = marginFor(pair, lot, entry)
  const sl = input.slPips === null ? null : levelPrice(pair, side, entry, "sl", input.slPips)
  const tp = input.tpPips === null ? null : levelPrice(pair, side, entry, "tp", input.tpPips)
  const loss = sl === null ? null : roundMoney(-grossPnl(pair, side, lot, entry, sl) + costs.total)
  const gain = tp === null ? null : roundMoney(grossPnl(pair, side, lot, entry, tp) - costs.total)
  const lossPct = loss === null ? null : pctOf(loss, balance)
  const rewardRisk =
    input.slPips !== null && input.tpPips !== null && input.slPips > 0
      ? Math.round((input.tpPips / input.slPips) * 100) / 100
      : null

  return {
    lot,
    pipValue: roundMoney(pipValue(pair, lot, entry)),
    margin,
    freeMarginAfter: roundMoney(input.freeMargin - margin),
    covered: input.freeMargin >= margin,
    sl,
    tp,
    costs,
    swapPerNight: swapPerNight(lot),
    loss,
    lossPct,
    gain,
    gainPct: gain === null ? null : pctOf(gain, balance),
    rewardRisk,
    risk:
      lossPct === null
        ? "none"
        : lossPct > DISIPLIN.DANGER_RISK_PCT
          ? "danger"
          : lossPct > DISIPLIN.MAX_RISK_PCT
            ? "above"
            : "ok",
    approximate: isApproximate(pair),
  }
}

export type OrderInput = {
  side: Side
  lot: number
  slPips: number | null
  tpPips: number | null
  reasons: string[]
}

export type OrderContext = {
  pair: string
  stage: StageNumber
  openTrades: number
  /** Candles left to play in the segment. */
  candlesLeft: number
  /** SL and TP required whatever the stage says (the trading screen's rule). */
  requireSlTp?: boolean
}

export type OrderProblem = {
  field: "reasons" | "lot" | "sl" | "tp" | "margin" | "trades" | "pair" | "candles"
  /** demo catalogue: problems.* */
  message: Msg
}

/**
 * Why this order can't be confirmed yet; empty when it can. The panel lists
 * these under the button, and the server refuses any order that has one.
 */
export function orderProblems(input: OrderInput, ctx: OrderContext, quote: OrderQuote): OrderProblem[] {
  const stage = STAGES[ctx.stage]
  const problems: OrderProblem[] = []
  const add = (field: OrderProblem["field"], key: string, values?: TValues) =>
    problems.push({ field, message: msg(`problems.${key}`, values) })

  const pairs: readonly string[] = stage.pairs
  if (!pairs.includes(ctx.pair)) add("pair", "pairClosed", { pair: ctx.pair, stage: ctx.stage })
  if (ctx.candlesLeft < 1) add("candles", "segmentOver")
  if (ctx.openTrades >= stage.maxOpenTrades) {
    add("trades", "maxTrades", { stage: ctx.stage, max: stage.maxOpenTrades })
  }

  const reasons = input.reasons
  if (reasons.length < PLAN.MIN_REASONS) add("reasons", "minReasons")
  else if (reasons.length > PLAN.MAX_REASONS) add("reasons", "maxReasons", { max: PLAN.MAX_REASONS })
  else if (!reasons.every(isReasonId) || new Set(reasons).size !== reasons.length) add("reasons", "unknownReason")

  if (stage.fixedLot !== null && normalizeLot(input.lot) !== stage.fixedLot) {
    add("lot", "fixedLot", { stage: ctx.stage, lot: stage.fixedLot.toFixed(2) })
  } else if (!isValidLot(input.lot)) {
    add("lot", "lotRange", { min: ACCOUNT.MIN_LOT.toFixed(2), max: ACCOUNT.MAX_LOT.toFixed(2), step: ACCOUNT.LOT_STEP })
  }

  const slTpRequired = ctx.requireSlTp || stage.slTpRequired
  if (input.slPips === null) {
    if (slTpRequired) add("sl", "needSl")
  } else if (!isValidDistance(input.slPips)) {
    add("sl", "slRange", { max: PLAN.MAX_DISTANCE_PIPS })
  }
  if (input.tpPips === null) {
    if (slTpRequired) add("tp", "needTp")
  } else if (!isValidDistance(input.tpPips)) {
    add("tp", "tpRange", { max: PLAN.MAX_DISTANCE_PIPS })
  }

  if (!quote.covered) add("margin", "margin")
  return problems
}

/** Opening with fewer candles left than this gets a warning, not a block. */
export const fewCandlesLeft = (candlesLeft: number) => candlesLeft < REPLAY.LOW_CANDLES_WARNING
