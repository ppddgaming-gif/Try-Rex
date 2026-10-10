"use client"

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { frameOf } from "@/lib/chart-geometry"
import { instrument } from "@/lib/demo/instruments"
import type { Locale } from "@/lib/i18n/locale"
import { CHART, DRAWINGS } from "@/lib/live/config"
import { positionStats, type Drawing, type DrawingKind, type Point } from "@/lib/live/drawings"
import { PAD, hitTest, makeScale, moveDrawing, timeTicks, type Scale } from "@/lib/live/geometry"
import { dayTimeLabel, indexToTime, timeToIndex } from "@/lib/live/time"

/** A candle as the browser has it: `t` in seconds relative to now. */
export type ChartCandle = { t: number; o: number; h: number; l: number; c: number }

/** "select" or a drawing kind; positions come as buy and sell. */
export type Tool = "select" | Exclude<DrawingKind, "position"> | "position-buy" | "position-sell"

type Props = {
  pair: string
  digits: number
  step: number
  nowWeek: number
  candles: ChartCandle[]
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
export function LiveChart({ pair, digits, step, nowWeek, candles, drawings, tool, selected, onSelect, onCommit, onToolDone }: Props) {
  const t = useTranslations("demo.ui.desk")
  const locale = useLocale() as Locale
  const box = useRef<HTMLDivElement>(null)
  const clipId = useId()
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [draft, setDraft] = useState<Draft | null>(null)
  // A new tool or chart drops an unfinished drawing (reset during render, React's pattern for this).
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
  const frame = useMemo(() => frameOf(candles), [candles])
  const count = candles.length + CHART.RIGHT_SLOTS
  const scale: Scale = makeScale(size.w || 1, size.h || 1, count, frame.min, frame.max)
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

  function onPointerUp() {
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


  const ticks = timeTicks(candles.length, scale.slot)
  const last = candles[candles.length - 1]
  const hoverIndex = hover ? Math.round(scale.xToIndex(hover.x)) : null
  const hoverCandle = hoverIndex !== null && hoverIndex >= 0 && hoverIndex < candles.length ? candles[hoverIndex] : null
  const readout = hoverCandle ?? last
  const fmt = (v: number) => v.toFixed(digits)
  const tickFmt = (v: number) => v.toFixed(Math.max(0, digits - 1))
  const body = Math.max(1, scale.slot * 0.62)

  return (
    <div className="relative">
      <div
        ref={box}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => setDraft(null)}
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

      {/* Readout: the candle under the crosshair, or the last one. Weekday and hour only. */}
      {readout && (
        <p className="pointer-events-none absolute left-2 top-1 rounded-md bg-background/70 px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
          {dayTimeLabel(readout.t, nowWeek, locale)} · O {fmt(readout.o)} H {fmt(readout.h)} L {fmt(readout.l)} C {fmt(readout.c)}
        </p>
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
