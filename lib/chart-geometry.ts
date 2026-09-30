// Geometry of CandlestickChart, shared by the candles and every overlay drawn
// on top of them (non-negotiable #4: one priceToY() for everything). Pure and
// client-safe; it holds no data, so any component can import it.

export type Candle = {
  o: number
  h: number
  l: number
  c: number
}

export type Zone = {
  from: number
  to: number
  variant: "resistance" | "support"
  label?: string
}

export type Marker = {
  price: number
  label: string
  variant: "neutral" | "danger" | "success"
  align?: "left" | "right"
}

export type Frame = { min: number; max: number; priceTicks: number[] }

/** The chart's viewBox. It stretches to its box (preserveAspectRatio="none"). */
export const CHART = {
  W: 1000,
  H: 460,
  PAD_RIGHT: 64,
  PAD_BOTTOM: 28,
  PAD_TOP: 8,
} as const

export const PLOT_W = CHART.W - CHART.PAD_RIGHT
export const PLOT_H = CHART.H - CHART.PAD_BOTTOM - CHART.PAD_TOP

/** The y of `price` in viewBox units. Candles, markers, zones and drawn lines all use this. */
export function priceToY(price: number, min: number, max: number) {
  return CHART.PAD_TOP + ((max - price) / (max - min)) * PLOT_H
}

/** The inverse of priceToY: the price at viewBox height `y` (for taps and drags). */
export function yToPrice(y: number, min: number, max: number) {
  return max - ((y - CHART.PAD_TOP) / PLOT_H) * (max - min)
}

/** Width of one candle's slot when `count` candles fill the plot. */
export const slotWidth = (count: number) => PLOT_W / Math.max(1, count)

/** Centre x of candle `index` of `count`. */
export const candleX = (index: number, count: number) => index * slotWidth(count) + slotWidth(count) / 2

const round = (v: number, digits: number) => Number(v.toFixed(digits))

/**
 * CandlestickChart does no autoscaling, so derive a frame guaranteed to contain
 * the data instead of hand-tuning min / max / priceTicks at every call site.
 * Step selection is scale-free, so it works for both 1.08 majors and 105 JPY.
 * `extra` prices (SL, TP, drawn lines) are kept inside the frame too.
 */
export function frameOf(candles: Candle[], extra: number[] = []): Frame {
  const lo = Math.min(...candles.map((c) => c.l), ...extra)
  const hi = Math.max(...candles.map((c) => c.h), ...extra)
  const pad = (hi - lo) * 0.12 || Math.abs(hi) * 0.001 || 0.001
  const span = hi - lo + pad * 2

  const rough = span / 8
  const magnitude = Math.pow(10, Math.floor(Math.log10(rough)))
  const step =
    [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => span / s <= 10) ?? 10 * magnitude

  // Enough decimals to describe the step exactly, so ticks never drift.
  const dp = Math.max(0, Math.min(8, Math.ceil(-Math.log10(step)) + 1))
  const min = round(Math.floor((lo - pad) / step) * step, dp)
  const max = round(Math.ceil((hi + pad) / step) * step, dp)

  const priceTicks: number[] = []
  const steps = Math.round((max - min) / step)
  for (let i = 0; i <= steps; i++) priceTicks.push(round(min + i * step, dp))

  return { min, max, priceTicks }
}
