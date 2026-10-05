"use client"

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { Rex } from "@/components/rex-mascot"
import { findTarget, reducedMotion, revealInScrollers } from "@/components/tour/tour-dom"
import { placeCard, ringRect, scrollDelta, type Placement, type Rect } from "@/lib/tour-geometry"
import { stepText, stepTitle, type Tour, type TourContext } from "@/lib/tours"

/** Below this width the card docks to the bottom of the screen. */
const DOCK_QUERY = "(max-width: 767px)"
/** The phone's sticky top bar (h-16) plus a little air. */
const PHONE_HEADER = 72
/** About a quarter second of frames without the step's element before it's skipped. */
const MISSING_FRAMES = 15

type Geometry = { ring: Rect | null; place: Placement }

const sameRect = (a: Rect | null, b: Rect | null) =>
  a === b ||
  (a !== null &&
    b !== null &&
    Math.abs(a.top - b.top) < 0.5 &&
    Math.abs(a.left - b.left) < 0.5 &&
    Math.abs(a.width - b.width) < 0.5 &&
    Math.abs(a.height - b.height) < 0.5)

const samePlace = (a: Placement, b: Placement) =>
  a.kind === b.kind && (a.kind !== "float" || b.kind !== "float" || (Math.abs(a.top - b.top) < 0.5 && Math.abs(a.left - b.left) < 0.5))

/**
 * One tour on screen: the page dimmed, the step's element cut out and ringed
 * in amber, and Rex's card beside it (docked at the bottom on a phone). Every
 * position comes from measuring the element each frame, so the highlight
 * follows scrolling, resizing and content that loads late. The steps are the
 * ones on screen when the tour starts; one that disappears later is skipped.
 */
