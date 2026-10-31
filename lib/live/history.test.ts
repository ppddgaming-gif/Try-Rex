import { describe, expect, it } from "vitest"
import { emptyPast, mergeChart, oldestTime, prependPast, rollPast, type ChartPart } from "@/lib/live/history"

// Older candles kept in the browser: they must line up with every later poll,
// keep the candles already on screen at the same index, and be dropped when
// the account's clock jumps.

const STEP = 900
const KEY = "EURUSD|M15"

/** A deterministic candle at real time T (seconds). */
const candleAt = (T: number, salt = 0) => {
  const o = 1 + ((T / STEP + salt) % 50) / 1000
  return { o, h: o + 0.002, l: o - 0.002, c: o + 0.001 }
}

/** A poll at real time `anchor`: `n` closed candles ending one step before `anchor`, plus the forming one. */
function poll(anchor: number, n: number, salt = 0): ChartPart {
  const start = anchor - n * STEP
  const candles = Array.from({ length: n }, (_, i) => ({ t: start + i * STEP - anchor, ...candleAt(start + i * STEP, salt) }))
  const series = (k: number) => Array.from({ length: n + 1 }, (_, i) => (start + i * STEP) / STEP + k)
  return { anchor, candles, forming: { t: 0, ...candleAt(anchor, salt) }, indicators: { ema20: series(0.2), ema50: series(0.5), rsi14: series(0.14) } }
}

/** A history batch: `n` candles ending right before real time `before`. */
function batch(anchor: number, before: number, n: number, done = false): ChartPart & { done: boolean } {
  const start = before - n * STEP
  const candles = Array.from({ length: n }, (_, i) => ({ t: start + i * STEP - anchor, ...candleAt(start + i * STEP) }))
  const series = (k: number) => Array.from({ length: n }, (_, i) => (start + i * STEP) / STEP + k)
  return { anchor, candles, indicators: { ema20: series(0.2), ema50: series(0.5), rsi14: series(0.14) }, done }
}

const realTimes = (part: ChartPart, past = emptyPast(KEY)) => mergeChart(past, part).candles.map((c) => c.t + part.anchor)

describe("kept candles across polls", () => {
  const t0 = 1_000_000 * STEP

  it("adds the candle a sliding window leaves behind, so every candle keeps its index", () => {
    const a = poll(t0, 240)
    const b = poll(t0 + STEP, 240)
    const past = rollPast(emptyPast(KEY), KEY, a, b)
    expect(past.bars).toHaveLength(1)
    const before = realTimes(a)
    const after = realTimes(b, past)
    // One more candle at the right; everything before it where it was.
    expect(after).toHaveLength(before.length + 1)
    expect(after.slice(0, before.length - 1)).toEqual(before.slice(0, -1))
    expect(past.lead).toBe(0)
  })

  it("ignores a poll inside the same candle (nothing left behind)", () => {
    const a = poll(t0, 240)
    const b = { ...poll(t0, 240), anchor: t0 + 10, candles: poll(t0, 240).candles.map((c) => ({ ...c, t: c.t - 10 })) }
    expect(rollPast(emptyPast(KEY), KEY, a, b)).toEqual(emptyPast(KEY))
  })

  it.each([
    ["the clock jumped: the same real times hold other candles", poll(1_000_000 * STEP + STEP, 240, 7)],
    ["the tab slept past the whole window: no overlap", poll(1_000_000 * STEP + 500 * STEP, 240)],
  ])("drops everything when %s", (_, next) => {
    const a = poll(t0, 240)
    const kept = rollPast(emptyPast(KEY), KEY, a, poll(t0 + STEP, 240))
    expect(kept.bars.length).toBeGreaterThan(0)
    const reset = rollPast(kept, KEY, poll(t0 + STEP, 240), next)
    expect(reset.bars).toEqual([])
    expect(reset.gen).toBe(kept.gen + 1)
  })

  it("starts over for another pair or timeframe", () => {
    const kept = rollPast(emptyPast(KEY), KEY, poll(t0, 240), poll(t0 + STEP, 240))
    expect(rollPast(kept, "EURUSD|H1", poll(t0, 240), poll(t0 + STEP, 240))).toEqual(emptyPast("EURUSD|H1"))
  })
})

describe("history batches", () => {
  const t0 = 2_000_000 * STEP
  const now = poll(t0, 240)
  const before = oldestTime(emptyPast(KEY), now)

  it("puts older candles in front, counts them as lead, and lines up their indicators", () => {
    const past = prependPast(emptyPast(KEY), KEY, now, before, batch(t0 + 30, before, 240))
    expect(past.lead).toBe(240)
    expect(past.done).toBe(false)
    const merged = mergeChart(past, now)
    expect(merged.candles).toHaveLength(240 + 240 + 1)
    for (const id of ["ema20", "ema50", "rsi14"] as const) expect(merged.indicators[id]).toHaveLength(merged.candles.length)
    // Contiguous: every candle one step after the one before it.
    const times = merged.candles.map((c) => c.t)
    expect(times.every((t, i) => i === 0 || t - times[i - 1] === STEP)).toBe(true)
    // A second batch ends where the first began.
    const next = prependPast(past, KEY, now, oldestTime(past, now), batch(t0, oldestTime(past, now), 100, true))
    expect(next.lead).toBe(340)
    expect(next.done).toBe(true)
  })

  it.each([
    ["for another chart", "GBPUSD|M15", before],
    ["that no longer ends at the oldest candle", KEY, before - STEP],
  ])("ignores a batch %s", (_, key, end) => {
    const past = emptyPast(KEY)
    expect(prependPast(past, key, now, end, batch(t0, end, 50))).toBe(past)
  })

  it("is done when nothing older comes back", () => {
    expect(prependPast(emptyPast(KEY), KEY, now, before, batch(t0, before, 0)).done).toBe(true)
  })

  it("keeps history through later polls", () => {
    const past = prependPast(emptyPast(KEY), KEY, now, before, batch(t0, before, 120))
    const rolled = rollPast(past, KEY, now, poll(t0 + 2 * STEP, 240))
    expect(rolled.bars).toHaveLength(122)
    expect(rolled.lead).toBe(120)
    const times = realTimes(poll(t0 + 2 * STEP, 240), rolled)
    expect(times.every((t, i) => i === 0 || t - times[i - 1] === STEP)).toBe(true)
  })
})
