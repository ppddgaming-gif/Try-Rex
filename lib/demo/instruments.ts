import { APPROX_USD_RATE } from "@/lib/demo/config"

// What the account needs to know about each pair: how prices are quoted and
// how to turn a quote-currency amount into USD. Pure.

export type Instrument = {
  pair: string
  base: string
  quote: string
  /** Decimals in a quoted price: 5 for majors, 3 for yen pairs. */
  digits: number
  /** One pip: 0.0001, or 0.01 for yen pairs. */
  pipSize: number
}

export function instrument(pair: string): Instrument {
  const base = pair.slice(0, 3)
  const quote = pair.slice(3, 6)
  const yen = quote === "JPY"
  return { pair, base, quote, digits: yen ? 3 : 5, pipSize: yen ? 0.01 : 0.0001 }
}

/**
 * How USD per one unit of `currency` is found, given the pair's own price.
 * Exact when USD is one side of the pair; a fixed estimate otherwise.
 */
export type Conversion = { rate: number; approximate: boolean }

function usdPer(currency: string, pair: Instrument, price: number): Conversion {
  if (currency === "USD") return { rate: 1, approximate: false }
  // USD is the other side of this pair: the price itself converts exactly.
  if (pair.quote === "USD" && currency === pair.base) return { rate: price, approximate: false }
  if (pair.base === "USD" && currency === pair.quote) return { rate: 1 / price, approximate: false }
  const approx = APPROX_USD_RATE[currency]
  if (!approx) throw new Error(`No USD rate for ${currency}`)
  return { rate: approx, approximate: true }
}

/** USD per unit of the quote currency (profits and pip values are in quote currency). */
export const quoteToUsd = (pair: string, price: number) => {
  const i = instrument(pair)
  return usdPer(i.quote, i, price)
}

/** USD per unit of the base currency (position size and margin are in base currency). */
export const baseToUsd = (pair: string, price: number) => {
  const i = instrument(pair)
  return usdPer(i.base, i, price)
}

/** True when this pair's USD figures rely on a fixed estimate (crosses). */
export const isApproximate = (pair: string) => {
  const i = instrument(pair)
  return i.base !== "USD" && i.quote !== "USD"
}
