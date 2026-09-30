import { describe, expect, it } from "vitest"
import { isValidDistance, levelPips, levelPrice, orderProblems, quoteOrder, type OrderInput } from "@/lib/demo/orders"

describe("levelPrice / levelPips", () => {
  it.each([
    ["EURUSD", "buy", 1.17, "sl", 30, 1.167],
    ["EURUSD", "buy", 1.17, "tp", 45, 1.1745],
    ["EURUSD", "sell", 1.17, "sl", 30, 1.173],
    ["EURUSD", "sell", 1.17, "tp", 45, 1.1655],
    ["USDJPY", "buy", 85.2, "sl", 25, 84.95],
    ["USDJPY", "sell", 85.2, "tp", 40.5, 84.795],
    // Negative SL distance: past entry, locking in profit.
    ["EURUSD", "buy", 1.17, "sl", -5, 1.1705],
  ] as const)("%s %s %s %s %s pips = %s", (pair, side, entry, kind, pips, price) => {
    expect(levelPrice(pair, side, entry, kind, pips)).toBe(price)
    expect(levelPips(pair, side, entry, kind, price)).toBe(pips)
  })
})

describe("isValidDistance", () => {
  it.each([
    [30, true],
    [0.1, true],
    [12.5, true],
    [0, false],
    [-3, false],
    [12.55, false],
    [1001, false],
    [Number.NaN, false],
  ])("%s pips → %s", (pips, ok) => expect(isValidDistance(pips)).toBe(ok))
})

describe("quoteOrder: the order panel's calculator", () => {
  it("the image's example: 0.10 lot 1.1700 → 1.1750 is $50.00 gross, about $117 margin", () => {
    const q = quoteOrder({ pair: "EURUSD", side: "buy", lot: 0.1, entry: 1.17, slPips: 25, tpPips: 50, balance: 200, freeMargin: 200 })
    expect(q.pipValue).toBe(1)
    expect(q.margin).toBe(117)
    expect(q.freeMarginAfter).toBe(83)
    expect(q.tp).toBe(1.175)
    expect(q.costs).toEqual({ spreadPips: 1, spread: 1, commission: 0, total: 1 })
    // $50.00 gross less the $1.00 spread.
    expect(q.gain).toBe(49)
    expect(q.gainPct).toBe(24.5)
    // 25 pips × $1 plus the spread.
    expect(q.loss).toBe(26)
    expect(q.lossPct).toBe(13)
    expect(q.rewardRisk).toBe(2)
    expect(q.risk).toBe("danger")
  })

  it.each([
    // lot, SL pips, expected loss, %, risk level
    [0.01, 30, 3.1, 1.6, "ok"],
    [0.01, 39, 4.0, 2, "ok"],
    [0.02, 30, 6.2, 3.1, "above"],
    [0.1, 30, 31, 15.5, "danger"],
  ] as const)("%s lot, SL %s pips: loses $%s (%s%%) → %s", (lot, sl, loss, pct, risk) => {
    const q = quoteOrder({ pair: "EURUSD", side: "buy", lot, entry: 1.17, slPips: sl, tpPips: null, balance: 200, freeMargin: 200 })
    expect(q.loss).toBe(loss)
    expect(q.lossPct).toBe(pct)
    expect(q.risk).toBe(risk)
  })

  it("without SL the risk has no limit", () => {
    const q = quoteOrder({ pair: "EURUSD", side: "sell", lot: 0.01, entry: 1.17, slPips: null, tpPips: 30, balance: 200, freeMargin: 200 })
    expect(q.loss).toBeNull()
    expect(q.risk).toBe("none")
    expect(q.rewardRisk).toBeNull()
  })

  it("marks crosses as approximate", () => {
    const q = quoteOrder({ pair: "EURJPY", side: "buy", lot: 0.01, entry: 110.5, slPips: 30, tpPips: 45, balance: 200, freeMargin: 200 })
    expect(q.approximate).toBe(true)
  })

  it("can't cover a lot bigger than the free margin", () => {
    const q = quoteOrder({ pair: "EURUSD", side: "buy", lot: 0.2, entry: 1.17, slPips: 30, tpPips: 45, balance: 200, freeMargin: 200 })
    expect(q.margin).toBe(234)
    expect(q.covered).toBe(false)
  })
})

describe("orderProblems", () => {
  const good: OrderInput = { side: "buy", lot: 0.01, slPips: 30, tpPips: 45, reasons: ["trend-naik"] }
  const ctx = { pair: "EURUSD", stage: 1 as const, openTrades: 0, candlesLeft: 20 }
  const problems = (input: Partial<OrderInput>, over: Partial<typeof ctx> = {}) => {
    const i = { ...good, ...input }
    const c = { ...ctx, ...over }
    const q = quoteOrder({ pair: c.pair, side: i.side, lot: i.lot, entry: 1.17, slPips: i.slPips, tpPips: i.tpPips, balance: 200, freeMargin: 200 })
    return orderProblems(i, c, q).map((p) => p.field)
  }

  it.each([
    ["a complete Stage 1 plan", {}, {}, []],
    ["no reason", { reasons: [] }, {}, ["reasons"]],
    ["four reasons", { reasons: ["trend-naik", "breakout", "ikut-feeling", "menunggu-konfirmasi"] }, {}, ["reasons"]],
    ["an unknown reason", { reasons: ["tebakan"] }, {}, ["reasons"]],
    ["the same reason twice", { reasons: ["breakout", "breakout"] }, {}, ["reasons"]],
    ["Stage 1 without SL", { slPips: null }, {}, ["sl"]],
    ["Stage 1 without TP", { tpPips: null }, {}, ["tp"]],
    ["Stage 1 with nothing planned", { slPips: null, tpPips: null, reasons: [] }, {}, ["reasons", "sl", "tp"]],
    ["Stage 1 with a bigger lot", { lot: 0.05 }, {}, ["lot"]],
    ["Stage 2 without SL or TP", { slPips: null, tpPips: null }, { stage: 2 }, []],
    ["Stage 2 choosing a lot", { lot: 0.05 }, { stage: 2 }, []],
    ["Stage 2, a lot the margin can't cover", { lot: 0.2 }, { stage: 2 }, ["margin"]],
    ["Stage 2, an invalid lot", { lot: 0.015 }, { stage: 2 }, ["lot"]],
    ["a second open trade in Stage 1", {}, { openTrades: 1 }, ["trades"]],
    ["a third open trade in Stage 3", {}, { stage: 3, openTrades: 2 }, []],
    ["a fourth open trade in Stage 3", {}, { stage: 3, openTrades: 3 }, ["trades"]],
    ["a cross in Stage 1", {}, { pair: "EURJPY" }, ["pair"]],
    ["no candles left", {}, { candlesLeft: 0 }, ["candles"]],
    ["a zero SL", { slPips: 0 }, { stage: 2 }, ["sl"]],
  ] as const)("%s", (_name, input, over, fields) => {
    expect(problems(input as Partial<OrderInput>, over as Partial<typeof ctx>)).toEqual(fields)
  })
})
