import { describe, expect, it } from "vitest"
import { barFill, closeAt, figuresAt, nightsBetween, stepBar, stopOutPrice, type Bar, type OpenTrade } from "@/lib/demo/fills"
import { quoteOrder } from "@/lib/demo/orders"

const trade = (over: Partial<OpenTrade> = {}): OpenTrade => ({
  id: "t1",
  pair: "EURUSD",
  side: "buy",
  lot: 0.01,
  entry: 1.17,
  sl: 1.167,
  tp: 1.1745,
  costs: 0.1,
  margin: 11.7,
  swap: 0,
  ...over,
})

const bar = (o: number, h: number, l: number, c: number, t = 1_000_000): Bar => ({ t, o, h, l, c })

describe("barFill: SL and TP against the candle", () => {
  const cases: [string, Partial<OpenTrade>, Bar, { price: number; reason: "sl" | "tp" } | null][] = [
    ["buy, untouched", {}, bar(1.17, 1.172, 1.168, 1.171), null],
    ["buy, SL touched by the low", {}, bar(1.17, 1.171, 1.1665, 1.168), { price: 1.167, reason: "sl" }],
    ["buy, TP touched by the high", {}, bar(1.17, 1.175, 1.169, 1.174), { price: 1.1745, reason: "tp" }],
    ["buy, both touched: SL first", {}, bar(1.17, 1.176, 1.166, 1.171), { price: 1.167, reason: "sl" }],
    ["buy, gap below SL fills at the open", {}, bar(1.165, 1.169, 1.164, 1.168), { price: 1.165, reason: "sl" }],
    ["buy, gap above TP fills at the open", {}, bar(1.176, 1.177, 1.175, 1.176), { price: 1.176, reason: "tp" }],
    ["buy, no SL or TP", { sl: null, tp: null }, bar(1.17, 1.19, 1.15, 1.18), null],
    ["sell, SL touched by the high", { side: "sell", sl: 1.173, tp: 1.1655 }, bar(1.17, 1.1735, 1.169, 1.172), { price: 1.173, reason: "sl" }],
    ["sell, TP touched by the low", { side: "sell", sl: 1.173, tp: 1.1655 }, bar(1.17, 1.171, 1.165, 1.166), { price: 1.1655, reason: "tp" }],
    ["sell, both touched: SL first", { side: "sell", sl: 1.173, tp: 1.1655 }, bar(1.17, 1.174, 1.165, 1.17), { price: 1.173, reason: "sl" }],
    ["sell, gap above SL fills at the open", { side: "sell", sl: 1.173, tp: 1.1655 }, bar(1.175, 1.176, 1.174, 1.175), { price: 1.175, reason: "sl" }],
    ["sell, gap below TP fills at the open", { side: "sell", sl: 1.173, tp: 1.1655 }, bar(1.164, 1.165, 1.163, 1.164), { price: 1.164, reason: "tp" }],
  ]
  it.each(cases)("%s", (_name, over, b, expected) => {
    expect(barFill(trade(over), b)).toEqual(expected)
  })
})

describe("nightsBetween", () => {
  const day = 86_400
  it.each([
    [0, 4 * 3600, 0],
    [20 * 3600, day, 1],
    [20 * 3600, 3 * day, 3],
    [day, day + 3600, 0],
  ])("%i → %i = %i nights", (a, b, n) => expect(nightsBetween(a, b)).toBe(n))
})

