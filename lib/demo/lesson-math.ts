import { ACCOUNT } from "@/lib/demo/config"
import { marginFor, pctOf, pipValue, roundMoney } from "@/lib/demo/money"

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
