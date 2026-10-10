import type { Drawing, Point } from "@/lib/live/drawings"

// Geometry of the trading chart. The chart draws at its real pixel size (no
// stretching, so handles stay round on a phone), and ONE scale per chart
// places candles, axes and every drawing (non-negotiable #4). Pure.

export const PAD = { right: 64, bottom: 24, top: 8 } as const

export type Scale = {
  width: number
  height: number
  plotW: number
  plotH: number
  /** Candle slots across the plot, empty future slots included. */
  count: number
  slot: number
  min: number
  max: number
  priceToY: (price: number) => number
  yToPrice: (y: number) => number
  /** Centre x of fractional candle index `i` (candle i is centred on i). */
  indexToX: (i: number) => number
  xToIndex: (x: number) => number
}

export function makeScale(width: number, height: number, count: number, min: number, max: number): Scale {
  const plotW = Math.max(1, width - PAD.right)
  const plotH = Math.max(1, height - PAD.bottom - PAD.top)
  const slot = plotW / Math.max(1, count)
  const span = max - min || 1
  return {
    width,
    height,
    plotW,
    plotH,
    count,
    slot,
    min,
    max,
    priceToY: (p) => PAD.top + ((max - p) / span) * plotH,
    yToPrice: (y) => max - ((y - PAD.top) / plotH) * span,
    indexToX: (i) => (i + 0.5) * slot,
    xToIndex: (x) => x / slot - 0.5,
  }
}

type XY = { x: number; y: number }

/** Distance from point p to the segment a–b, in pixels. */
export function distToSegment(p: XY, a: XY, b: XY) {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const len = dx * dx + dy * dy
  const k = len === 0 ? 0 : Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / len))
  return Math.hypot(p.x - (a.x + k * dx), p.y - (a.y + k * dy))
}

/** Screen position of a (time, price) point, given how times map to candle indexes. */
export type Project = (pt: Point) => XY

/**
 * The drawing under pointer `p`, topmost first; null when none is within
 * `tolerance` pixels. Rectangles and positions also hit anywhere inside.
 */
export function hitTest(drawings: readonly Drawing[], p: XY, project: Project, scale: Scale, tolerance: number): string | null {
  for (let i = drawings.length - 1; i >= 0; i--) {
    const d = drawings[i]
    switch (d.kind) {
      case "hline":
        if (Math.abs(p.y - scale.priceToY(d.p)) <= tolerance && p.x <= scale.plotW) return d.id
        break
      case "trendline":
        if (distToSegment(p, project(d.a), project(d.b)) <= tolerance) return d.id
        break
      case "path":
        for (let k = 1; k < d.points.length; k++) {
          if (distToSegment(p, project(d.points[k - 1]), project(d.points[k])) <= tolerance) return d.id
        }
        break
      case "rectangle": {
        const a = project(d.a)
        const b = project(d.b)
        if (inside(p, a, b, tolerance)) return d.id
        break
      }
      case "position": {
        const a = project(d.a)
        const b = project(d.b)
        const top = { x: a.x, y: scale.priceToY(Math.max(d.sl, d.tp)) }
        const bottom = { x: b.x, y: scale.priceToY(Math.min(d.sl, d.tp)) }
        if (inside(p, top, bottom, tolerance)) return d.id
        break
      }
    }
  }
  return null
}

function inside(p: XY, a: XY, b: XY, pad: number) {
  return (
    p.x >= Math.min(a.x, b.x) - pad &&
    p.x <= Math.max(a.x, b.x) + pad &&
    p.y >= Math.min(a.y, b.y) - pad &&
    p.y <= Math.max(a.y, b.y) + pad
  )
}

/** Every point of a drawing moved by (dt, dp): a whole-drawing drag. */
export function moveDrawing(d: Drawing, dt: number, dp: number): Drawing {
  const mv = (x: Point): Point => ({ t: Math.round(x.t + dt), p: x.p + dp })
  switch (d.kind) {
    case "hline":
      return { ...d, p: d.p + dp }
    case "path":
      return { ...d, points: d.points.map(mv) }
    case "position":
      return { ...d, a: mv(d.a), b: mv(d.b), sl: d.sl + dp, tp: d.tp + dp }
    default:
      return { ...d, a: mv(d.a), b: mv(d.b) }
  }
}

/** Five to seven candle indexes to label on the time axis, evenly spread over the candles. */
export function timeTicks(candles: number, slot: number) {
  if (candles === 0) return []
  const every = Math.max(1, Math.ceil(90 / Math.max(1, slot)))
  const out: number[] = []
  for (let i = candles - 1; i >= 0; i -= every) out.unshift(i)
  return out
}
