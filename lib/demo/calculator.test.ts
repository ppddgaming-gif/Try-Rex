import { describe, expect, it } from "vitest"
import { examplePrice, exampleExit, profitCalc } from "@/lib/demo/calculator"

describe("Kalkulator Profit", () => {
  it("the ticket's example: 0.10 lot EURUSD 1.1700 → 1.1750 = $50.00 gross, $117 margin", () => {
    const r = profitCalc({ pair: "EURUSD", side: "buy", lot: 0.1, entry: 1.17, exit: 1.175, balance: 200 })
    expect(r).toEqual({
      lot: 0.1,
      pips: 50,
      pipValue: 1,
      gross: 50,
      costs: { spreadPips: 1, spread: 1, commission: 0, total: 1 },
      net: 49,
      netPct: 24.5,
      margin: 117,
      approximate: false,
    })
  })

  it.each([
    // pair, side, lot, entry, exit, pips, gross, net, margin
    ["EURUSD SELL the same move loses", "EURUSD", "sell", 0.1, 1.17, 1.175, -50, -50, -51, 117],
    ["0.01 lot is a tenth", "EURUSD", "buy", 0.01, 1.17, 1.175, 50, 5, 4.9, 11.7],
    ["USDJPY: pips in hundredths, USD margin", "USDJPY", "buy", 0.1, 110, 110.5, 50, 45.25, 44.16, 100],
    ["GBPUSD", "GBPUSD", "buy", 0.05, 1.3, 1.296, -40, -20, -20.75, 65],
  ] as const)("%s", (_name, pair, side, lot, entry, exit, pips, gross, net, margin) => {
    const r = profitCalc({ pair, side, lot, entry, exit, balance: 200 })
    expect(r.pips).toBe(pips)
    expect(r.gross).toBe(gross)
    expect(r.net).toBe(net)
    expect(r.margin).toBe(margin)
  })

  it("cross pairs are labelled perkiraan", () => {
    expect(profitCalc({ pair: "EURJPY", side: "buy", lot: 0.1, entry: 110.5, exit: 111, balance: 200 }).approximate).toBe(true)
    expect(profitCalc({ pair: "USDCAD", side: "buy", lot: 0.1, entry: 1.3, exit: 1.31, balance: 200 }).approximate).toBe(false)
  })
})

describe("example prices: the design's EURUSD, the fixed rates for the rest", () => {
  it.each([
    ["EURUSD", 1.17],
    ["GBPUSD", 1.55],
    ["AUDUSD", 0.9],
    ["USDJPY", 85],
    ["USDCAD", 1.03093],
    ["EURJPY", 110.5],
    ["EURAUD", 1.44444],
    ["GBPCAD", 1.59794],
  ])("%s starts at %s", (pair, price) => {
    expect(examplePrice(pair)).toBe(price)
  })

  it("the example exit is 50 pips in the side's favour", () => {
    expect(exampleExit("EURUSD", "buy")).toBe(1.175)
    expect(exampleExit("EURUSD", "sell")).toBe(1.165)
    expect(exampleExit("USDJPY", "buy")).toBe(85.5)
  })
})
