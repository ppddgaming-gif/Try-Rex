// Where a tour card goes, from the highlighted element's real position (the
// tour's version of rule #4: nothing is placed by hand-picked pixels). Pure,
// so it can be tested; components/tour/tour-overlay.tsx measures and calls it.

export type Rect = { top: number; left: number; width: number; height: number }
export type Size = { width: number; height: number }
export type Placement = { kind: "float"; top: number; left: number } | { kind: "dock" } | { kind: "center" }

/** Space kept between the card, the highlight and the screen edge. */
export const GAP = 12
export const EDGE = 16
/** Padding drawn around the highlighted element. */
export const RING_PAD = 6

/** The highlight: the element's box plus a little room, kept on screen. */
export function ringRect(target: Rect, view: Size): Rect {
  const left = Math.max(2, target.left - RING_PAD)
  const top = Math.max(2, target.top - RING_PAD)
  const right = Math.min(view.width - 2, target.left + target.width + RING_PAD)
  const bottom = Math.min(view.height - 2, target.top + target.height + RING_PAD)
  return { left, top, width: Math.max(0, right - left), height: Math.max(0, bottom - top) }
}

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), Math.max(min, max))

/**
 * Next to the highlight where the card fits: beside a narrow element (a
 * sidebar link), under or over a wide one (the chart). Docked to the bottom
 * on a phone, or when it fits nowhere. A step without a target is centred.
 */
export function placeCard(ring: Rect | null, card: Size, view: Size, docked: boolean): Placement {
  if (docked) return { kind: "dock" }
  if (!ring) return { kind: "center" }

  const maxLeft = view.width - EDGE - card.width
  const maxTop = view.height - EDGE - card.height
  const midX = clamp(ring.left + ring.width / 2 - card.width / 2, EDGE, maxLeft)
  const midY = clamp(ring.top + ring.height / 2 - card.height / 2, EDGE, maxTop)

  const right = { kind: "float" as const, left: ring.left + ring.width + GAP, top: midY }
  const below = { kind: "float" as const, left: midX, top: ring.top + ring.height + GAP }
  const above = { kind: "float" as const, left: midX, top: ring.top - GAP - card.height }
  const left = { kind: "float" as const, left: ring.left - GAP - card.width, top: midY }
  const fits = (p: { left: number; top: number }) =>
    p.left >= EDGE && p.top >= EDGE && p.left + card.width <= view.width - EDGE && p.top + card.height <= view.height - EDGE

  const order = ring.width < view.width / 3 ? [right, below, above, left] : [below, above, right, left]
  return order.find(fits) ?? { kind: "dock" }
}

/**
 * How far to scroll the page so the element sits in the free band between
 * the sticky header and the docked card (or the screen edges), centred when
 * it fits there and top-aligned when it's taller. 0 when it's already in.
 */
export function scrollDelta(target: Rect, view: Size, band: { top: number; bottom: number }): number {
  const top = band.top
  const bottom = view.height - band.bottom
  if (target.top >= top && target.top + target.height <= bottom) return 0
  const room = bottom - top
  const want = target.height > room ? top : top + (room - target.height) / 2
  return Math.round(target.top - want)
}
