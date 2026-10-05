import { ACCOUNT, AKUN_HABIS, COSTS, type StageNumber } from "@/lib/demo/config"
import { baseToUsd, instrument, quoteToUsd } from "@/lib/demo/instruments"

// Money on an Akun Latihan: pip value, margin, profit and loss, costs.
// Every figure the player sees (order panel, calculator, journal) and every
// figure the server books comes from these functions, so what the panel
// predicts is exactly what gets booked. Pure; amounts in USD.

export type Side = "buy" | "sell"

/** Cents, rounded half away from zero. Every booked amount goes through this. */
export function roundMoney(value: number) {
  const cents = Math.round(Math.abs(value) * 100 + 1e-9) / 100
  return value < 0 ? -cents : cents
}

/** Round to the pair's quoted precision, so prices never carry float noise. */
export function roundPrice(pair: string, price: number) {
  const { digits } = instrument(pair)
  return Number(price.toFixed(digits))
}

/** Lots as a whole number of steps, so 0.1 + 0.2 never becomes 0.30000000000000004. */
export function normalizeLot(lot: number) {
  const steps = Math.round(lot / ACCOUNT.LOT_STEP)
  return Number((steps * ACCOUNT.LOT_STEP).toFixed(2))
}

export function isValidLot(lot: number) {
  if (!Number.isFinite(lot)) return false
  const n = normalizeLot(lot)
  return Math.abs(n - lot) < 1e-9 && n >= ACCOUNT.MIN_LOT && n <= ACCOUNT.MAX_LOT
}

/** Units of base currency in `lot`. */
export const units = (lot: number) => normalizeLot(lot) * ACCOUNT.CONTRACT_SIZE

/** USD value of one pip at this lot size, converted at `price`. 0.10 lot EURUSD = $1. */
export function pipValue(pair: string, lot: number, price: number) {
  const { pipSize } = instrument(pair)
  return pipSize * units(lot) * quoteToUsd(pair, price).rate
}

/** USD margin set aside for this position. 0.10 lot EURUSD at 1.1700 = $117. */
export function marginFor(pair: string, lot: number, price: number) {
  return roundMoney((units(lot) * baseToUsd(pair, price).rate) / ACCOUNT.LEVERAGE)
}

/** Signed pips from entry to exit, positive when the move favours the side. */
export function pipsBetween(pair: string, side: Side, entry: number, exit: number) {
  const { pipSize } = instrument(pair)
  const raw = (exit - entry) / pipSize
  const pips = side === "buy" ? raw : -raw
  // Prices are quoted to a tenth of a pip at most.
  return Math.round(pips * 10) / 10
}

/**
 * Gross profit or loss of closing at `exit`, before costs, in USD. The pip
 * value is converted at the exit price, as it would be at settlement.
 * 0.10 lot BUY 1.1700 → 1.1750 = $50.00.
 */
export function grossPnl(pair: string, side: Side, lot: number, entry: number, exit: number) {
  return roundMoney(pipsBetween(pair, side, entry, exit) * pipValue(pair, lot, exit))
}

/** Costs charged when the trade opens: spread and commission, as positive USD. */
export function openingCosts(pair: string, lot: number, price: number) {
  const spreadPips = COSTS.SPREAD_PIPS[pair] ?? 0
  const spread = roundMoney(spreadPips * pipValue(pair, lot, price))
  const commission = roundMoney(COSTS.COMMISSION_PER_LOT * normalizeLot(lot))
  return { spreadPips, spread, commission, total: roundMoney(spread + commission) }
}

/** Swap for one night held, signed (negative = a cost). */
export const swapPerNight = (lot: number) => roundMoney(COSTS.SWAP_PER_LOT_PER_NIGHT * normalizeLot(lot))

/** Percentage of `balance`, one decimal. */
export const pctOf = (amount: number, balance: number) =>
  balance > 0 ? Math.round((amount / balance) * 1000) / 10 : 0

export type AccountFigures = {
  balance: number
  equity: number
  openPnl: number
  marginUsed: number
  freeMargin: number
  /** equity ÷ margin used, in %; null with no open trades. */
  marginLevel: number | null
}

/** The side panel's numbers, from the balance and each open trade's P/L and margin. */
export function accountFigures(balance: number, open: { pnl: number; margin: number }[]): AccountFigures {
  const openPnl = roundMoney(open.reduce((s, t) => s + t.pnl, 0))
  const marginUsed = roundMoney(open.reduce((s, t) => s + t.margin, 0))
  const equity = roundMoney(balance + openPnl)
  return {
    balance: roundMoney(balance),
    equity,
    openPnl,
    marginUsed,
    freeMargin: roundMoney(equity - marginUsed),
    marginLevel: marginUsed > 0 ? Math.round((equity / marginUsed) * 1000) / 10 : null,
  }
}

/** The stage's "akun habis" line (config AKUN_HABIS): the same on every chart, known in advance. */
export const bustLine = (stage: StageNumber) => AKUN_HABIS[stage]

/** Below the line with no trade open, the account has run out: trading stops and Rex's review opens. */
export const isBust = (balance: number, stage: StageNumber) => balance < bustLine(stage)
