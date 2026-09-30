import { describe, expect, it } from "vitest"
import { leverageRows, stopOutPoint } from "@/lib/demo/lesson-math"

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
