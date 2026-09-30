import { describe, expect, it } from "vitest"
import { ACCOUNT } from "@/lib/demo/config"
import {
  accountFigures,
  bustLevel,
  grossPnl,
  isBust,
  isValidLot,
  marginFor,
  normalizeLot,
  openingCosts,
  pctOf,
  pipValue,
  pipsBetween,
  roundMoney,
} from "@/lib/demo/money"

describe("the calculator example from the design", () => {
  it("0.10 lot EURUSD BUY 1.1700 → 1.1750 is $50.00 gross", () => {
    expect(grossPnl("EURUSD", "buy", 0.1, 1.17, 1.175)).toBe(50)
  })
  it("needs about $117 margin at 1:100", () => {
    expect(ACCOUNT.LEVERAGE).toBe(100)
    expect(marginFor("EURUSD", 0.1, 1.17)).toBe(117)
  })
})

describe("pipValue", () => {
  it.each([
    // pair, lot, price, expected USD per pip
    ["EURUSD", 0.1, 1.17, 1],
    ["EURUSD", 0.01, 1.17, 0.1],
    ["EURUSD", 1, 1.05, 10],
    ["GBPUSD", 0.01, 1.55, 0.1],
    // USD is the base: 0.01 lot = 1,000 units, 10 JPY per pip, converted at the price.
    ["USDJPY", 0.01, 80, 0.125],
    ["USDCAD", 0.1, 1.25, 0.8],
  ])("%s %s lot at %s = $%s per pip", (pair, lot, price, expected) => {
    expect(pipValue(pair, lot, price)).toBeCloseTo(expected, 10)
  })

  it("crosses use the fixed estimate (EURJPY: 10 JPY per pip at 0.01 lot)", () => {
    expect(pipValue("EURJPY", 0.01, 110)).toBeCloseTo(10 / 85, 10)
  })
})

describe("marginFor", () => {
  it.each([
    ["EURUSD", 0.01, 1.17, 11.7],
    ["EURUSD", 0.1, 1.03, 103],
    // USD base: the position is already in USD.
    ["USDJPY", 0.01, 85, 10],
    ["USDCAD", 0.1, 1.02, 100],
    // Cross: base converted at the estimate (EUR = 1.30).
    ["EURAUD", 0.01, 1.45, 13],
  ])("%s %s lot at %s needs $%s", (pair, lot, price, expected) => {
    expect(marginFor(pair, lot, price)).toBe(expected)
  })
})

describe("pipsBetween", () => {
  it.each([
    ["EURUSD", "buy", 1.17, 1.175, 50],
    ["EURUSD", "sell", 1.17, 1.175, -50],
    ["EURUSD", "sell", 1.1712, 1.1682, 30],
    ["USDJPY", "buy", 85.12, 84.82, -30],
    ["EURUSD", "buy", 1.10001, 1.10006, 0.5],
  ] as const)("%s %s %s → %s = %s pips", (pair, side, entry, exit, expected) => {
    expect(pipsBetween(pair, side, entry, exit)).toBe(expected)
  })
})

describe("grossPnl", () => {
  it.each([
    ["EURUSD", "buy", 0.01, 1.17, 1.167, -3],
    ["EURUSD", "sell", 0.01, 1.17, 1.167, 3],
    ["EURUSD", "buy", 0.1, 1.17, 1.167, -30],
    // 30 pips on USDJPY at 0.1 lot, settled at 84.82: 30 × 1,000 JPY/100 … = $35.37
    ["USDJPY", "buy", 0.1, 85.12, 84.82, -35.37],
  ] as const)("%s %s %s lot %s → %s = $%s", (pair, side, lot, entry, exit, expected) => {
    expect(grossPnl(pair, side, lot, entry, exit)).toBe(expected)
  })
})

describe("openingCosts", () => {
  it("charges the pair's spread and no commission (standard account)", () => {
    const c = openingCosts("EURUSD", 0.1, 1.17)
    expect(c.spreadPips).toBe(1)
    expect(c.spread).toBe(1)
    expect(c.commission).toBe(0)
    expect(c.total).toBe(1)
  })
  it("scales with lot size (GBPUSD 1.5 pips × $0.10)", () => {
    expect(openingCosts("GBPUSD", 0.01, 1.55).total).toBe(0.15)
  })
})

describe("lots", () => {
  it.each([
    [0.01, true],
    [0.1, true],
    [0.15, true],
    [1, true],
    [0.005, false],
    [0.011, false],
    [0, false],
    [1.01, false],
    [Number.NaN, false],
  ])("%s valid: %s", (lot, ok) => {
    expect(isValidLot(lot)).toBe(ok)
  })
  it("normalizes float noise", () => {
    expect(normalizeLot(0.1 + 0.2)).toBe(0.3)
  })
})

describe("the 'akun habis' level", () => {
  it("is the margin for one 0.01 lot at the current price", () => {
    expect(bustLevel("EURUSD", 1.17)).toBe(11.7)
    expect(bustLevel("USDJPY", 85)).toBe(10)
  })
  it.each([
    [11.69, true],
    [11.7, false],
    [200, false],
  ])("equity $%s on EURUSD 1.1700 → habis: %s", (equity, bust) => {
    expect(isBust(equity, "EURUSD", 1.17)).toBe(bust)
  })
})

describe("accountFigures", () => {
  it("with no open trades, equity is the balance and margin level is null", () => {
    expect(accountFigures(200, [])).toEqual({
      balance: 200,
      equity: 200,
      openPnl: 0,
      marginUsed: 0,
      freeMargin: 200,
      marginLevel: null,
    })
  })
  it("adds open P/L and margin", () => {
    const f = accountFigures(200, [
      { pnl: -12.5, margin: 11.7 },
      { pnl: 3.2, margin: 10 },
    ])
    expect(f.equity).toBe(190.7)
    expect(f.marginUsed).toBe(21.7)
    expect(f.freeMargin).toBe(169)
    expect(f.marginLevel).toBe(878.8)
  })
})

describe("rounding", () => {
  it.each([
    [1.005, 1.01],
    [-1.005, -1.01],
    [0.1 + 0.2, 0.3],
    [2.675, 2.68],
  ])("roundMoney(%s) = %s", (v, expected) => {
    expect(roundMoney(v)).toBe(expected)
  })
  it("pctOf gives one decimal", () => {
    expect(pctOf(30, 200)).toBe(15)
    expect(pctOf(3, 200)).toBe(1.5)
    expect(pctOf(1, 0)).toBe(0)
  })
})
