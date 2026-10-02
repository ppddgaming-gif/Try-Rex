import { ACCOUNT, DISIPLIN } from "@/lib/demo/config"
import { marginFor, normalizeLot, pctOf, pipValue, roundMoney } from "@/lib/demo/money"
import { quoteOrder } from "@/lib/demo/orders"

// The numbers the required lesson teaches, computed from the same functions
// the account uses, so the lesson can never disagree with the order panel.
// Pure and tested; the lesson text lives in lib/demo/lessons.ts.

/** The lesson's example price, the one from the design's calculator. */
export const LESSON_PRICE = 1.17
export const LESSON_PAIR = "EURUSD"
export const LESSON_LOSS_PIPS = 30

export type LotRow = { lot: number; pipValue: number; margin: number; loss: number; lossPct: number }

/** Pip value, margin, and a LESSON_LOSS_PIPS loss for each lot, on the starting balance. */
export function leverageRows(lots = [0.01, 0.05, 0.1]): LotRow[] {
  return lots.map((lot) => {
    const pv = pipValue(LESSON_PAIR, lot, LESSON_PRICE)
    const loss = roundMoney(pv * LESSON_LOSS_PIPS)
    return {
      lot,
      pipValue: roundMoney(pv),
      margin: marginFor(LESSON_PAIR, lot, LESSON_PRICE),
      loss,
      lossPct: pctOf(loss, ACCOUNT.STARTING_BALANCE),
    }
  })
}

/**
 * With one trade of `lot` open on the starting balance: the equity at which
 * stop out closes it, and how many pips against you that takes (spread aside).
 */
export function stopOutPoint(lot: number) {
  const margin = marginFor(LESSON_PAIR, lot, LESSON_PRICE)
  const equity = roundMoney((margin * ACCOUNT.STOP_OUT_LEVEL) / 100)
  const loss = roundMoney(ACCOUNT.STARTING_BALANCE - equity)
  const pips = Math.round((loss / pipValue(LESSON_PAIR, lot, LESSON_PRICE)) * 10) / 10
  return { margin, equity, loss, pips }
}

// The risk lesson, after an account runs out: sizing a trade from its SL.

/** SL distances the risk lesson's table walks through, in pips. */
export const RISK_LESSON_SL_PIPS = [10, 20, 50]
/** The check question's SL. */
export const RISK_QUESTION_SL_PIPS = 10

/** Loss at SL for `lot`, costs included, exactly as the order panel and the risk check compute it. */
export function lossAtSl(lot: number, slPips: number, balance: number = ACCOUNT.STARTING_BALANCE) {
  const q = quoteOrder({
    pair: LESSON_PAIR,
    side: "buy",
    lot,
    entry: LESSON_PRICE,
    slPips,
    tpPips: null,
    balance,
    freeMargin: balance,
  })
  return { loss: q.loss!, lossPct: q.lossPct! }
}

/**
 * The biggest lot whose loss at SL stays within `maxPct` of `balance`, or
 * null when even the smallest lot is too big for this SL.
 */
export function maxLotWithin(slPips: number, balance: number = ACCOUNT.STARTING_BALANCE, maxPct: number = DISIPLIN.MAX_RISK_PCT) {
  const steps = (lot: number) => Math.round(lot / ACCOUNT.LOT_STEP)
  for (let n = steps(ACCOUNT.MAX_LOT); n >= steps(ACCOUNT.MIN_LOT); n--) {
    const lot = normalizeLot(n * ACCOUNT.LOT_STEP)
    if (lossAtSl(lot, slPips, balance).lossPct <= maxPct) return lot
  }
  return null
}

export type RiskRow = {
  slPips: number
  /** Loss at SL with the smallest lot. */
  perMinLot: number
  /** null: even the smallest lot loses more than the limit. */
  maxLot: number | null
  /** Loss at SL with maxLot, or with the smallest lot when maxLot is null. */
  loss: number
  lossPct: number
}

/** The risk lesson's table: for each SL, the biggest lot inside the limit on the starting balance. */
export function riskRows(slPips: number[] = RISK_LESSON_SL_PIPS): RiskRow[] {
  return slPips.map((sl) => {
    const maxLot = maxLotWithin(sl)
    const at = lossAtSl(maxLot ?? ACCOUNT.MIN_LOT, sl)
    return { slPips: sl, perMinLot: lossAtSl(ACCOUNT.MIN_LOT, sl).loss, maxLot, loss: at.loss, lossPct: at.lossPct }
  })
}

/** The risk budget: MAX_RISK_PCT of the starting balance. */
export const riskBudget = () => roundMoney((ACCOUNT.STARTING_BALANCE * DISIPLIN.MAX_RISK_PCT) / 100)
