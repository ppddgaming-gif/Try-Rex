import { describe, expect, it } from "vitest"
import { leverageRows, lossAtSl, maxLotWithin, riskBudget, riskRows, stopOutPoint } from "@/lib/demo/lesson-math"

describe("the required lesson's leverage table (EURUSD at 1.1700, $200 start)", () => {
  it("matches the ticket: 0.10 lot = $1/pip, 0.01 lot = $0.10/pip", () => {
    const rows = leverageRows([0.01, 0.1])
    expect(rows[0]).toEqual({ lot: 0.01, pipValue: 0.1, margin: 11.7, loss: 3, lossPct: 1.5 })
    expect(rows[1]).toEqual({ lot: 0.1, pipValue: 1, margin: 117, loss: 30, lossPct: 15 })
  })
  it("0.05 lot sits between", () => {
    expect(leverageRows([0.05])[0]).toEqual({ lot: 0.05, pipValue: 0.5, margin: 58.5, loss: 15, lossPct: 7.5 })
  })
})

describe("stop out on the starting balance", () => {
  it.each([
    // lot, equity at stop out, loss, pips against
    [0.1, 58.5, 141.5, 141.5],
    [0.01, 5.85, 194.15, 1941.5],
  ])("%s lot: stop out at $%s equity, after $%s (%s pips)", (lot, equity, loss, pips) => {
    const p = stopOutPoint(lot)
    expect(p.equity).toBe(equity)
    expect(p.loss).toBe(loss)
    expect(p.pips).toBe(pips)
  })
})

describe("the risk lesson: the biggest lot inside 2% of $200, spread included", () => {
  it("the budget is $4.00", () => {
    expect(riskBudget()).toBe(4)
  })

  it.each([
    // SL pips, max lot, loss at SL with it, % of $200
    // 10 pips + 1 pip spread = $1.10 per 0.01 lot: 0.03 costs $3.30, 0.04 would cost $4.40 (2.2%).
    [10, 0.03, 3.3, 1.7],
    [20, 0.01, 2.1, 1.1],
    // 51 pips × $0.10 = $5.10: even 0.01 lot is over the limit.
    [50, null, 5.1, 2.6],
  ])("SL %s pip → %s lot", (sl, maxLot, loss, lossPct) => {
    const row = riskRows([sl])[0]
    expect(row.maxLot).toBe(maxLot)
    expect(row.loss).toBe(loss)
    expect(row.lossPct).toBe(lossPct)
  })

  it("the trap answer, ignoring the spread, fails the risk check", () => {
    expect(lossAtSl(0.04, 10)).toEqual({ loss: 4.4, lossPct: 2.2 })
    expect(maxLotWithin(10)).toBe(0.03)
  })

  it("a bigger balance allows a bigger lot", () => {
    expect(maxLotWithin(10, 1000)).toBe(0.18)
  })
})
