import { describe, expect, it } from "vitest"
import { PAD, RSI_PAD, clampView, makeScale, panView, seriesPath, zoomView, type ChartView } from "@/lib/live/geometry"

// The chart's zoom and pan: one scale whose window moves, so candles,
// drawings and position lines can't drift apart.

const limits = { min: 20, max: 254, right: 14 }
const n = 240

describe("zoom and pan", () => {
  it("follows the latest candle by default, the last candle plus the empty slots ending the plot", () => {
    const v = clampView({ span: 134, offset: null }, n, limits)
    // A tenth of 134 slots stays empty on the right: 13.
    expect(v).toEqual({ span: 134, offset: n + 13 - 134, pinned: true })
    const s = makeScale(1000, 400, v.span, 1, 2, v.offset)
    expect(s.indexToX(n - 1 + 13) + s.slot / 2).toBeCloseTo(s.plotW, 6)
    expect(s.xToIndex(s.indexToX(123.4))).toBeCloseTo(123.4, 9)
  })

  it("keeps the candle under the cursor in place while zooming", () => {
    const view = { span: 134, offset: 50 }
    const before = makeScale(1000, 400, view.span, 1, 2, view.offset)
    const anchor = before.xToIndex(300)
    const c = clampView(zoomView(view, n, limits, 1 / 1.2, anchor), n, limits)
    const after = makeScale(1000, 400, c.span, 1, 2, c.offset)
    expect(after.indexToX(anchor)).toBeCloseTo(300, 6)
    expect(c.span).toBeLessThan(134)
  })

  it("never zooms past the limits or pans before the first candle", () => {
    let v: ChartView = { span: 134, offset: null }
    for (let i = 0; i < 30; i++) v = zoomView(v, n, limits, 1 / 1.2, 200)
    expect(clampView(v, n, limits).span).toBe(20)
    for (let i = 0; i < 30; i++) v = zoomView(v, n, limits, 1.2, 0)
    expect(clampView(v, n, limits).span).toBe(254)
    expect(clampView(panView({ span: 60, offset: 30 }, n, limits, 500), n, limits).offset).toBe(0)
  })

  it("panning back to the latest candle follows it again; zooming while following keeps following", () => {
    const back = panView({ span: 100, offset: null }, n, limits, 40)
    expect(back.offset).toBe(n + 10 - 100 - 40)
    expect(panView(back, n, limits, -1000).offset).toBeNull()
    expect(zoomView({ span: 100, offset: null }, n, limits, 1.2, 120).offset).toBeNull()
  })

  it("holds a place in history when a new candle arrives", () => {
    expect(clampView({ span: 80, offset: 100 }, n + 1, limits).offset).toBe(100)
  })

  it("can't show more slots than there are candles plus the empty ones", () => {
    expect(clampView({ span: 254, offset: null }, 50, limits)).toEqual({ span: 64, offset: 0, pinned: true })
  })

  it("keeps the empty space on the right in proportion to the zoom", () => {
    expect(clampView({ span: 20, offset: null }, n, limits).offset).toBe(n + 2 - 20)
    expect(clampView({ span: 254, offset: null }, n, limits).offset).toBe(n + 14 - 254)
  })
})

describe("indicator lines", () => {
  const chart = makeScale(800, 460, 50, 1.1, 1.2, 10)
  const rsi = makeScale(800, 120, 50, 0, 100, 10, RSI_PAD)

  it("the RSI panel puts every candle exactly under the chart's", () => {
    expect(RSI_PAD.right).toBe(PAD.right)
    for (const i of [10, 25.5, 59]) expect(rsi.indexToX(i)).toBe(chart.indexToX(i))
  })

  it("the RSI panel's 100 and 0 sit at its padding", () => {
    expect(rsi.priceToY(100)).toBe(RSI_PAD.top)
    expect(rsi.priceToY(0)).toBe(120 - RSI_PAD.bottom)
  })

  it.each([
    { name: "all values", values: [1.15, 1.16, 1.17], moves: 1, points: 3 },
    { name: "nulls before the first value are skipped", values: [null, null, 1.15, 1.16], moves: 1, points: 2 },
    { name: "a null in the middle breaks the line", values: [1.15, null, 1.16, 1.17], moves: 2, points: 3 },
    { name: "only nulls draw nothing", values: [null, null], moves: 0, points: 0 },
  ])("$name", ({ values, moves, points }) => {
    const s = makeScale(800, 460, 10, 1.1, 1.2, 0)
    const d = seriesPath(values, s, 0, values.length - 1)
    expect((d.match(/M/g) ?? []).length).toBe(moves)
    expect((d.match(/[ML]/g) ?? []).length).toBe(points)
  })

  it("draws with the chart's own priceToY and indexToX", () => {
    const s = makeScale(800, 460, 10, 1.1, 1.2, 0)
    expect(seriesPath([1.15], s, 0, 0)).toBe(`M${s.indexToX(0).toFixed(2)} ${s.priceToY(1.15).toFixed(2)}`)
  })

  it("only the window lo..hi is drawn", () => {
    const s = makeScale(800, 460, 10, 1.1, 1.2, 0)
    expect((seriesPath([1.11, 1.12, 1.13, 1.14, 1.15], s, 1, 3).match(/[ML]/g) ?? []).length).toBe(3)
  })
})
