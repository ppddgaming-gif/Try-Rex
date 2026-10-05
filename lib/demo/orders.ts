import { ACCOUNT, DISIPLIN, PLAN, REPLAY, STAGES, type StageNumber } from "@/lib/demo/config"
import { instrument, isApproximate } from "@/lib/demo/instruments"
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
}): OrderQuote {
  const { pair, side, entry, balance } = input
  const lot = normalizeLot(input.lot)
  const costs = openingCosts(pair, lot, entry)
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
}

export type OrderProblem = {
  field: "reasons" | "lot" | "sl" | "tp" | "margin" | "trades" | "pair" | "candles"
  message: string
}

/**
 * Why this order can't be confirmed yet; empty when it can. The panel lists
 * these under the button, and the server refuses any order that has one.
 */
export function orderProblems(input: OrderInput, ctx: OrderContext, quote: OrderQuote): OrderProblem[] {
  const stage = STAGES[ctx.stage]
  const problems: OrderProblem[] = []
  const add = (field: OrderProblem["field"], message: string) => problems.push({ field, message })

  const pairs: readonly string[] = stage.pairs
  if (!pairs.includes(ctx.pair)) add("pair", `${ctx.pair} belum terbuka di Stage ${ctx.stage}.`)
  if (ctx.candlesLeft < 1) add("candles", "Segmen ini sudah habis. Ganti chart dulu.")
  if (ctx.openTrades >= stage.maxOpenTrades) {
    add("trades", `Stage ${ctx.stage}: maksimal ${stage.maxOpenTrades} trade terbuka.`)
  }

  const reasons = input.reasons
  if (reasons.length < PLAN.MIN_REASONS) add("reasons", "Pilih minimal 1 alasan.")
  else if (reasons.length > PLAN.MAX_REASONS) add("reasons", `Pilih maksimal ${PLAN.MAX_REASONS} alasan.`)
  else if (!reasons.every(isReasonId) || new Set(reasons).size !== reasons.length) add("reasons", "Alasan tidak dikenal.")

  if (stage.fixedLot !== null && normalizeLot(input.lot) !== stage.fixedLot) {
    add("lot", `Stage ${ctx.stage} memakai lot ${stage.fixedLot.toFixed(2)}.`)
  } else if (!isValidLot(input.lot)) {
    add("lot", `Lot antara ${ACCOUNT.MIN_LOT.toFixed(2)} dan ${ACCOUNT.MAX_LOT.toFixed(2)}, kelipatan ${ACCOUNT.LOT_STEP}.`)
  }

  if (input.slPips === null) {
    if (stage.slTpRequired) add("sl", "Pasang stop loss.")
  } else if (!isValidDistance(input.slPips)) {
    add("sl", `Jarak SL 0.1–${PLAN.MAX_DISTANCE_PIPS} pip.`)
  }
  if (input.tpPips === null) {
    if (stage.slTpRequired) add("tp", "Pasang take profit.")
  } else if (!isValidDistance(input.tpPips)) {
    add("tp", `Jarak TP 0.1–${PLAN.MAX_DISTANCE_PIPS} pip.`)
  }

  if (!quote.covered) add("margin", "Margin bebas tidak cukup untuk lot ini.")
  return problems
}

/** Opening with fewer candles left than this gets a warning, not a block. */
export const fewCandlesLeft = (candlesLeft: number) => candlesLeft < REPLAY.LOW_CANDLES_WARNING
