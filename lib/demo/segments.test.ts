import { describe, expect, it } from "vitest"
import { pickSegment, segmentPool, segmentsOf, type Segment } from "@/lib/demo/segments"
import { gameDatasets } from "@/lib/game-data"

describe("segmentsOf", () => {
  it.each([
    // 30 shown + up to 35 forward; a window needs 10 to play.
    [65, [["x-1", 29, 64]]],
    [61, [["x-1", 29, 60]]],
    [40, [["x-1", 29, 39]]],
    [39, []],
    [150, [["x-1", 29, 64], ["x-1@65", 29, 64]]],
    [170, [["x-1", 29, 64], ["x-1@65", 29, 64], ["x-1@130", 29, 39]]],
  ] as [number, [string, number, number][]][])("%i candles", (length, expected) => {
    const segs = segmentsOf({ id: "x-1", pair: "EURUSD", length })
    expect(segs.map((s) => [s.id, s.startCursor, s.lastIndex])).toEqual(expected)
  })
})

describe("segmentPool on the real data", () => {
  const sources = gameDatasets.map((d) => ({ id: d.id, pair: d.pair, length: d.candles.length }))

  it("Stage 1 holds every pair the data has (all nine are open from the start)", () => {
    const pool = segmentPool(1, sources)
    expect(new Set(pool.map((s) => s.pair))).toEqual(new Set(sources.map((s) => s.pair)))
    expect(pool).toHaveLength(39)
  })

  it("Stage 2 adds the crosses", () => {
    const pool = segmentPool(2, sources)
    expect(pool.some((s) => s.pair === "EURJPY")).toBe(true)
    expect(pool).toHaveLength(39)
  })

  it("every segment can play at least 10 candles", () => {
    for (const s of segmentPool(3, sources)) expect(s.lastIndex - s.startCursor).toBeGreaterThanOrEqual(10)
  })
})

describe("pickSegment", () => {
  const pool: Segment[] = ["a", "b", "c"].map((id) => ({
    id,
    datasetId: id,
    pair: "EURUSD",
    offset: 0,
    length: 65,
    startCursor: 29,
    lastIndex: 64,
  }))
  const first = () => 0
  const lastOne = () => 0.999

  it.each([
    ["nothing seen: any", new Map(), first, undefined, "a"],
    ["unseen first", new Map([["a", 1], ["b", 1]]), first, undefined, "c"],
    ["unseen first, whatever the draw", new Map([["a", 1], ["b", 1]]), lastOne, undefined, "c"],
    ["all seen once: a fresh cycle", new Map([["a", 1], ["b", 1], ["c", 1]]), lastOne, undefined, "c"],
    ["least seen wins", new Map([["a", 2], ["b", 1], ["c", 2]]), first, undefined, "b"],
    ["never the current chart", new Map([["a", 0], ["b", 3], ["c", 3]]), first, "a", "b"],
  ] as [string, Map<string, number>, () => number, string | undefined, string][])("%s", (_name, seen, random, current, id) => {
    expect(pickSegment(pool, seen, random, current)?.id).toBe(id)
  })

  it("keeps the only segment when there is nothing else", () => {
    expect(pickSegment(pool.slice(0, 1), new Map(), first, "a")?.id).toBe("a")
  })
})