export function TourOverlay({
  tour,
  context,
  onClose,
  onFinish,
}: {
  tour: Tour
  context: TourContext
  onClose: () => void
  onFinish: (href: string) => void
}) {
  // Decided once: the steps whose element is on screen now (or that have none).
  const [steps] = useState(() => tour.steps.filter((s) => s.targets.length === 0 || findTarget(s.targets)))
  const [index, setIndex] = useState(0)
  const [geo, setGeo] = useState<Geometry | null>(null)
  const card = useRef<HTMLDivElement>(null)
  const primary = useRef<HTMLButtonElement>(null)
  const returnFocus = useRef<Element | null>(null)
  const titleId = useId()
  const textId = useId()

  const step = steps[index]
  const last = index === steps.length - 1

  const next = () => (last ? onClose() : setIndex((i) => i + 1))
  const back = () => setIndex((i) => Math.max(0, i - 1))
  const finish = () => (tour.finish ? onFinish(tour.finish.href) : onClose())

  // Remember where focus was, and put it back when the tour ends.
  useEffect(() => {
    returnFocus.current = document.activeElement
    return () => {
      if (returnFocus.current instanceof HTMLElement) returnFocus.current.focus({ preventScroll: true })
    }
  }, [])

  // With the card docked at the bottom, an element at the very end of the
  // page couldn't scroll clear of it. Room below the page while the tour is
  // open fixes that; it goes when the tour ends. Declared before the scroll
  // effect so the room exists when that runs.
  useLayoutEffect(() => {
    if (!window.matchMedia(DOCK_QUERY).matches) return
    const body = document.body
    const before = body.style.paddingBottom
    body.style.paddingBottom = "60dvh"
    return () => {
      body.style.paddingBottom = before
    }
  }, [])

  // Each step: bring its element into view (inside its own scroller too),
  // clear of the sticky header and the docked card, then focus the card.
  useLayoutEffect(() => {
    if (!step) return
    const el = step.targets.length > 0 ? findTarget(step.targets) : null
    if (el) {
      revealInScrollers(el)
      const docked = window.matchMedia(DOCK_QUERY).matches
      const r = el.getBoundingClientRect()
      const cardHeight = card.current?.getBoundingClientRect().height ?? 0
      const band = docked
        ? { top: PHONE_HEADER, bottom: cardHeight + 24 }
        : { top: window.matchMedia("(min-width: 1024px)").matches ? 16 : PHONE_HEADER, bottom: 16 }
      const dy = scrollDelta(
        { top: r.top, left: r.left, width: r.width, height: r.height },
        { width: window.innerWidth, height: window.innerHeight },
        band,
      )
      if (dy !== 0) window.scrollBy({ top: dy, behavior: reducedMotion() ? "auto" : "smooth" })
    }
    // Focus goes to "Lanjut": screen readers announce the dialog (its title
    // and text), and Enter or Space moves on.
    primary.current?.focus({ preventScroll: true })
  }, [index]) // eslint-disable-line react-hooks/exhaustive-deps

  // Follow the element every frame while the tour is open: cheap (one
  // measurement), and it tracks scrolling, animations and late content alike.
  // A step whose element has gone since the tour started (the answer was
  // sent, a tab closed) is skipped once it has been missing for a moment.
  useEffect(() => {
    if (!step) return
    let frame = 0
    let missing = 0
    const measure = () => {
      const el = step.targets.length > 0 ? findTarget(step.targets) : null
      if (step.targets.length > 0 && !el && ++missing > MISSING_FRAMES) {
        if (last) onClose()
        else setIndex((i) => i + 1)
        return
      }
      if (el) missing = 0
      const view = { width: window.innerWidth, height: window.innerHeight }
      const ring = el ? ringRect(rectOf(el), view) : null
      const size = card.current?.getBoundingClientRect() ?? { width: 360, height: 200 }
      const place = placeCard(ring, { width: size.width, height: size.height }, view, window.matchMedia(DOCK_QUERY).matches)
      setGeo((g) => (g && sameRect(g.ring, ring) && samePlace(g.place, place) ? g : { ring, place }))
      frame = requestAnimationFrame(measure)
    }
    frame = requestAnimationFrame(measure)
    return () => cancelAnimationFrame(frame)
  }, [step, last, onClose])

  // Keys while the tour is open. Captured at the window and stopped there, so
  // the page's own shortcuts (B / S / W, Enter in the game) don't fire behind
  // the card; a focused button's Enter and Space still work as usual.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      e.stopPropagation()
      if (e.key === "Escape") {
        e.preventDefault()
        onClose()
      } else if (e.key === "ArrowRight") {
        e.preventDefault()
        if (last) finish()
        else next()
      } else if (e.key === "ArrowLeft") {
        e.preventDefault()
        back()
      } else if (e.key === "Tab" && card.current) {
        // Keep focus inside the card.
        const items = [...card.current.querySelectorAll<HTMLElement>("button")]
        if (items.length === 0) return
        const first = items[0]
        const end = items[items.length - 1]
        const active = document.activeElement
        if (e.shiftKey && (active === first || active === card.current)) {
          e.preventDefault()
          end.focus()
        } else if (!e.shiftKey && (active === end || !card.current.contains(active))) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener("keydown", onKey, true)
    return () => window.removeEventListener("keydown", onKey, true)
  })

  if (!step || typeof document === "undefined") return null

  const place = geo?.place ?? { kind: "center" as const }
  const ring = geo?.ring ?? null
  const cardPosition =
    place.kind === "float"
      ? { top: place.top, left: place.left }
      : place.kind === "center"
        ? { top: "50%", left: "50%", transform: "translate(-50%, -50%)" }
        : undefined

  return createPortal(
    <div className="fixed inset-0 z-[100]" data-tour-layer="">
      {/* Blocks the page while the tour is open; the dim comes from the ring's shadow. */}
      <div className="absolute inset-0" aria-hidden="true" onClick={(e) => e.stopPropagation()} />
      {ring ? (
        <div
          aria-hidden="true"
          className="tour-ring pointer-events-none absolute rounded-xl"
          style={{ top: ring.top, left: ring.left, width: ring.width, height: ring.height }}
        />
      ) : (
        <div aria-hidden="true" className="tour-dim pointer-events-none absolute inset-0" />
      )}

      <div
        ref={card}
        key={index}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={textId}
        tabIndex={-1}
        data-tour-card=""
        className={[
          "tour-card glass-card glass-strong absolute rounded-2xl border-primary/40 p-4 shadow-xl outline-none sm:p-5",
          place.kind === "dock" ? "inset-x-3 bottom-3 mx-auto max-h-[50dvh] max-w-xl overflow-y-auto" : "w-[min(360px,calc(100vw-32px))]",
        ].join(" ")}
        style={cardPosition}
      >
        <div className="flex items-start gap-3">
          <Rex size={40} mood="happy" className="shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[11px] text-muted-foreground" aria-hidden="true">
              {index + 1}/{steps.length}
            </p>
            <h2 id={titleId} className="mt-0.5 font-display text-base font-bold leading-snug">
              {stepTitle(step, context)}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="-mr-2 -mt-2 inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg px-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            Lewati
          </button>
        </div>

        <p id={textId} className="mt-3 text-sm leading-relaxed text-foreground/90">
          {stepText(step, context)}
        </p>

        <ol className="mt-4 flex items-center gap-1.5" aria-label={`Langkah ${index + 1} dari ${steps.length}`}>
          {steps.map((s, i) => (
            <li
              key={i}
              aria-hidden="true"
              className={["h-1.5 rounded-full transition-colors", i === index ? "w-4 bg-primary" : "w-1.5 bg-faint/50"].join(" ")}
            />
          ))}
        </ol>

        <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
          {index > 0 && (
            <button type="button" onClick={back} className="btn btn-ghost btn-sm">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Kembali
            </button>
          )}
          <button ref={primary} type="button" onClick={last ? finish : next} className="btn btn-sm">
            {last ? (tour.finish?.label ?? "Selesai") : "Lanjut"}
            {(!last || tour.finish) && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

function rectOf(el: HTMLElement): Rect {
  const r = el.getBoundingClientRect()
  return { top: r.top, left: r.left, width: r.width, height: r.height }
}
