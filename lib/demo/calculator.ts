import { APPROX_USD_RATE, CALCULATOR } from "@/lib/demo/config"
import { instrument, isApproximate } from "@/lib/demo/instruments"
import {
  grossPnl,
  marginFor,
  normalizeLot,
  openingCosts,
  pctOf,
  pipValue,
  pipsBetween,
  roundMoney,
  roundPrice,
  type Side,
} from "@/lib/demo/money"
import { levelPrice } from "@/lib/demo/orders"

// The standalone Kalkulator Profit: what a move from one price to another is
// worth at a lot size. The same money functions the order panel and the
// server book with, so all three agree. Pure.

const usdPer = (currency: string) => (currency === "USD" ? 1 : APPROX_USD_RATE[currency])

/**
 * Where the calculator starts for `pair`: the design's example for EURUSD,
 * otherwise the fixed conversion rates. An example, never a current price.
 */
export function examplePrice(pair: string) {
  if (pair === CALCULATOR.PAIR) return CALCULATOR.ENTRY
  const { base, quote } = instrument(pair)
  return roundPrice(pair, usdPer(base) / usdPer(quote))
}

/** The example exit: CALCULATOR.MOVE_PIPS in the side's favour. */
export const exampleExit = (pair: string, side: Side) => levelPrice(pair, side, examplePrice(pair), "tp", CALCULATOR.MOVE_PIPS)

export type ProfitInput = { pair: string; side: Side; lot: number; entry: number; exit: number; balance: number }

export type ProfitResult = {
  lot: number
  pips: number
  /** At the exit price, as the profit is converted. */
  pipValue: number
  gross: number
  costs: ReturnType<typeof openingCosts>
  /** gross − costs: what the trade itself would book. */
  net: number
  netPct: number
  margin: number
  /** USD figures rely on a fixed conversion (crosses). */
  approximate: boolean
}

export function profitCalc({ pair, side, lot, entry, exit, balance }: ProfitInput): ProfitResult {
  const size = normalizeLot(lot)
  const gross = grossPnl(pair, side, size, entry, exit)
  const costs = openingCosts(pair, size, entry)
  const net = roundMoney(gross - costs.total)
  return {
    lot: size,
    pips: pipsBetween(pair, side, entry, exit),
    pipValue: roundMoney(pipValue(pair, size, exit)),
    gross,
    costs,
    net,
    netPct: pctOf(net, balance),
    margin: marginFor(pair, size, entry),
    approximate: isApproximate(pair),
  }
}
