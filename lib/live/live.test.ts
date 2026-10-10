import { describe, expect, it } from "vitest"
import { closedBefore, decodeChunk, provisionalNow, yearsFor, type LiveBar, type Manifest } from "@/lib/live/chunk"
import { TIMEFRAME_SECONDS } from "@/lib/live/config"
import { parseDrawing, parseDrawings, positionStats, shiftDrawing, type Drawing } from "@/lib/live/drawings"
import { dayTimeLabel, indexToTime, timeToIndex, toAbsolute, toRelative, weekPosition } from "@/lib/live/time"

// Monday 2020-03-02 00:00 UTC
const MON = Date.UTC(2020, 2, 2) / 1000
const H = 3600

/** Weekday candles of `step` seconds from Monday to Friday close, like the MT4 exports. */
function week(step: number, from = MON): number[] {
  const out: number[] = []
  for (let t = from; t < from + 5 * 86_400; t += step) out.push(t)
  return out
}

describe("time labels", () => {
  it("knows Monday from the absolute time", () => {
    expect(weekPosition(MON)).toBe(0)
    expect(weekPosition(MON + 86_400 + 14 * H)).toBe(86_400 + 14 * H)
  })

  it("prints weekday and time from relative seconds, never a date", () => {
    const now = MON + 2 * 86_400 + 10 * H // Wednesday 10:00
    const nowWeek = weekPosition(now)
    expect(dayTimeLabel(0, nowWeek, "id")).toBe("Rab 10:00")
    expect(dayTimeLabel(-20 * H, nowWeek, "en")).toBe("Tue 14:00")
    expect(dayTimeLabel(-3 * 86_400, nowWeek, "en")).toBe("Sun 10:00")
    for (const rel of [-1e7, -123_456, 0, 98_765]) {
      expect(dayTimeLabel(rel, nowWeek, "id")).toMatch(/^(Sen|Sel|Rab|Kam|Jum|Sab|Min) \d{2}:\d{2}$/)
    }
  })

  it("relative and absolute are each other's inverse", () => {
    expect(toAbsolute(toRelative(MON + 777, MON + 5000), MON + 5000)).toBe(MON + 777)
  })
})

describe("time ↔ candle index", () => {
  it("round-trips inside the data", () => {
    const times = week(TIMEFRAME_SECONDS.M15)
    for (const t of [MON + 15 * 60 * 7 + 300, MON + 3 * 86_400 + 13 * H]) {
      expect(indexToTime(times, 900, timeToIndex(times, 900, t))).toBeCloseTo(t, 6)
    }
  })

  it("extrapolates beyond both ends at one candle per step", () => {
    const times = week(H)
    expect(timeToIndex(times, H, times[0] - 2 * H)).toBe(-2)
    expect(timeToIndex(times, H, times[times.length - 1] + 3 * H)).toBe(times.length - 1 + 3)
    expect(indexToTime(times, H, times.length + 1)).toBe(times[times.length - 1] + 2 * H)
  })

  it("a point drawn on M15 sits at the same moment on H4", () => {
    const m15 = week(900)
    const h4 = week(4 * H)
    const t = MON + 86_400 + 14 * H + 15 * 60 // Tuesday 14:15
    // Same time back out of either chart, so the drawing doesn't move.
    expect(indexToTime(m15, 900, timeToIndex(m15, 900, t))).toBe(t)
    expect(indexToTime(h4, 4 * H, timeToIndex(h4, 4 * H, t))).toBe(t)
    // On H4 it falls 2h15m into the 12:00 candle.
    expect(timeToIndex(h4, 4 * H, t)).toBeCloseTo(6 + 3 + 2.25 / 4, 6)
  })

  it("a time in the weekend gap clamps to the edge of Friday's last candle", () => {
    const times = [...week(H), ...week(H, MON + 7 * 86_400)]
    const fri = 5 * 24 - 1
    expect(timeToIndex(times, H, MON + 5 * 86_400 + 10 * H)).toBe(fri + 1)
  })
})

describe("chunks and slices", () => {
  it("decodes delta times and scaled prices", () => {
    const bars = decodeChunk({ pair: "EURUSD", tf: "H1", digits: 5, t: [MON, H, H], o: [110000, 110010, 110020], h: [110050, 110060, 110070], l: [109950, 109960, 109970], c: [110010, 110020, 110030] })
    expect(bars.map((b) => b.t)).toEqual([MON, MON + H, MON + 2 * H])
    expect(bars[1]).toEqual({ t: MON + H, o: 1.1001, h: 1.1006, l: 1.0996, c: 1.1002 })
  })

  it("sends only candles that closed by now: no future", () => {
    const bars: LiveBar[] = week(H).map((t) => ({ t, o: 1, h: 1, l: 1, c: 1 }))
    const now = MON + 10 * H + 30 * 60
    const slice = closedBefore(bars, now, H, 5)
    expect(slice.map((b) => (b.t - MON) / H)).toEqual([5, 6, 7, 8, 9])
    expect(slice.every((b) => b.t + H <= now)).toBe(true)
  })

  it("asks for the previous year when the slice can cross New Year", () => {
    const jan2 = Date.UTC(2021, 0, 2) / 1000
    expect(yearsFor(jan2, 4 * H, 120)).toEqual([2021, 2020])
    expect(yearsFor(Date.UTC(2021, 6, 1) / 1000, 900, 120)).toEqual([2021])
  })

  it("picks a provisional now inside every series, on a weekday, on the hour", () => {
    const tf = (first: number, last: number) => ({ seconds: H, first, last, bars: 0, years: [] })
    const m: Manifest = {
      version: 1,
      pairs: {
        EURUSD: { digits: 5, timeframes: { H1: tf(MON, MON + 400 * 86_400) } },
        GBPUSD: { digits: 5, timeframes: { H4: tf(MON + 10 * 86_400, MON + 380 * 86_400) } },
      },
    }
    for (const seed of [0, 0.25, 0.5, 0.999]) {
      const now = provisionalNow(m, seed, 30 * 86_400)
      expect(now).toBeGreaterThanOrEqual(MON + 40 * 86_400 - 2 * 86_400)
      expect(now).toBeLessThanOrEqual(MON + 380 * 86_400)
      expect(now % H).toBe(0)
      expect(weekPosition(now)).toBeLessThanOrEqual(4 * 86_400 + 20 * H)
    }
  })
})