describe("stepBar", () => {
  it("a BUY whose SL is hit loses exactly what the order panel predicted", () => {
    const quote = quoteOrder({ pair: "EURUSD", side: "buy", lot: 0.01, entry: 1.17, slPips: 30, tpPips: 45, balance: 200, freeMargin: 200 })
    const t = trade({ sl: quote.sl, tp: quote.tp, costs: quote.costs.total, margin: quote.margin })
    const r = stepBar({ balance: 200, trades: [t], prev: bar(1.17, 1.17, 1.17, 1.17), bar: bar(1.169, 1.1695, 1.1665, 1.168), last: false })
    expect(r.closures).toHaveLength(1)
    expect(r.closures[0].reason).toBe("sl")
    expect(r.closures[0].net).toBe(-quote.loss!)
    expect(r.balance).toBe(200 - quote.loss!)
  })

  it("charges swap for each midnight crossed while open", () => {
    const day = 86_400
    const r = stepBar({
      balance: 200,
      trades: [trade()],
      prev: bar(1.17, 1.17, 1.17, 1.17, day - 4 * 3600),
      bar: bar(1.17, 1.171, 1.169, 1.17, day),
      last: false,
    })
    expect(r.open[0].swap).toBe(-0.05)
    expect(r.closures).toHaveLength(0)
  })

  it("closes everything at the last close when the segment ends", () => {
    const r = stepBar({ balance: 200, trades: [trade()], prev: bar(1.17, 1.17, 1.17, 1.17), bar: bar(1.17, 1.172, 1.168, 1.1712), last: true })
    expect(r.closures.map((c) => [c.reason, c.price])).toEqual([["segment_end", 1.1712]])
    expect(r.open).toHaveLength(0)
  })

  // 0.15 lot on $200: margin $175.50, $1.50 a pip. The level starts at 113%
  // and reaches 50% about 74 pips down, near 1.16262.
  const big = trade({ lot: 0.15, sl: null, tp: null, costs: 1.5, margin: 175.5 })
  const flat = bar(1.17, 1.17, 1.17, 1.17)

  it("stops out every trade where the margin level reaches the limit", () => {
    const b = bar(1.17, 1.1702, 1.16, 1.161)
    const price = stopOutPrice(200, [big], b)!
    expect(price).toBeCloseTo(1.16262, 5)
    expect(figuresAt(200, [big], price - 0.0001).marginLevel!).toBeLessThan(50)
    expect(figuresAt(200, [big], price + 0.0001).marginLevel!).toBeGreaterThan(50)
    const r = stepBar({ balance: 200, trades: [big], prev: flat, bar: b, last: false })
    expect(r.stopOut).toEqual({ price })
    expect(r.closures.map((c) => c.reason)).toEqual(["stop_out"])
    expect(r.open).toHaveLength(0)
  })

  it("stops out at the open when price gaps past the level", () => {
    const r = stepBar({ balance: 200, trades: [big], prev: flat, bar: bar(1.16, 1.161, 1.159, 1.16), last: false })
    expect(r.closures[0]).toMatchObject({ reason: "stop_out", price: 1.16 })
  })

  it("never books the balance below zero", () => {
    // A 250-pip gap: the loss is bigger than the whole balance.
    const r = stepBar({ balance: 200, trades: [big], prev: flat, bar: bar(1.145, 1.146, 1.144, 1.145), last: false })
    expect(r.closures[0].net).toBeLessThan(-200)
    expect(r.balance).toBe(0)
  })

  it("a stop out nearer the open than the SL closes the trade first", () => {
    const r = stepBar({ balance: 200, trades: [{ ...big, sl: 1.155 }], prev: flat, bar: bar(1.17, 1.1702, 1.154, 1.155), last: false })
    expect(r.closures[0].reason).toBe("stop_out")
    expect(r.closures[0].price).toBeGreaterThan(1.155)
  })

  it("an SL nearer the open than the stop-out level fills first, and nothing else happens", () => {
    const t = trade({ lot: 0.1, sl: 1.169, tp: null, costs: 1, margin: 117 })
    const r = stepBar({ balance: 200, trades: [t], prev: bar(1.17, 1.17, 1.17, 1.17), bar: bar(1.17, 1.1702, 1.16, 1.161), last: false })
    expect(r.stopOut).toBeNull()
    expect(r.closures.map((c) => [c.reason, c.price])).toEqual([["sl", 1.169]])
  })
})

describe("closeAt", () => {
  it("0.10 lot BUY 1.1700 → 1.1750 is $50.00 gross, less costs net", () => {
    const c = closeAt(trade({ lot: 0.1, costs: 1 }), 1.175, "manual")
    expect(c.gross).toBe(50)
    expect(c.net).toBe(49)
    expect(c.pips).toBe(50)
  })
})
