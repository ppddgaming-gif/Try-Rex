import { describe, expect, it } from "vitest"
import { EDGE, GAP, RING_PAD, placeCard, ringRect, scrollDelta } from "@/lib/tour-geometry"

const view = { width: 1280, height: 800 }
const card = { width: 360, height: 200 }

describe("ringRect", () => {
  it("pads the element on every side", () => {
    expect(ringRect({ top: 100, left: 100, width: 50, height: 20 }, view)).toEqual({
      top: 100 - RING_PAD,
      left: 100 - RING_PAD,
      width: 50 + 2 * RING_PAD,
      height: 20 + 2 * RING_PAD,
    })
  })
  it("stays on screen for an element at the edge", () => {
    const r = ringRect({ top: 0, left: 0, width: 1280, height: 900 }, view)
    expect(r.top).toBeGreaterThanOrEqual(0)
    expect(r.left).toBeGreaterThanOrEqual(0)
    expect(r.top + r.height).toBeLessThanOrEqual(view.height)
    expect(r.left + r.width).toBeLessThanOrEqual(view.width)
  })
})

describe("placeCard", () => {
  it("docks on a phone", () => {
    expect(placeCard({ top: 10, left: 10, width: 40, height: 40 }, card, { width: 390, height: 800 }, true)).toEqual({
      kind: "dock",
    })
  })

  it("centres a step without a target", () => {
    expect(placeCard(null, card, view, false)).toEqual({ kind: "center" })
  })

  it("goes beside a narrow element such as a sidebar link", () => {
    const link = { top: 200, left: 14, width: 228, height: 44 }
    const p = placeCard(link, card, view, false)
    expect(p).toEqual({ kind: "float", left: link.left + link.width + GAP, top: 200 + 22 - 100 })
  })

  it("goes under a wide element with room below", () => {
    const chart = { top: 100, left: 300, width: 900, height: 300 }
    const p = placeCard(chart, card, view, false)
    expect(p.kind).toBe("float")
    if (p.kind === "float") expect(p.top).toBe(chart.top + chart.height + GAP)
  })

  it("goes over a wide element near the bottom", () => {
    const bar = { top: 560, left: 300, width: 900, height: 60 }
    const p = placeCard(bar, card, view, false)
    expect(p.kind).toBe("float")
    if (p.kind === "float") expect(p.top).toBe(bar.top - GAP - card.height)
  })

  it("never leaves the screen", () => {
    const corner = { top: 700, left: 1200, width: 60, height: 60 }
    const p = placeCard(corner, card, view, false)
    if (p.kind === "float") {
      expect(p.left).toBeGreaterThanOrEqual(EDGE)
      expect(p.top).toBeGreaterThanOrEqual(EDGE)
      expect(p.left + card.width).toBeLessThanOrEqual(view.width - EDGE)
      expect(p.top + card.height).toBeLessThanOrEqual(view.height - EDGE)
    }
  })

  it("docks when it fits nowhere", () => {
    const huge = { top: 20, left: 20, width: 1240, height: 760 }
    expect(placeCard(huge, card, view, false)).toEqual({ kind: "dock" })
  })
})

describe("scrollDelta", () => {
  // A phone: 72px under the sticky bar, a 220px card docked at the bottom.
  const phone = { width: 390, height: 800 }
  const band = { top: 72, bottom: 244 }

  it("doesn't scroll when the element is already clear of both", () => {
    expect(scrollDelta({ top: 100, left: 0, width: 300, height: 100 }, phone, band)).toBe(0)
  })

  it("lifts an element hidden behind the docked card into the middle of the free band", () => {
    const d = scrollDelta({ top: 650, left: 0, width: 300, height: 100 }, phone, band)
    const room = phone.height - band.bottom - band.top
    expect(650 - d).toBe(band.top + (room - 100) / 2)
  })

  it("pulls an element up from under the sticky bar", () => {
    expect(scrollDelta({ top: 20, left: 0, width: 300, height: 40 }, phone, band)).toBeLessThan(0)
  })

  it("top-aligns an element taller than the free band", () => {
    const d = scrollDelta({ top: 400, left: 0, width: 300, height: 600 }, phone, band)
    expect(400 - d).toBe(band.top)
  })
})
