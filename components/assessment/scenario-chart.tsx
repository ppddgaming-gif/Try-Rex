import { CandlestickChart } from "@/components/candlestick-chart"
import { CHART, frameOf, PLOT_H, slotWidth, type Marker } from "@/lib/chart-geometry"
import type { Bar } from "@/lib/assessment/types"
import { INTL_LOCALE, type Locale } from "@/lib/i18n/locale"

/** Candles on screen at once: the window slides as the play part arrives. */
export const VISIBLE = 100

const LABELS = 5

/**
 * A scenario's chart: the last VISIBLE candles, the Start line, and the
 * order's levels as markers. Lines further than this share of price from the
 * candles are left off the scale, so a typo doesn't flatten the chart.
 */
export function ScenarioChart({
  bars,
  startAt,
  digits,
  markers,
  startLabel,
  locale,
}: {
  bars: Bar[]
  /** Index in `bars` of the first play candle. */
  startAt: number
  digits: number
  markers: Marker[]
  startLabel: string
  locale: Locale
}) {
  const from = Math.max(0, bars.length - VISIBLE)
  const shown = bars.slice(from)
  const near = (p: number) => {
    const lo = Math.min(...shown.map((b) => b.l))
    const hi = Math.max(...shown.map((b) => b.h))
    const span = hi - lo
    return p > lo - span && p < hi + span
  }
  const kept = markers.filter((m) => near(m.price))
  const frame = frameOf(shown, kept.map((m) => m.price))
  const fmt = new Intl.DateTimeFormat(INTL_LOCALE[locale], { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "UTC" })
  const timeLabels = Array.from({ length: LABELS }, (_, k) => {
    const b = shown[Math.round((k * (shown.length - 1)) / (LABELS - 1))]
    return b ? fmt.format(new Date(b.t * 1000)) : ""
  })

  const startIdx = startAt - from
  const x = startIdx * slotWidth(shown.length)
  const startLine =
    startIdx > 0 && startIdx < shown.length ? (
      <g>
        <line x1={x} x2={x} y1={CHART.PAD_TOP} y2={CHART.PAD_TOP + PLOT_H} stroke="var(--primary)" strokeWidth={1} strokeDasharray="4 4" opacity={0.8} />
        <text x={x + 6} y={CHART.PAD_TOP + 12} fill="var(--primary)" fontSize={10} fontWeight={700} letterSpacing={1}>
          {startLabel}
        </text>
      </g>
    ) : null

  return (
    <CandlestickChart
      candles={shown}
      min={frame.min}
      max={frame.max}
      priceTicks={frame.priceTicks}
      timeLabels={timeLabels}
      markers={kept}
      digits={digits}
      currentPrice={shown.at(-1)?.c}
      overlay={startLine}
    />
  )
}