describe("drawings", () => {
  const a = { t: -7200, p: 1.1 }
  const b = { t: 0, p: 1.12 }

  it("keeps well-formed drawings and drops the rest", () => {
    expect(parseDrawing({ id: "d1", kind: "trendline", a, b })).toEqual({ id: "d1", kind: "trendline", a, b })
    expect(parseDrawing({ id: "d2", kind: "hline", p: 1.1 })).toEqual({ id: "d2", kind: "hline", p: 1.1 })
    expect(parseDrawing({ id: "BAD ID", kind: "hline", p: 1.1 })).toBeNull()
    expect(parseDrawing({ id: "d3", kind: "path", points: [a] })).toBeNull()
    expect(parseDrawing({ id: "d4", kind: "circle", a, b })).toBeNull()
    expect(parseDrawing({ id: "d5", kind: "rectangle", a, b: { t: 0, p: -1 } })).toBeNull()
  })

  it("a position needs SL and TP on the right sides of entry", () => {
    expect(parseDrawing({ id: "p1", kind: "position", side: "buy", a, b, sl: 1.09, tp: 1.13 })).not.toBeNull()
    expect(parseDrawing({ id: "p2", kind: "position", side: "buy", a, b, sl: 1.11, tp: 1.13 })).toBeNull()
    expect(parseDrawing({ id: "p3", kind: "position", side: "sell", a, b, sl: 1.11, tp: 1.08 })).not.toBeNull()
  })

  it("caps the list and drops duplicate ids", () => {
    const many = Array.from({ length: 80 }, (_, i) => ({ id: `h${i % 70}`, kind: "hline", p: 1 + i / 100 }))
    const list = parseDrawings(many)
    expect(list).toHaveLength(60)
    expect(new Set(list.map((d) => d.id)).size).toBe(60)
  })

  it("moves every time between relative and absolute, prices untouched", () => {
    const d: Drawing = { id: "x", kind: "path", points: [a, b] }
    expect(shiftDrawing(shiftDrawing(d, MON), -MON)).toEqual(d)
    expect(shiftDrawing({ id: "h", kind: "hline", p: 1.2 }, MON)).toEqual({ id: "h", kind: "hline", p: 1.2 })
  })

  it("reports risk, reward and their ratio", () => {
    const s = positionStats({ id: "p", kind: "position", side: "buy", a: { t: 0, p: 1.1 }, b: { t: 3600, p: 1.1 }, sl: 1.098, tp: 1.106 })
    expect(s.rr).toBeCloseTo(3, 6)
  })
})

describe("chart geometry", () => {
  it("one scale maps prices and candles both ways", async () => {
    const { makeScale } = await import("@/lib/live/geometry")
    const s = makeScale(864, 400, 100, 1.1, 1.2)
    expect(s.yToPrice(s.priceToY(1.1534))).toBeCloseTo(1.1534, 10)
    expect(s.xToIndex(s.indexToX(37.25))).toBeCloseTo(37.25, 10)
    expect(s.priceToY(1.2)).toBe(8)
    expect(s.indexToX(0)).toBeCloseTo(s.slot / 2, 10)
  })

  it("hit-tests lines by distance and boxes by area, topmost first", async () => {
    const { hitTest, makeScale } = await import("@/lib/live/geometry")
    const s = makeScale(1064, 424, 100, 1.0, 2.0)
    const project = (pt: { t: number; p: number }) => ({ x: s.indexToX(pt.t), y: s.priceToY(pt.p) })
    const list: Drawing[] = [
      { id: "box", kind: "rectangle", a: { t: 10, p: 1.2 }, b: { t: 40, p: 1.8 } },
      { id: "line", kind: "trendline", a: { t: 0, p: 1.5 }, b: { t: 99, p: 1.5 } },
    ]
    const at = (t: number, p: number) => ({ x: s.indexToX(t), y: s.priceToY(p) })
    expect(hitTest(list, at(20, 1.5), project, s, 8)).toBe("line")
    expect(hitTest(list, at(20, 1.3), project, s, 8)).toBe("box")
    expect(hitTest(list, at(70, 1.1), project, s, 8)).toBeNull()
  })

  it("drags a whole position: entry, SL and TP move together", async () => {
    const { moveDrawing } = await import("@/lib/live/geometry")
    const d: Drawing = { id: "p", kind: "position", side: "buy", a: { t: 0, p: 1.1 }, b: { t: 3600, p: 1.1 }, sl: 1.09, tp: 1.13 }
    const moved = moveDrawing(d, 900, 0.01)
    expect(moved).toMatchObject({ a: { t: 900 }, b: { t: 4500 } })
    if (moved.kind !== "position") throw new Error()
    expect(moved.sl).toBeCloseTo(1.1, 10)
    expect(moved.tp).toBeCloseTo(1.14, 10)
    expect(positionStats(moved).rr).toBeCloseTo(positionStats(d).rr!, 10)
  })
})
