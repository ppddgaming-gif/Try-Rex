// EMA and RSI for the trading chart. Pure: closes in, values out, no UI and
// no I/O. Both formulas are scale-free, so every pair, JPY included, takes the
// same path: closes as plain numbers, never converted to pips, rounded or
// multiplied. Rounding happens only where a value is shown (PAIR_CONFIG
// digits for EMA, 2 decimals for RSI). A value at candle i reads candles
// 0..i only. Each step is O(1) and returns a new state, so `peek` (the
// forming candle) can never overwrite the state of the closed candles.

export const INDICATORS = ["ema20", "ema50", "rsi14"] as const
export type IndicatorId = (typeof INDICATORS)[number]

/** One value per candle; null until the indicator has enough candles. */
export type Series = (number | null)[]

export type EmaState = {
  period: number
  /** Closes seen. */
  count: number
  /** Sum of the first `period` closes, for the SMA seed. */
  sum: number
  value: number | null
}

export const emaStart = (period: number): EmaState => ({ period, count: 0, sum: 0, value: null })

/**
 * The state after one more closed candle. Seeded with the SMA of the first
 * `period` closes (first value at index period − 1), then
 * ema = α·close + (1 − α)·ema, α = 2 / (period + 1): TradingView's ta.ema.
 */
export function emaNext(s: EmaState, close: number): EmaState {
  const count = s.count + 1
  if (count < s.period) return { ...s, count, sum: s.sum + close }
  if (count === s.period) return { ...s, count, sum: s.sum + close, value: (s.sum + close) / s.period }
  const alpha = 2 / (s.period + 1)
  return { ...s, count, value: alpha * close + (1 - alpha) * (s.value as number) }
}

export type RsiState = {
  period: number
  /** Price changes seen. */
  changes: number
  prev: number | null
  /** Sums of the first `period` gains and losses, for the seed. */
  gainSum: number
  lossSum: number
  avgGain: number
  avgLoss: number
  value: number | null
}

export const rsiStart = (period: number): RsiState => ({
  period,
  changes: 0,
  prev: null,
  gainSum: 0,
  lossSum: 0,
  avgGain: 0,
  avgLoss: 0,
  value: null,
})

/** RSI from the two averages. No losses is 100 (a flat market too); no gains is 0. */
export function rsiOf(avgGain: number, avgLoss: number) {
  if (avgLoss === 0) return 100
  if (avgGain === 0) return 0
  return 100 - 100 / (1 + avgGain / avgLoss)
}

/**
 * The state after one more closed candle. Wilder's RSI: the averages start as
 * the simple mean of the first `period` changes (first value at index
 * `period`), then avg = (avg·(period − 1) + x) / period.
 */
export function rsiNext(s: RsiState, close: number): RsiState {
  if (s.prev === null) return { ...s, prev: close }
  const diff = close - s.prev
  const gain = diff > 0 ? diff : 0
  const loss = diff < 0 ? -diff : 0
  const changes = s.changes + 1
  if (changes < s.period) return { ...s, changes, prev: close, gainSum: s.gainSum + gain, lossSum: s.lossSum + loss }
  const p = s.period
  const avgGain = changes === p ? (s.gainSum + gain) / p : (s.avgGain * (p - 1) + gain) / p
  const avgLoss = changes === p ? (s.lossSum + loss) / p : (s.avgLoss * (p - 1) + loss) / p
  return { ...s, changes, prev: close, avgGain, avgLoss, value: rsiOf(avgGain, avgLoss) }
}

/** EMA of `closes`, one value per close. */
export function ema(closes: readonly number[], period: number): Series {
  let s = emaStart(period)
  return closes.map((c) => (s = emaNext(s, c)).value)
}

/** Wilder's RSI of `closes`, one value per close. */
export function rsi(closes: readonly number[], period = 14): Series {
  let s = rsiStart(period)
  return closes.map((c) => (s = rsiNext(s, c)).value)
}

/** The three indicators' state after the last closed candle. */
export type IndicatorState = { ema20: EmaState; ema50: EmaState; rsi14: RsiState }

export const indicatorStart = (): IndicatorState => ({ ema20: emaStart(20), ema50: emaStart(50), rsi14: rsiStart(14) })

/** One more closed candle, O(1). */
export const indicatorNext = (s: IndicatorState, close: number): IndicatorState => ({
  ema20: emaNext(s.ema20, close),
  ema50: emaNext(s.ema50, close),
  rsi14: rsiNext(s.rsi14, close),
})

/** The values for a candle still forming at `price`, from the closed state. The state is not changed. */
export function indicatorPeek(s: IndicatorState, price: number): Record<IndicatorId, number | null> {
  const n = indicatorNext(s, price)
  return { ema20: n.ema20.value, ema50: n.ema50.value, rsi14: n.rsi14.value }
}

export type ChartIndicators = Record<IndicatorId, Series> & {
  /** Closed candles read before the first one shown, to settle the values (pre-roll). */
  warmup: number
}

/**
 * The indicators for a chart: `closes` are every closed candle read (the
 * warm-up first), `forming` the forming candle's current price or null. Only
 * the last `shown` closed candles' values are returned, plus the forming
 * candle's last when there is one, aligned with the candles the chart gets.
 */
export function chartIndicators(closes: readonly number[], forming: number | null, shown: number): ChartIndicators {
  const out: Record<IndicatorId, Series> = { ema20: [], ema50: [], rsi14: [] }
  const from = Math.max(0, closes.length - shown)
  let s = indicatorStart()
  for (let i = 0; i < closes.length; i++) {
    s = indicatorNext(s, closes[i])
    if (i >= from) for (const id of INDICATORS) out[id].push(s[id].value)
  }
  if (forming !== null) {
    const peek = indicatorPeek(s, forming)
    for (const id of INDICATORS) out[id].push(peek[id])
  }
  return { ...out, warmup: from }
}
