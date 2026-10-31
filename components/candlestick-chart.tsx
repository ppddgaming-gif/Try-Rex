import type { ReactNode } from "react"
import { CHART, PLOT_H, PLOT_W, priceToY, slotWidth, type Candle, type Marker, type Zone } from "@/lib/chart-geometry"

type Props = {
  candles: Candle[]
  min: number
  max: number
  priceTicks: number[]
  timeLabels: string[]
  zones?: Zone[]
  markers?: Marker[]
  currentPrice?: number
  /** Price decimals for this quote convention: 5 for majors, 3 for JPY crosses. */
  digits?: number
  /** Candles from this index on cascade in, one after another (the reveal). */
  revealFrom?: number
  /**
   * Marks the entry before this candle index: a dashed vertical line labelled
   * ENTRY, with the candles after it on a faintly lifted backdrop, so "what you
   * saw" and "what happened next" read as two parts.
   */
  dividerAt?: number
  /**
   * Extra SVG drawn over the candles in the same viewBox (drawn lines, entry
   * and exit marks). Position it with priceToY() from lib/chart-geometry.
   */
  overlay?: ReactNode
}

// Delay between consecutive revealed candles.
const REVEAL_STAGGER_MS = 45

const { W, H, PAD_RIGHT, PAD_TOP } = CHART
const plotW = PLOT_W
const plotH = PLOT_H

const variantColor = {
  neutral: "var(--foreground)",
  danger: "var(--danger)",
  success: "var(--success)",
}

export function CandlestickChart({
  candles,
  min,
  max,
  priceTicks,
  timeLabels,
  zones = [],
  markers = [],
  currentPrice,
  digits = 5,
  revealFrom,
  dividerAt,
  overlay,
}: Props) {
  const y = (p: number) => priceToY(p, min, max)
  // Axis ticks read one decimal shorter than quoted prices, as FX platforms show them.
  const tickDigits = Math.max(0, digits - 1)
  const slot = slotWidth(candles.length)
  const cw = Math.max(2, slot * 0.55)

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-full w-full"
      preserveAspectRatio="none"
      role="img"
      aria-label="Candlestick price chart"
    >
      {/* Horizontal gridlines + right-axis price ticks */}
      {priceTicks.map((p) => (
        <g key={`tick-${p}`}>
          <line
            x1={0}
            x2={plotW}
            y1={y(p)}
            y2={y(p)}
            stroke="var(--border)"
            strokeWidth={0.5}
            opacity={0.5}
          />
          <text
            x={plotW + 8}
            y={y(p) + 3}
            fill="var(--muted-foreground)"
            fontSize={11}
            fontFamily="var(--font-mono)"
          >
            {p.toFixed(tickDigits)}
          </text>
        </g>
      ))}

      {/* Entry divider */}
      {dividerAt !== undefined && dividerAt > 0 && dividerAt < candles.length && (
        <g>
          <rect
            x={dividerAt * slot}
            y={PAD_TOP}
            width={plotW - dividerAt * slot}
            height={plotH}
            fill="var(--foreground)"
            opacity={0.035}
          />
          <line
            x1={dividerAt * slot}
            x2={dividerAt * slot}
            y1={PAD_TOP}
            y2={PAD_TOP + plotH}
            stroke="var(--muted-foreground)"
            strokeWidth={1}
            strokeDasharray="4 4"
            opacity={0.7}
          />
          <text
            x={dividerAt * slot + 6}
            y={PAD_TOP + 12}
            fill="var(--muted-foreground)"
            fontSize={10}
            fontWeight={700}
            letterSpacing={1}
          >
            ENTRY
          </text>
        </g>
      )}

      {/* Zones */}
      {zones.map((z, i) => {
        const top = y(z.to)
        const bottom = y(z.from)
        const isRes = z.variant === "resistance"
        const color = isRes ? "var(--danger)" : "var(--success)"
        return (
          <g key={`zone-${i}`}>
            <rect
              x={0}
              y={top}
              width={plotW}
              height={Math.max(0, bottom - top)}
              fill={color}
              opacity={0.12}
            />
            <line x1={0} x2={plotW} y1={top} y2={top} stroke={color} strokeWidth={1} strokeDasharray="6 5" opacity={0.8} />
            <line x1={0} x2={plotW} y1={bottom} y2={bottom} stroke={color} strokeWidth={1} strokeDasharray="6 5" opacity={0.8} />
            {z.label && (
              <text x={plotW - 6} y={isRes ? top + 14 : bottom - 6} fill={color} fontSize={10} fontWeight={700} textAnchor="end" letterSpacing={1}>
                {z.label}
              </text>
            )}
          </g>
        )
      })}

      {/* Candles */}
      {candles.map((c, i) => {
        const cx = i * slot + slot / 2
        const up = c.c >= c.o
        const color = up ? "var(--success)" : "var(--danger)"
        const yo = y(c.o)
        const yc = y(c.c)
        const bodyTop = Math.min(yo, yc)
        const bodyH = Math.max(1.5, Math.abs(yc - yo))
        const revealing = revealFrom !== undefined && i >= revealFrom
        return (
          <g
            key={`candle-${i}`}
            className={revealing ? "candle-reveal" : undefined}
            style={revealing ? { animationDelay: `${(i - revealFrom) * REVEAL_STAGGER_MS}ms` } : undefined}
          >
            <line x1={cx} x2={cx} y1={y(c.h)} y2={y(c.l)} stroke={color} strokeWidth={1} />
            <rect x={cx - cw / 2} y={bodyTop} width={cw} height={bodyH} fill={color} rx={0.5} />
          </g>
        )
      })}

      {/* Markers (horizontal price lines) */}
      {markers.map((m, i) => {
        const color = variantColor[m.variant]
        const yy = y(m.price)
        const right = m.align !== "left"
        return (
          <g key={`marker-${i}`}>
            <line x1={0} x2={plotW} y1={yy} y2={yy} stroke={color} strokeWidth={1} strokeDasharray="2 3" opacity={0.7} />
            <g transform={`translate(${right ? plotW - 4 : 4}, ${yy})`}>
              <rect
                x={right ? -118 : 0}
                y={-9}
                width={118}
                height={18}
                rx={3}
                fill="var(--card)"
                stroke={color}
                strokeWidth={0.75}
              />
              <text x={right ? -110 : 6} y={3} fill="var(--muted-foreground)" fontSize={9}>
                {m.label}
              </text>
              <text x={right ? -8 : 112} y={3} fill={color} fontSize={10} fontWeight={700} textAnchor="end" fontFamily="var(--font-mono)">
                {m.price.toFixed(digits)}
              </text>
            </g>
          </g>
        )
      })}

      {overlay}

      {/* Current price label on right edge */}
      {currentPrice !== undefined && (
        <g transform={`translate(${plotW}, ${y(currentPrice)})`}>
          <rect x={0} y={-10} width={PAD_RIGHT} height={20} rx={3} fill="var(--danger)" />
          <text x={PAD_RIGHT / 2} y={4} fill="var(--primary-foreground)" fontSize={11} fontWeight={700} textAnchor="middle" fontFamily="var(--font-mono)">
            {currentPrice.toFixed(digits)}
          </text>
        </g>
      )}

      {/* Bottom time axis */}
      {timeLabels.map((t, i) => {
        const x = (plotW / (timeLabels.length - 1)) * i
        const tx = Math.min(Math.max(x, 40), plotW - 40)
        return (
          <text key={`time-${i}`} x={tx} y={H - 8} fill="var(--muted-foreground)" fontSize={11} textAnchor="middle">
            {t}
          </text>
        )
      })}
    </svg>
  )
}
