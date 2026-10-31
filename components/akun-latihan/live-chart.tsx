"use client"

import { useEffect, useEffectEvent, useId, useLayoutEffect, useMemo, useRef, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { ChevronsRight, ZoomIn, ZoomOut } from "lucide-react"
import { frameOf } from "@/lib/chart-geometry"
import { instrument } from "@/lib/demo/instruments"
import type { Locale } from "@/lib/i18n/locale"
import { CHART, DRAWINGS } from "@/lib/live/config"
import { positionStats, type Drawing, type DrawingKind, type Point } from "@/lib/live/drawings"
import {
  PAD,
  RSI_PAD,
  clampView,
  hitTest,
  makeScale,
  moveDrawing,
  panView,
  seriesPath,
  timeTicks,
  zoomView,
  type ChartView,
  type Scale,
} from "@/lib/live/geometry"
import type { IndicatorId, Series } from "@/lib/live/indicators"
import { dayTimeLabel, indexToTime, timeToIndex } from "@/lib/live/time"

/** A candle as the browser has it: `t` in seconds relative to now. */
export type ChartCandle = { t: number; o: number; h: number; l: number; c: number }

/** A level of the open position, drawn across the plot with its price on the axis. */
export type ChartLevel = { kind: "entry" | "sl" | "tp"; price: number; label: string }

/** "select" or a drawing kind; positions come as buy and sell. */
export type Tool = "select" | Exclude<DrawingKind, "position"> | "position-buy" | "position-sell"

/** Each indicator's colour token and label. EMAs share the price scale; RSI has its own panel. */
export const INDICATOR_STYLE: Record<IndicatorId, { color: string; label: string }> = {
  ema20: { color: "var(--ind-ema20)", label: "EMA 20" },
  ema50: { color: "var(--ind-ema50)", label: "EMA 50" },
  rsi14: { color: "var(--ind-rsi)", label: "RSI 14" },
}

/** The RSI panel's guide lines. */
const RSI_LEVELS = [70, 50, 30] as const

type Props = {
  pair: string
  digits: number
  step: number
  nowWeek: number
  /** Closed candles, then the forming one last (its close is the current price). */
  candles: ChartCandle[]
  /** The open position's entry, SL and TP; placed with the candles' own scale. */
  levels?: ChartLevel[]
  /** The indicators switched on, one value per candle (aligned with `candles`). */
  indicators?: Partial<Record<IndicatorId, Series>>
  drawings: Drawing[]
  tool: Tool
  selected: string | null
  onSelect: (id: string | null) => void
  /** A finished change: the new list (for undo and saving). */
  onCommit: (next: Drawing[]) => void
  /** The tool finished a drawing; the desk goes back to "select". */
  onToolDone: () => void
}

type Draft =
  | { mode: "create"; kind: "trendline" | "rectangle"; a: Point; b: Point; moved: boolean }
  | { mode: "path"; points: Point[] }
  | { mode: "drag"; id: string; handle: string; from: Point; original: Drawing; current: Drawing }

const TOL_MOUSE = 6
const TOL_TOUCH = 14
const HANDLE_R = 6

let uid = 0
const newId = () => `d${Date.now().toString(36)}${(uid++).toString(36)}`

/**
 * The trading chart: candles, axes, a crosshair with weekday/hour only, and
 * the drawing tools. One scale (lib/live/geometry makeScale) places candles
 * and every drawing. Drawings are (time, price), so they stay put when the
 * timeframe changes. They are a thinking aid: nothing here scores or advises.
 */
export function LiveChart({ pair, digits, step, nowWeek, candles, levels = [], indicators = {}, drawings, tool, selected, onSelect, onCommit, onToolDone }: Props) {
  const t = useTranslations("demo.ui.desk")
  const locale = useLocale() as Locale
  const box = useRef<HTMLDivElement>(null)
  const clipId = useId()
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [draft, setDraft] = useState<Draft | null>(null)
  // A new tool or chart drops an unfinished drawing (reset during render, React's pattern for this).
  const defaultView: ChartView = { span: CHART.DEFAULT_VISIBLE + CHART.RIGHT_SLOTS, offset: null }
  const [view, setView] = useState<ChartView>(defaultView)
  const chartKey = `${pair}|${step}`
  const [viewFor, setViewFor] = useState(chartKey)
  if (viewFor !== chartKey) {
    setViewFor(chartKey)
    setView(defaultView)
  }
  const draftKey = `${tool}|${pair}|${step}`
  const [draftFor, setDraftFor] = useState(draftKey)
  if (draftFor !== draftKey) {
    setDraftFor(draftKey)
    setDraft(null)
  }
  const [hover, setHover] = useState<{ x: number; y: number } | null>(null)
  const lastTap = useRef<{ at: number; x: number; y: number } | null>(null)
  const touch = useRef(false)

  useLayoutEffect(() => {
    const el = box.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const times = useMemo(() => candles.map((c) => c.t), [candles])
  // The zoom/pan window, and the candles inside it (the price axis fits those).
  const limits = { min: CHART.MIN_VISIBLE, max: CHART.BARS + CHART.RIGHT_SLOTS, right: CHART.RIGHT_SLOTS }
  const win = clampView(view, candles.length, limits)
  const lo = Math.max(0, Math.floor(win.offset - 0.5))
  const hi = Math.min(candles.length - 1, Math.ceil(win.offset + win.span))
  const visible = useMemo(() => candles.slice(lo, hi + 1), [candles, lo, hi])
  const { ema20, ema50, rsi14 } = indicators
  // The price axis fits the EMA lines on screen too, so they are never cut off.
  const emaOnScreen = [ema20, ema50].flatMap((s) => (s ?? []).slice(lo, hi + 1).filter((v): v is number => v !== null))
  const frame = frameOf(visible.length ? visible : candles, [...levels.map((l) => l.price), ...emaOnScreen])
  const scale: Scale = makeScale(size.w || 1, size.h || 1, win.span, frame.min, frame.max, win.offset)
  // The RSI panel: same width, span and offset, so its x is the chart's x; y is 0–100.
  const rsiScale: Scale = makeScale(size.w || 1, CHART.RSI_HEIGHT, win.span, 0, 100, win.offset, RSI_PAD)
  // A pan in progress (one finger or the mouse on empty chart), and the fingers on the chart for a pinch.
  const pan = useRef<{ x: number; base: ChartView } | null>(null)
  const fingers = useRef(new Map<number, { x: number; y: number }>())
  const pinch = useRef<{ dist: number; base: ChartView; anchor: number } | null>(null)

  const zoomBy = (factor: number, anchor: number) => setView((v) => zoomView(v, candles.length, limits, factor, anchor))
  const centre = () => win.offset + win.span / 2 - 0.5
  const pip = instrument(pair).pipSize

  const project = (pt: Point) => ({ x: scale.indexToX(timeToIndex(times, step, pt.t)), y: scale.priceToY(pt.p) })
  const toPoint = (x: number, y: number): Point => ({
    t: Math.round(indexToTime(times, step, scale.xToIndex(x)) / 60) * 60,
    p: Number(scale.yToPrice(y).toFixed(digits)),
  })

  // What's on screen: committed drawings, with the one being dragged replaced by its draft.
  const shown = draft?.mode === "drag" ? drawings.map((d) => (d.id === draft.id ? draft.current : d)) : drawings
  const selectedDrawing = shown.find((d) => d.id === selected) ?? null

  function local(e: React.PointerEvent | React.MouseEvent) {
    const r = box.current!.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }

  function finishPath(points: Point[]) {
    const clean = points.filter((p, i) => i === 0 || p.t !== points[i - 1].t || p.p !== points[i - 1].p)
    setDraft(null)
    if (clean.length >= 2) commitNew({ id: newId(), kind: "path", points: clean.slice(0, DRAWINGS.MAX_PATH_POINTS) })
    else onToolDone()
  }

  function commitNew(d: Drawing) {
    if (drawings.length >= DRAWINGS.MAX) return onToolDone()
    onCommit([...drawings, d])
    onSelect(d.id)
    onToolDone()
  }

  /** Which handle of the selected drawing sits under (x, y), if any. */
  function handleAt(x: number, y: number, tol: number): string | null {
    if (!selectedDrawing) return null
    for (const [name, h] of Object.entries(handlesOf(selectedDrawing))) {
      if (Math.hypot(h.x - x, h.y - y) <= tol + HANDLE_R) return name
    }
    return null
  }

  function handlesOf(d: Drawing): Record<string, { x: number; y: number }> {
    switch (d.kind) {
      case "trendline":
      case "rectangle":
        return { a: project(d.a), b: project(d.b) }
      case "path":
        return Object.fromEntries(d.points.map((p, i) => [`p${i}`, project(p)]))
      case "hline":
        return {}
      case "position": {
        const a = project(d.a)
        const b = project(d.b)
        const mid = (a.x + b.x) / 2
        return { a, b: { x: b.x, y: a.y }, sl: { x: mid, y: scale.priceToY(d.sl) }, tp: { x: mid, y: scale.priceToY(d.tp) } }
      }
    }
  }

  function onPointerDown(e: React.PointerEvent) {
    touch.current = e.pointerType !== "mouse"
    const { x, y } = local(e)
    if (e.pointerType === "touch") {
      fingers.current.set(e.pointerId, { x, y })
      if (fingers.current.size === 2) {
        // A second finger: pinch to zoom, and drop whatever the first one started.
        const [a, b] = [...fingers.current.values()]
        pan.current = null
        setDraft(null)
        pinch.current = { dist: Math.hypot(a.x - b.x, a.y - b.y) || 1, base: view, anchor: scale.xToIndex((a.x + b.x) / 2) }
        return
      }
    }
    if (x > scale.plotW) return
    try {
      // Keeps a drag going when the finger leaves the chart. Can throw for a pointer that isn't active.
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {}
    const tol = touch.current ? TOL_TOUCH : TOL_MOUSE
    const pt = toPoint(x, y)

    // A second tap close to the first, soon after: a double tap.
    const now = e.timeStamp
    const double = lastTap.current && now - lastTap.current.at < 350 && Math.hypot(lastTap.current.x - x, lastTap.current.y - y) < 24
    lastTap.current = { at: now, x, y }

    if (draft?.mode === "path") {
      if (double) return finishPath(draft.points.slice(0, -1))
      const points = [...draft.points.slice(0, -1), pt, pt]
      if (points.length - 1 >= DRAWINGS.MAX_PATH_POINTS) return finishPath(points.slice(0, -1))
      return setDraft({ mode: "path", points })
    }
    if (draft?.mode === "create") {
      // Tap-tap: the second tap places the second point.
      const done = { ...draft, b: pt }
      setDraft(null)
      return commitNew({ id: newId(), kind: done.kind, a: done.a, b: done.b })
    }

    switch (tool) {
      case "select": {
        const handle = handleAt(x, y, tol)
        if (handle && selectedDrawing) {
          return setDraft({ mode: "drag", id: selectedDrawing.id, handle, from: pt, original: selectedDrawing, current: selectedDrawing })
        }
        const id = hitTest(drawings, { x, y }, project, scale, tol)
        onSelect(id)
        if (id) {
          const d = drawings.find((x) => x.id === id)!
          setDraft({ mode: "drag", id, handle: "move", from: pt, original: d, current: d })
        } else {
          // Empty chart: drag to look at older candles.
          pan.current = { x, base: view }
        }
        return
      }
      case "trendline":
      case "rectangle":
        return setDraft({ mode: "create", kind: tool, a: pt, b: pt, moved: false })
      case "path":
        return setDraft({ mode: "path", points: [pt, pt] })
      case "hline":
        return commitNew({ id: newId(), kind: "hline", p: pt.p })
      case "position-buy":
      case "position-sell": {
        // Neutral starting size: equal distances to SL and TP, which the player then moves.
        const recent = candles.slice(-14)
        const range = recent.length ? recent.reduce((s, c) => s + c.h - c.l, 0) / recent.length : pt.p * 0.002
        const d = Number((range * 1.5).toFixed(digits))
        const buy = tool === "position-buy"
        return commitNew({
          id: newId(),
          kind: "position",
          side: buy ? "buy" : "sell",
          a: pt,
          b: { t: pt.t + 20 * step, p: pt.p },
          sl: Number((buy ? pt.p - d : pt.p + d).toFixed(digits)),
          tp: Number((buy ? pt.p + d : pt.p - d).toFixed(digits)),
        })
      }
    }
  }

  function onPointerMove(e: React.PointerEvent) {
    const { x, y } = local(e)
    if (fingers.current.has(e.pointerId)) fingers.current.set(e.pointerId, { x, y })
    if (pinch.current && fingers.current.size >= 2) {
      const [a, b] = [...fingers.current.values()]
      const dist = Math.hypot(a.x - b.x, a.y - b.y) || 1
      const p = pinch.current
      setView(zoomView(p.base, candles.length, limits, p.dist / dist, p.anchor))
      return
    }
    if (pan.current) {
      const p = pan.current
      setView(panView(p.base, candles.length, limits, (x - p.x) / scale.slot))
      setHover(null)
      return
    }
    setHover(x <= scale.plotW && y <= scale.height - PAD.bottom ? { x, y } : null)
    if (!draft) return
    const pt = toPoint(x, y)
    if (draft.mode === "create") {
      const moved = draft.moved || Math.hypot(project(draft.a).x - x, project(draft.a).y - y) > 6
      return setDraft({ ...draft, b: pt, moved })
    }
    if (draft.mode === "path") return setDraft({ mode: "path", points: [...draft.points.slice(0, -1), pt] })
    if (draft.mode === "drag") setDraft({ ...draft, current: dragged(draft, pt) })
  }

  function dragged(dr: Extract<Draft, { mode: "drag" }>, pt: Point): Drawing {
    const o = dr.original
    if (dr.handle === "move") return moveDrawing(o, pt.t - dr.from.t, pt.p - dr.from.p)
    switch (o.kind) {
      case "trendline":
      case "rectangle":
        return dr.handle === "a" ? { ...o, a: pt } : { ...o, b: pt }
      case "path":
        return { ...o, points: o.points.map((p, i) => (`p${i}` === dr.handle ? pt : p)) }
      case "position": {
        const buy = o.side === "buy"
        if (dr.handle === "a") {
          // Entry moves; SL and TP keep their distances.
          const dp = pt.p - o.a.p
          return { ...o, a: pt, b: { t: Math.max(o.b.t, pt.t + step), p: pt.p }, sl: o.sl + dp, tp: o.tp + dp }
        }
        if (dr.handle === "b") return { ...o, b: { t: Math.max(pt.t, o.a.t + step), p: o.a.p } }
        // SL and TP can't cross to the other side of entry.
        const gap = pip
        if (dr.handle === "sl") return { ...o, sl: buy ? Math.min(pt.p, o.a.p - gap) : Math.max(pt.p, o.a.p + gap) }
        return { ...o, tp: buy ? Math.max(pt.p, o.a.p + gap) : Math.min(pt.p, o.a.p - gap) }
      }
      default:
        return o
    }
  }

  function endPointer(e: React.PointerEvent) {
    fingers.current.delete(e.pointerId)
    if (fingers.current.size < 2) pinch.current = null
    pan.current = null
  }

  function onPointerUp(e: React.PointerEvent) {
    endPointer(e)
    if (!draft) return
    if (draft.mode === "create") {
      // A drag made the line; a plain tap waits for the second tap.
      if (draft.moved) {
        setDraft(null)
        commitNew({ id: newId(), kind: draft.kind, a: draft.a, b: draft.b })
      }
      return
    }
    if (draft.mode === "drag") {
      const changed = JSON.stringify(draft.current) !== JSON.stringify(draft.original)
      setDraft(null)
      if (changed) onCommit(drawings.map((d) => (d.id === draft.id ? round(draft.current, digits) : d)))
    }
  }

  const onWheel = useEffectEvent((e: WheelEvent) => {
    const r = box.current!.getBoundingClientRect()
    const x = e.clientX - r.left
    if (x > scale.plotW) return
    e.preventDefault()
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      setView((v) => panView(v, candles.length, limits, -e.deltaX / scale.slot))
    } else if (e.deltaY !== 0) {
      zoomBy(e.deltaY > 0 ? CHART.ZOOM_STEP : 1 / CHART.ZOOM_STEP, scale.xToIndex(x))
    }
  })
  useEffect(() => {
    const el = box.current
    if (!el) return
    const handler = (e: WheelEvent) => onWheel(e)
    el.addEventListener("wheel", handler, { passive: false })
    return () => el.removeEventListener("wheel", handler)
  }, [])

  // + and − zoom from the keyboard (not while typing).
  const onZoomKey = useEffectEvent((e: KeyboardEvent) => {
    const target = e.target as HTMLElement | null
    if (e.metaKey || e.ctrlKey || e.altKey || target?.closest("input, textarea, select, [contenteditable]")) return
    if (e.key === "+" || e.key === "=") zoomBy(1 / CHART.ZOOM_STEP, centre())
    else if (e.key === "-" || e.key === "_") zoomBy(CHART.ZOOM_STEP, centre())
  })
  useEffect(() => {
    const handler = (e: KeyboardEvent) => onZoomKey(e)
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  // Escape cancels a drawing in progress; Enter finishes a path.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!draft) return
      if (e.key === "Escape") {
        setDraft(null)
        onToolDone()
      } else if (e.key === "Enter" && draft.mode === "path") finishPath(draft.points.slice(0, -1))
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  })


  const ticks = timeTicks(candles.length, scale.slot).filter((i) => i >= lo && i <= hi)
  const last = candles[candles.length - 1]
  const hoverIndex = hover ? Math.round(scale.xToIndex(hover.x)) : null
  const hoverCandle = hoverIndex !== null && hoverIndex >= 0 && hoverIndex < candles.length ? candles[hoverIndex] : null
  const readout = hoverCandle ?? last
  const readoutIndex = hoverCandle ? hoverIndex! : candles.length - 1
  const valueAt = (s: Series | undefined) => (s ? (s[readoutIndex] ?? null) : undefined)
  const rsiNow = valueAt(rsi14)
  const fmt = (v: number) => v.toFixed(digits)
  const tickFmt = (v: number) => v.toFixed(Math.max(0, digits - 1))
  const body = Math.max(1, scale.slot * 0.62)

  return (
    <div>
    <div className="relative">
      <div
        ref={box}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={(e) => {
          endPointer(e)
          setDraft(null)
        }}
        onPointerLeave={() => setHover(null)}
        onDoubleClick={() => draft?.mode === "path" && finishPath(draft.points.slice(0, -1))}
        className={[
          "relative h-[320px] w-full touch-none select-none overflow-hidden sm:h-[420px] lg:h-[460px]",
          tool === "select" ? "cursor-default" : "cursor-crosshair",
        ].join(" ")}
      >
        {size.w > 0 && candles.length > 0 && (
          <svg width={size.w} height={size.h} className="block" role="img" aria-label={t("chartAria", { pair })}>
            {/* Grid and price axis */}
            {frame.priceTicks.map((p) => (
              <g key={p} opacity={last && Math.abs(scale.priceToY(p) - scale.priceToY(last.c)) < 14 ? 0 : 1}>
                <line x1={0} x2={scale.plotW} y1={scale.priceToY(p)} y2={scale.priceToY(p)} stroke="var(--border)" strokeOpacity={0.5} />
                <text x={scale.plotW + 6} y={scale.priceToY(p) + 4} fontSize={11} fill="var(--muted-foreground)" fontFamily="var(--font-mono)">
                  {tickFmt(p)}
                </text>
              </g>
            ))}
            <line x1={scale.plotW} x2={scale.plotW} y1={0} y2={size.h - PAD.bottom} stroke="var(--border)" />

            {/* Time axis: weekday and hour only, never a date. */}
            {ticks.map((i) => (
              <text
                key={i}
                x={Math.min(Math.max(scale.indexToX(i), 34), scale.plotW - 34)}
                y={size.h - 7}
                textAnchor="middle"
                fontSize={11}
                fill="var(--muted-foreground)"
                fontFamily="var(--font-mono)"
              >
                {dayTimeLabel(candles[i].t, nowWeek, locale)}
              </text>
            ))}

            {/* Candles */}
            {candles.map((c, i) => {
              if (i < lo || i > hi) return null
              const x = scale.indexToX(i)
              const up = c.c >= c.o
              const color = up ? "var(--success)" : "var(--danger)"
              const y1 = scale.priceToY(Math.max(c.o, c.c))
              const y2 = scale.priceToY(Math.min(c.o, c.c))
              return (
                <g key={c.t}>
                  <line x1={x} x2={x} y1={scale.priceToY(c.h)} y2={scale.priceToY(c.l)} stroke={color} strokeWidth={1} />
                  <rect x={x - body / 2} y={y1} width={body} height={Math.max(1, y2 - y1)} fill={color} />
                </g>
              )
            })}

            {/* Last price */}
            {last && (
              <g>
                <line
                  x1={0}
                  x2={scale.plotW}
                  y1={scale.priceToY(last.c)}
                  y2={scale.priceToY(last.c)}
                  stroke="var(--foreground)"
                  strokeOpacity={0.35}
                  strokeDasharray="2 3"
                />
                <rect x={scale.plotW} y={scale.priceToY(last.c) - 9} width={PAD.right} height={18} fill="var(--foreground)" />
                <text x={scale.plotW + 6} y={scale.priceToY(last.c) + 4} fontSize={11} fill="var(--background)" fontFamily="var(--font-mono)">
                  {fmt(last.c)}
                </text>
              </g>
            )}

            <defs>
              <clipPath id={`plot-${clipId}`}>
                <rect x={0} y={0} width={scale.plotW} height={size.h - PAD.bottom} />
              </clipPath>
            </defs>

            {/* The open position: entry, SL and TP across the plot, prices on the axis. */}
            {levels.map((l) => {
              const y = scale.priceToY(l.price)
              return (
                <g key={`level-${l.kind}`} pointerEvents="none">
                  <line
                    x1={0}
                    x2={scale.plotW}
                    y1={y}
                    y2={y}
                    stroke={l.kind === "entry" ? "var(--foreground)" : "var(--primary)"}
                    strokeWidth={1.5}
                    strokeDasharray={l.kind === "sl" ? "5 4" : l.kind === "entry" ? "2 3" : undefined}
                  />
                  <text x={6} y={y - 5} fontSize={11} fontWeight={700} fill="var(--foreground)" fontFamily="var(--font-mono)">
                    {l.label}
                  </text>
                  <rect x={scale.plotW} y={y - 9} width={PAD.right} height={18} fill={l.kind === "entry" ? "var(--foreground)" : "var(--primary)"} />
                  <text x={scale.plotW + 6} y={y + 4} fontSize={11} fill={l.kind === "entry" ? "var(--background)" : "var(--primary-foreground)"} fontFamily="var(--font-mono)">
                    {l.price.toFixed(digits)}
                  </text>
                </g>
              )
            })}

            {/* Horizontal lines' prices, on the axis (outside the plot's clip). */}
            {shown.map(
              (d) =>
                d.kind === "hline" && (
                  <g key={`badge-${d.id}`}>
                    <rect x={scale.plotW} y={scale.priceToY(d.p) - 9} width={PAD.right} height={18} fill="var(--primary)" />
                    <text x={scale.plotW + 6} y={scale.priceToY(d.p) + 4} fontSize={11} fill="var(--primary-foreground)" fontFamily="var(--font-mono)">
                      {d.p.toFixed(digits)}
                    </text>
                  </g>
                ),
            )}

            {/* EMA lines, on the candles' own scale, under the drawings. */}
            <g clipPath={`url(#plot-${clipId})`} pointerEvents="none">
              {(["ema50", "ema20"] as const).map((id) => {
                const s = indicators[id]
                return s ? (
                  <path key={id} d={seriesPath(s, scale, lo, hi)} fill="none" stroke={INDICATOR_STYLE[id].color} strokeWidth={1.5} strokeLinejoin="round" />
                ) : null
              })}
            </g>

            {/* Drawings, kept inside the plot. */}
            <g clipPath={`url(#plot-${clipId})`}>
              {shown.map((d) => (
                <DrawingShape key={d.id} d={d} scale={scale} project={project} selected={d.id === selected} digits={digits} pip={pip} t={t} />
              ))}
              {draft?.mode === "create" && (
                <DrawingShape d={{ id: "draft", kind: draft.kind, a: draft.a, b: draft.b }} scale={scale} project={project} selected={false} digits={digits} pip={pip} t={t} />
              )}
              {draft?.mode === "path" && draft.points.length >= 2 && (
                <DrawingShape d={{ id: "draft", kind: "path", points: draft.points }} scale={scale} project={project} selected={false} digits={digits} pip={pip} t={t} />
              )}
              {selectedDrawing &&
                Object.entries(handlesOf(selectedDrawing)).map(([name, h]) => (
                  <circle key={name} cx={h.x} cy={h.y} r={HANDLE_R} fill="var(--background)" stroke="var(--primary)" strokeWidth={2} />
                ))}
            </g>

            {/* Crosshair */}
            {hover && (
              <g pointerEvents="none">
                <line x1={hover.x} x2={hover.x} y1={0} y2={size.h - PAD.bottom} stroke="var(--muted-foreground)" strokeDasharray="3 3" />
                <line x1={0} x2={scale.plotW} y1={hover.y} y2={hover.y} stroke="var(--muted-foreground)" strokeDasharray="3 3" />
                <rect x={scale.plotW} y={hover.y - 9} width={PAD.right} height={18} fill="var(--inset)" stroke="var(--border)" />
                <text x={scale.plotW + 6} y={hover.y + 4} fontSize={11} fill="var(--foreground)" fontFamily="var(--font-mono)">
                  {fmt(scale.yToPrice(hover.y))}
                </text>
                <rect x={hover.x - 36} y={size.h - PAD.bottom} width={72} height={PAD.bottom} fill="var(--inset)" stroke="var(--border)" />
                <text x={hover.x} y={size.h - 7} textAnchor="middle" fontSize={11} fill="var(--foreground)" fontFamily="var(--font-mono)">
                  {dayTimeLabel(indexToTime(times, step, Math.round(scale.xToIndex(hover.x))), nowWeek, locale)}
                </text>
              </g>
            )}
          </svg>
        )}
      </div>

      {/* Zoom controls. "Back to latest" shows only while looking at older candles. */}
      <div className="absolute flex gap-1" style={{ right: PAD.right + 6, bottom: PAD.bottom + 6 }}>
        {!win.pinned && (
          <button
            type="button"
            onClick={() => setView((v) => ({ span: v.span, offset: null }))}
            className="glass-card glass-strong flex h-11 items-center gap-1 rounded-lg px-2.5 text-xs font-semibold text-foreground"
          >
            <ChevronsRight className="h-4 w-4" aria-hidden="true" /> {t("toLatest")}
          </button>
        )}
        <button
          type="button"
          onClick={() => zoomBy(1 / CHART.ZOOM_STEP, centre())}
          disabled={win.span <= CHART.MIN_VISIBLE}
          aria-label={t("zoomIn")}
          title={t("zoomIn")}
          className="glass-card glass-strong flex h-11 w-11 items-center justify-center rounded-lg text-foreground disabled:opacity-40"
        >
          <ZoomIn className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => zoomBy(CHART.ZOOM_STEP, centre())}
          disabled={win.span >= Math.min(limits.max, candles.length + CHART.RIGHT_SLOTS)}
          aria-label={t("zoomOut")}
          title={t("zoomOut")}
          className="glass-card glass-strong flex h-11 w-11 items-center justify-center rounded-lg text-foreground disabled:opacity-40"
        >
          <ZoomOut className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {/* Readout: the candle under the crosshair, or the last one. Weekday and hour only. */}
      {readout && (
        <div className="pointer-events-none absolute left-2 top-1 flex flex-col items-start gap-0.5 font-mono text-[11px] tabular-nums text-muted-foreground">
          <p className="rounded-md bg-background/70 px-2 py-0.5">
            {dayTimeLabel(readout.t, nowWeek, locale)} · O {fmt(readout.o)} H {fmt(readout.h)} L {fmt(readout.l)} C {fmt(readout.c)}
          </p>
          {(ema20 || ema50) && (
            <p className="flex gap-3 rounded-md bg-background/70 px-2 py-0.5">
              {(["ema20", "ema50"] as const).map((id) => {
                const v = valueAt(indicators[id])
                return v === undefined ? null : (
                  <span key={id} style={{ color: INDICATOR_STYLE[id].color }}>
                    {INDICATOR_STYLE[id].label} {v === null ? "—" : fmt(v)}
                  </span>
                )
              })}
            </p>
          )}
        </div>
      )}
      {draft?.mode === "path" && (
        <button
          type="button"
          onClick={() => finishPath(draft.points.slice(0, -1))}
          className="btn btn-sm absolute bottom-8 left-2"
        >
          {t("finishPath")}
        </button>
      )}
      {draft?.mode === "create" && !draft.moved && (
        <p className="pointer-events-none absolute bottom-8 left-2 rounded-md bg-background/80 px-2 py-1 text-xs">{t("secondPoint")}</p>
      )}
    </div>

    {/* RSI 14 in its own panel: 0–100, guides at 30, 50 and 70, candles under the chart's. */}
    {rsi14 && size.w > 0 && (
      <div className="relative mt-1 border-t border-border" style={{ height: CHART.RSI_HEIGHT }}>
        <svg width={size.w} height={CHART.RSI_HEIGHT} className="block" role="img" aria-label={t("rsiAria", { pair })}>
          <defs>
            <clipPath id={`rsi-${clipId}`}>
              <rect x={0} y={0} width={rsiScale.plotW} height={CHART.RSI_HEIGHT} />
            </clipPath>
          </defs>
          <rect
            x={0}
            width={rsiScale.plotW}
            y={rsiScale.priceToY(70)}
            height={rsiScale.priceToY(30) - rsiScale.priceToY(70)}
            fill="var(--ind-rsi)"
            fillOpacity={0.06}
          />
          {RSI_LEVELS.map((v) => (
            <g key={v}>
              <line
                x1={0}
                x2={rsiScale.plotW}
                y1={rsiScale.priceToY(v)}
                y2={rsiScale.priceToY(v)}
                stroke="var(--muted-foreground)"
                strokeOpacity={v === 50 ? 0.3 : 0.55}
                strokeDasharray="3 4"
              />
              <text x={rsiScale.plotW + 6} y={rsiScale.priceToY(v) + 4} fontSize={11} fill="var(--muted-foreground)" fontFamily="var(--font-mono)">
                {v}
              </text>
            </g>
          ))}
          <line x1={rsiScale.plotW} x2={rsiScale.plotW} y1={0} y2={CHART.RSI_HEIGHT} stroke="var(--border)" />
          <path
            d={seriesPath(rsi14, rsiScale, lo, hi)}
            clipPath={`url(#rsi-${clipId})`}
            fill="none"
            stroke={INDICATOR_STYLE.rsi14.color}
            strokeWidth={1.5}
            strokeLinejoin="round"
          />
          {/* The latest value on the axis, like the last price. */}
          {rsi14[rsi14.length - 1] != null && (
            <g>
              <rect x={rsiScale.plotW} y={rsiScale.priceToY(rsi14[rsi14.length - 1]!) - 9} width={RSI_PAD.right} height={18} fill={INDICATOR_STYLE.rsi14.color} />
              <text x={rsiScale.plotW + 6} y={rsiScale.priceToY(rsi14[rsi14.length - 1]!) + 4} fontSize={11} fill="var(--background)" fontFamily="var(--font-mono)">
                {rsi14[rsi14.length - 1]!.toFixed(2)}
              </text>
            </g>
          )}
          {hover && <line x1={hover.x} x2={hover.x} y1={0} y2={CHART.RSI_HEIGHT} stroke="var(--muted-foreground)" strokeDasharray="3 3" pointerEvents="none" />}
        </svg>
        <p
          className="pointer-events-none absolute left-2 top-1 rounded-md bg-background/70 px-2 py-0.5 font-mono text-[11px] tabular-nums"
          style={{ color: INDICATOR_STYLE.rsi14.color }}
        >
          {INDICATOR_STYLE.rsi14.label} {rsiNow == null ? "—" : rsiNow.toFixed(2)}
        </p>
      </div>
    )}
    </div>
  )
}

/** Prices back to the pair's precision after a drag. */
function round(d: Drawing, digits: number): Drawing {
  const r = (v: number) => Number(v.toFixed(digits))
  const rp = (p: Point): Point => ({ t: p.t, p: r(p.p) })
  switch (d.kind) {
    case "hline":
      return { ...d, p: r(d.p) }
    case "path":
      return { ...d, points: d.points.map(rp) }
    case "position":
      return { ...d, a: rp(d.a), b: rp(d.b), sl: r(d.sl), tp: r(d.tp) }
    default:
      return { ...d, a: rp(d.a), b: rp(d.b) }
  }
}

function DrawingShape({
  d,
  scale,
  project,
  selected,
  digits,
  pip,
  t,
}: {
  d: Drawing
  scale: Scale
  project: (p: Point) => { x: number; y: number }
  selected: boolean
  digits: number
  pip: number
  t: ReturnType<typeof useTranslations>
}) {
  const stroke = "var(--primary)"
  const width = selected ? 2.5 : 1.5
  switch (d.kind) {
    case "trendline": {
      const a = project(d.a)
      const b = project(d.b)
      return <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={stroke} strokeWidth={width} strokeLinecap="round" />
    }
    case "rectangle": {
      const a = project(d.a)
      const b = project(d.b)
      return (
        <rect
          x={Math.min(a.x, b.x)}
          y={Math.min(a.y, b.y)}
          width={Math.abs(b.x - a.x)}
          height={Math.abs(b.y - a.y)}
          fill="var(--primary)"
          fillOpacity={0.1}
          stroke={stroke}
          strokeWidth={width}
        />
      )
    }
    case "hline": {
      const y = scale.priceToY(d.p)
      return <line x1={0} x2={scale.plotW} y1={y} y2={y} stroke={stroke} strokeWidth={width} />
    }
    case "path": {
      const pts = d.points.map(project)
      return (
        <polyline
          points={pts.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="none"
          stroke={stroke}
          strokeWidth={width}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      )
    }
    case "position": {
      const a = project(d.a)
      const b = project(d.b)
      const x = Math.min(a.x, b.x)
      const w = Math.max(2, Math.abs(b.x - a.x))
      const ySl = scale.priceToY(d.sl)
      const yTp = scale.priceToY(d.tp)
      const { rr } = positionStats(d)
      const pips = (v: number) => (Math.abs(v - d.a.p) / pip).toFixed(1)
      const label = (y: number, text: string, below: boolean) => (
        <text x={x + 6} y={below ? y + 14 : y - 5} fontSize={11} fill="var(--foreground)" fontFamily="var(--font-mono)">
          {text}
        </text>
      )
      return (
        <g>
          {/* Target zone brighter, risk zone fainter: both amber, the tool isn't a market signal. */}
          <rect x={x} y={Math.min(a.y, yTp)} width={w} height={Math.abs(yTp - a.y)} fill="var(--primary)" fillOpacity={0.22} />
          <rect x={x} y={Math.min(a.y, ySl)} width={w} height={Math.abs(ySl - a.y)} fill="var(--primary)" fillOpacity={0.08} stroke={stroke} strokeDasharray="4 3" strokeWidth={1} />
          <line x1={x} x2={x + w} y1={a.y} y2={a.y} stroke="var(--foreground)" strokeWidth={width} />
          <line x1={x} x2={x + w} y1={yTp} y2={yTp} stroke={stroke} strokeWidth={width} />
          <line x1={x} x2={x + w} y1={ySl} y2={ySl} stroke={stroke} strokeWidth={width} strokeDasharray="4 3" />
          {label(yTp, t("posTp", { price: d.tp.toFixed(digits), pips: pips(d.tp) }), d.side === "sell")}
          {label(ySl, t("posSl", { price: d.sl.toFixed(digits), pips: pips(d.sl) }), d.side === "buy")}
          <text
            x={x + 6}
            y={a.y + (d.side === "buy" ? 14 : -5)}
            fontSize={11}
            fontWeight={700}
            fill={d.side === "buy" ? "var(--success)" : "var(--danger)"}
            fontFamily="var(--font-mono)"
          >
            {d.side.toUpperCase()} · {t("posRr", { rr: rr === null ? "—" : rr.toFixed(2) })}
          </text>
        </g>
      )
    }
  }
}
