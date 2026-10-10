"use client"

import { useRef, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { CandlestickChart } from "@/components/candlestick-chart"
import { CHART, PLOT_H, PLOT_W, candleX, frameOf, priceToY, slotWidth, yToPrice, type Frame, type Marker } from "@/lib/chart-geometry"
import { LINES } from "@/lib/demo/config"
import type { TradeView, ViewCandle } from "@/lib/demo/view"
import { timeLabels } from "@/lib/challenge-text"
import type { Locale } from "@/lib/i18n/locale"

type Props = {
  candles: ViewCandle[]
  digits: number
  open: TradeView[]
  closed: TradeView[]
  /** SL/TP of the order being planned, drawn as "rencana". */
  draft: { sl: number | null; tp: number | null } | null
  lines: number[]
  /** Line tool on: taps place lines and drags move them. */
  drawing: boolean
  onLinesChange: (lines: number[]) => void
  revealFrom?: number
}

/** Five evenly spaced candle times, matching the chart's time axis. */
function axisTimes(candles: { t: number }[], count = 5) {
  if (candles.length === 0) return []
  return Array.from({ length: count }, (_, i) => candles[Math.round((candles.length - 1) * (i / (count - 1)))].t)
}

// Pixels (on screen) within which a tap grabs an existing line.
const GRAB_PX = 14

/**
 * The replay chart. Every overlay (SL/TP/entry markers, entry and exit marks,
 * drawn lines) is positioned with priceToY() from lib/chart-geometry, the
 * same function the candles use (non-negotiable #4).
 */
export function TradeChart({ candles, digits, open, closed, draft, lines, drawing, onLinesChange, revealFrom }: Props) {
  const box = useRef<HTMLDivElement>(null)
  // While dragging: the line's index, its live price, and the frame at the
  // start of the drag (held still so the line doesn't chase a rescaling axis).
  const [drag, setDrag] = useState<{ index: number; price: number; frame: Frame } | null>(null)
  const t = useTranslations("demo.ui.chart")
  const locale = useLocale() as Locale

  const shownLines = drag ? lines.map((p, i) => (i === drag.index ? drag.price : p)) : lines
  const levels = [
    ...open.flatMap((t) => [t.entry, t.sl, t.tp]),
    ...(draft ? [draft.sl, draft.tp] : []),
    ...lines,
  ].filter((p): p is number => p !== null)
  const frame = drag?.frame ?? frameOf(candles, levels)
  const y = (p: number) => priceToY(p, frame.min, frame.max)

  const markers: Marker[] = [
    ...open.flatMap((tr): Marker[] => [
      { price: tr.entry, label: t("entry", { n: tr.number }), variant: "neutral" },
      ...(tr.sl !== null ? [{ price: tr.sl, label: t("sl", { n: tr.number }), variant: "danger" as const }] : []),
      ...(tr.tp !== null ? [{ price: tr.tp, label: t("tp", { n: tr.number }), variant: "success" as const }] : []),
    ]),
    ...(draft?.sl != null ? [{ price: draft.sl, label: t("slPlan"), variant: "danger" as const, align: "left" as const }] : []),
    ...(draft?.tp != null ? [{ price: draft.tp, label: t("tpPlan"), variant: "success" as const, align: "left" as const }] : []),
  ]

  const count = candles.length
  const half = slotWidth(count) * 0.8
  const tick = (x: number, price: number, color: string) => (
    <line x1={x - half} x2={x + half} y1={y(price)} y2={y(price)} stroke={color} strokeWidth={3} vectorEffect="non-scaling-stroke" />
  )

  const overlay = (
    <g aria-hidden="true">
      {/* Entry and exit of this chart's trades. */}
      {[...closed, ...open].map((tr) => {
        const ex = candleX(tr.entryIndex, count)
        if (!tr.exit) return <g key={tr.id}>{tick(ex, tr.entry, "var(--foreground)")}</g>
        const xx = candleX(Math.min(tr.exit.index, count - 1), count)
        const color = tr.pnl >= 0 ? "var(--success)" : "var(--danger)"
        return (
          <g key={tr.id}>
            <line
              x1={ex}
              x2={xx}
              y1={y(tr.entry)}
              y2={y(tr.exit.price)}
              stroke={color}
              strokeWidth={1.5}
              strokeDasharray="5 4"
              vectorEffect="non-scaling-stroke"
            />
            {tick(ex, tr.entry, "var(--foreground)")}
            {tick(xx, tr.exit.price, color)}
          </g>
        )
      })}
      {/* Drawn lines. */}
      {shownLines.map((p, i) => (
        <g key={i}>
          <line x1={0} x2={PLOT_W} y1={y(p)} y2={y(p)} stroke="var(--primary)" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
          <text x={6} y={y(p) - 4} fill="var(--primary)" fontSize={10} fontFamily="var(--font-mono)">
            {p.toFixed(digits)}
          </text>
        </g>
      ))}
    </g>
  )

  /** Pointer position in viewBox units, or null outside the plot. */
  function toPlot(e: React.PointerEvent) {
    const rect = box.current!.getBoundingClientRect()
    const vx = ((e.clientX - rect.left) / rect.width) * CHART.W
    const vy = ((e.clientY - rect.top) / rect.height) * CHART.H
    if (vx < 0 || vx > PLOT_W || vy < CHART.PAD_TOP || vy > CHART.PAD_TOP + PLOT_H) return null
    return { vy, pxPerUnit: rect.height / CHART.H }
  }

  function onPointerDown(e: React.PointerEvent) {
    if (!drawing) return
    const at = toPlot(e)
    if (!at) return
    const grabbed = lines.findIndex((p) => Math.abs(y(p) - at.vy) * at.pxPerUnit <= GRAB_PX)
    const price = Number(yToPrice(at.vy, frame.min, frame.max).toFixed(digits))
    if (grabbed >= 0) {
      e.currentTarget.setPointerCapture(e.pointerId)
      setDrag({ index: grabbed, price: lines[grabbed], frame })
    } else if (lines.length < LINES.MAX_PER_SEGMENT) {
      onLinesChange([...lines, price])
    }
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!drag) return
    const rect = box.current!.getBoundingClientRect()
    const vy = Math.min(CHART.PAD_TOP + PLOT_H, Math.max(CHART.PAD_TOP, ((e.clientY - rect.top) / rect.height) * CHART.H))
    setDrag({ ...drag, price: Number(yToPrice(vy, drag.frame.min, drag.frame.max).toFixed(digits)) })
  }

  function onPointerUp() {
    if (!drag) return
    onLinesChange(lines.map((p, i) => (i === drag.index ? drag.price : p)))
    setDrag(null)
  }

  const last = candles[candles.length - 1]

  return (
    <div
      ref={box}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={() => setDrag(null)}
      className={[
        "relative h-[300px] w-full select-none sm:h-[380px] lg:h-[420px]",
        drawing ? "cursor-crosshair touch-none" : "",
      ].join(" ")}
    >
      <CandlestickChart
        candles={candles}
        min={frame.min}
        max={frame.max}
        priceTicks={frame.priceTicks}
        timeLabels={timeLabels(axisTimes(candles), locale)}
        markers={markers}
        currentPrice={last?.c}
        digits={digits}
        revealFrom={revealFrom}
        overlay={overlay}
      />
    </div>
  )
}
