import type { Drawing, Point } from "@/lib/live/drawings"

// Geometry of the trading chart. The chart draws at its real pixel size (no
// stretching, so handles stay round on a phone), and ONE scale per chart
// places candles, axes and every drawing (non-negotiable #4). Pure.

export const PAD = { right: 64, bottom: 24, top: 8 } as const

/**
 * The RSI panel under the chart: the same right axis, so with the same width,
 * span and offset its candles sit exactly under the chart's (one indexToX).
 */
export const RSI_PAD = { right: PAD.right, bottom: 6, top: 6 } as const

export type Pad = { right: number; bottom: number; top: number }

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
  /** Candle index at the plot's left edge (the zoom/pan window's start). */
  offset: number
  /** Centre x of fractional candle index `i` (candle i is centred on i). */
  indexToX: (i: number) => number
  xToIndex: (x: number) => number
}

/**
 * The one scale of a chart. `count` candle slots fit across the plot,
 * starting at candle index `offset` (0 = the first candle at the left edge),
 * so zooming and panning move this window and nothing else: candles,
 * drawings and position lines all go through the same indexToX / priceToY.
 */
export function makeScale(width: number, height: number, count: number, min: number, max: number, offset = 0, pad: Pad = PAD): Scale {
  const plotW = Math.max(1, width - pad.right)
  const plotH = Math.max(1, height - pad.bottom - pad.top)
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
    offset,
    priceToY: (p) => pad.top + ((max - p) / span) * plotH,
    yToPrice: (y) => max - ((y - pad.top) / plotH) * span,
    indexToX: (i) => (i - offset + 0.5) * slot,
    xToIndex: (x) => x / slot - 0.5 + offset,
  }
}

/**
 * The zoom/pan window: `span` candle slots on screen, the first at index
 * `offset`. `offset: null` follows the latest candle (it stays pinned to the
 * right edge as new candles arrive); a number holds a place in history.
 */
export type ChartView = { span: number; offset: number | null }

export type ViewLimits = { min: number; max: number; right: number }

/**
 * Empty slots kept right of the latest candle: about a tenth of the window
 * (room to draw into the future), never more than `max` nor fewer than 2, so
 * a close zoom isn't half empty.
 */
export const rightSlots = (span: number, max: number) => Math.min(max, Math.max(2, Math.round(span / 10)))

/** The left-edge index when the view follows the latest candle: the last candle plus the empty slots end the plot. */
export const pinnedOffset = (candles: number, span: number, max: number) => Math.max(0, candles + rightSlots(span, max) - span)

/**
 * The window as it can actually be shown: span within [min, max] and no
 * wider than the data plus the empty slots, offset between the first candle
 * and the pinned position. Reaching the pinned position follows the latest
 * candle again.
 */
export function clampView(view: ChartView, candles: number, limits: ViewLimits): { span: number; offset: number; pinned: boolean } {
  const most = Math.max(limits.min, Math.min(limits.max, candles + limits.right))
  const span = Math.min(most, Math.max(limits.min, view.span))
  const pinnedAt = pinnedOffset(candles, span, limits.right)
  if (view.offset === null) return { span, offset: pinnedAt, pinned: true }
  const offset = Math.min(pinnedAt, Math.max(0, view.offset))
  return { span, offset, pinned: offset >= pinnedAt - 1e-6 }
}

/**
 * Zoom by `factor` (> 1 shows more candles) keeping candle index `anchor`
 * where it is on screen, under the cursor or between the fingers.
 */
export function zoomView(view: ChartView, candles: number, limits: ViewLimits, factor: number, anchor: number): ChartView {
  const cur = clampView(view, candles, limits)
  const next = clampView({ span: cur.span * factor, offset: 0 }, candles, limits).span
  // Candle i is centred half a slot into its slot: keep that point's share of the width.
  const at = (anchor - cur.offset + 0.5) / cur.span
  const offset = anchor + 0.5 - at * next
  const out = clampView({ span: next, offset }, candles, limits)
  // Zooming while following the latest candle keeps following it.
  return { span: out.span, offset: cur.pinned || out.pinned ? null : out.offset }
}

/** Pan by `slots` candles (positive = toward older candles). */
export function panView(view: ChartView, candles: number, limits: ViewLimits, slots: number): ChartView {
  const cur = clampView(view, candles, limits)
  const out = clampView({ span: cur.span, offset: cur.offset - slots }, candles, limits)
  return { span: out.span, offset: out.pinned ? null : out.offset }
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

/**
 * SVG path of an indicator line through candles lo..hi. A null value breaks
 * the line (not enough candles yet), so it never draws a made-up value.
 */
export function seriesPath(values: readonly (number | null)[], scale: Scale, lo: number, hi: number) {
  let d = ""
  let pen = false
  for (let i = Math.max(0, lo); i <= Math.min(values.length - 1, hi); i++) {
    const v = values[i]
    if (v === null || !Number.isFinite(v)) {
      pen = false
      continue
    }
    d += `${pen ? "L" : "M"}${scale.indexToX(i).toFixed(2)} ${scale.priceToY(v).toFixed(2)}`
    pen = true
  }
  return d
}

/** Five to seven candle indexes to label on the time axis, evenly spread over the candles. */
export function timeTicks(candles: number, slot: number) {
  if (candles === 0) return []
  const every = Math.max(1, Math.ceil(90 / Math.max(1, slot)))
  const out: number[] = []
  for (let i = candles - 1; i >= 0; i -= every) out.unshift(i)
  return out
}
