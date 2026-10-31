import { describe, expect, it } from "vitest"
import {
  chartIndicators,
  ema,
  emaNext,
  emaStart,
  indicatorNext,
  indicatorPeek,
  indicatorStart,
  rsi,
  rsiOf,
} from "@/lib/live/indicators"

// The classic Wilder RSI worked example (StockCharts), first RSI at index 14.
const WILDER = [
  44.3389, 44.0902, 44.1497, 43.6124, 44.3278, 44.8264, 45.0955, 45.4245, 45.8433, 46.0826, 45.8931, 46.0328, 45.614,
  46.282, 46.282, 46.0028, 46.0328, 46.4116, 46.2222, 45.6439,
]
const WILDER_RSI = [70.53, 66.32, 66.55, 69.41, 66.36, 57.97]

// Real EURUSD and USDJPY-scale closes, to check that nothing depends on the price's scale.
const EURUSD = Array.from({ length: 120 }, (_, i) => 1.1 + 0.002 * Math.sin(i / 5) + 0.0004 * Math.cos(i * 1.7) + i * 0.00003)
const USDJPY = EURUSD.map((c) => c * 100)

/** EMA written the long way, as a reference. */
function emaReference(closes: number[], n: number) {
  const out: (number | null)[] = closes.map(() => null)
  if (closes.length < n) return out
  let prev = closes.slice(0, n).reduce((a, b) => a + b, 0) / n
  out[n - 1] = prev
  for (let i = n; i < closes.length; i++) {
    prev = (closes[i] - prev) * (2 / (n + 1)) + prev
    out[i] = prev
  }
  return out
}

describe("ema", () => {
  it.each([
    { name: "period 20", n: 20 },
    { name: "period 50", n: 50 },
    { name: "period 3", n: 3 },
  ])("seeds with the SMA and matches the reference ($name)", ({ n }) => {
    const got = ema(EURUSD, n)
    const want = emaReference(EURUSD, n)
    expect(got.slice(0, n - 1).every((v) => v === null)).toBe(true)
    expect(got[n - 1]).toBeCloseTo(EURUSD.slice(0, n).reduce((a, b) => a + b, 0) / n, 12)
    got.forEach((v, i) => (want[i] === null ? expect(v).toBeNull() : expect(v).toBeCloseTo(want[i]!, 12)))
  })

  it.each([
    { name: "fewer closes than the period", closes: [1, 2, 3], n: 5, want: [null, null, null] },
    { name: "a flat price", closes: [2, 2, 2, 2, 2], n: 3, want: [null, null, 2, 2, 2] },
    { name: "no closes", closes: [], n: 20, want: [] },
  ])("$name", ({ closes, n, want }) => {
    expect(ema(closes, n)).toEqual(want)
  })
})

describe("rsi", () => {
  it("matches Wilder's worked example", () => {
    const got = rsi(WILDER, 14)
    expect(got.slice(0, 14).every((v) => v === null)).toBe(true)
    WILDER_RSI.forEach((want, k) => expect(got[14 + k]).toBeCloseTo(want, 1))
  })

  it.each([
    { name: "only rises", closes: Array.from({ length: 20 }, (_, i) => 1 + i * 0.001), want: 100 },
    { name: "only falls", closes: Array.from({ length: 20 }, (_, i) => 1 - i * 0.001), want: 0 },
    { name: "flat (no losses)", closes: Array.from({ length: 20 }, () => 150.123), want: 100 },
  ])("$name", ({ closes, want }) => {
    const got = rsi(closes, 14)
    expect(got[13]).toBeNull()
    expect(got.slice(14).every((v) => v === want)).toBe(true)
  })

  it.each([
    { g: 0, l: 0, want: 100 },
    { g: 1, l: 0, want: 100 },
    { g: 0, l: 1, want: 0 },
    { g: 1, l: 1, want: 50 },
    { g: 3, l: 1, want: 75 },
  ])("rsiOf($g, $l) = $want", ({ g, l, want }) => {
    expect(rsiOf(g, l)).toBe(want)
  })
})

describe("scale", () => {
  it("a JPY-scale price gives EMA × 100 and the same RSI, with no special case", () => {
    const e = ema(EURUSD, 20)
    ema(USDJPY, 20).forEach((v, i) => (v === null ? expect(e[i]).toBeNull() : expect(v).toBeCloseTo(e[i]! * 100, 9)))
    const r = rsi(EURUSD, 14)
    rsi(USDJPY, 14).forEach((v, i) => (v === null ? expect(r[i]).toBeNull() : expect(v).toBeCloseTo(r[i]!, 8)))
  })
})

describe("no look-ahead", () => {
  it("a candle's values never change when later candles arrive", () => {
    const before = chartIndicators(EURUSD.slice(0, 80), null, 80)
    const after = chartIndicators(EURUSD, null, EURUSD.length)
    for (const id of ["ema20", "ema50", "rsi14"] as const) expect(after[id].slice(0, 80)).toEqual(before[id])
  })

  it("stepping one candle at a time equals the whole series", () => {
    let s = indicatorStart()
    const e20 = ema(EURUSD, 20)
    const r14 = rsi(EURUSD, 14)
    EURUSD.forEach((c, i) => {
      s = indicatorNext(s, c)
      expect(s.ema20.value).toBe(e20[i])
      expect(s.rsi14.value).toBe(r14[i])
    })
  })

  it("the forming candle reads the closed state and leaves it alone", () => {
    let s = indicatorStart()
    for (const c of EURUSD.slice(0, 60)) s = indicatorNext(s, c)
    const frozen = JSON.stringify(s)
    const peek = indicatorPeek(s, 1.2)
    expect(JSON.stringify(s)).toBe(frozen)
    // Same as if that price had closed the candle.
    const closed = chartIndicators([...EURUSD.slice(0, 60), 1.2], null, 61)
    expect(peek.ema20).toBe(closed.ema20[60])
    expect(peek.ema50).toBe(closed.ema50[60])
    expect(peek.rsi14).toBe(closed.rsi14[60])
    // A different running price changes only the forming value.
    expect(indicatorPeek(s, 1.0).ema20).not.toBe(peek.ema20)
  })

  it("emaNext returns a new state", () => {
    const s = emaStart(3)
    emaNext(s, 5)
    expect(s).toEqual(emaStart(3))
  })
})

describe("chartIndicators", () => {
  it.each([
    { name: "enough warm-up", closes: 120, shown: 40, forming: 1.15, warmup: 80, length: 41 },
    { name: "no forming candle", closes: 120, shown: 40, forming: null, warmup: 80, length: 40 },
    { name: "less data than shown", closes: 30, shown: 40, forming: null, warmup: 0, length: 30 },
  ])("$name", ({ closes, shown, forming, warmup, length }) => {
    const out = chartIndicators(EURUSD.slice(0, closes), forming, shown)
    expect(out.warmup).toBe(warmup)
    for (const id of ["ema20", "ema50", "rsi14"] as const) expect(out[id]).toHaveLength(length)
  })

  it("the shown values are computed with the warm-up, not from the first shown candle", () => {
    const out = chartIndicators(EURUSD, null, 40)
    expect(out.ema50[0]).toBe(ema(EURUSD, 50)[80])
    expect(out.ema50[0]).not.toBeNull()
  })
})
