import { describe, expect, it } from "vitest"
import { closeRun, decisionProblem, finishRun, pnlUsd, startRun, stepRun } from "@/lib/assessment/sim"
import type { Bar, Decision } from "@/lib/assessment/types"

const PIP = 0.0001
const REF = 1.1
const ctx = { ref: REF, pipSize: PIP, reasonOptions: ["trend", "level", "rr", "news"] }
const bar = (o: number, h: number, l: number, c: number): Bar => ({ t: 0, o, h, l, c })
const buy: Decision = { action: "buy", entry: "market", lot: 0.1, sl: 1.098, tp: 1.104, reasons: ["trend"] }

describe("decisionProblem", () => {
  it.each<[string, Decision, string | null]>([
    ["a valid market buy", buy, null],
    ["a valid sell", { ...buy, action: "sell", sl: 1.102, tp: 1.096 }, null],
    ["no trade needs only reasons", { action: "no_trade", reasons: ["news"] }, null],
    ["no reasons", { ...buy, reasons: [] }, "reasons"],
    ["four reasons", { ...buy, reasons: ["trend", "level", "rr", "news"] }, "reasons"],
    ["a repeated reason", { ...buy, reasons: ["trend", "trend"] }, "reasons"],
    ["an unknown reason", { ...buy, reasons: ["feeling"] }, "reasons"],
    ["lot under the minimum", { ...buy, lot: 0.005 }, "lot"],
    ["lot off the step", { ...buy, lot: 0.015 }, "lot"],
    ["buy with the SL above entry", { ...buy, sl: 1.101 }, "levels"],
    ["buy with the TP below entry", { ...buy, tp: 1.099 }, "levels"],
    ["sell with buy levels", { ...buy, action: "sell" }, "levels"],
    ["missing TP", { ...buy, tp: undefined }, "levels"],
    ["pending at the current price", { ...buy, entry: "pending", price: REF }, "entry"],
    ["pending far away", { ...buy, entry: "pending", price: 2 }, "entry"],
    ["pending buy limit below", { ...buy, entry: "pending", price: 1.099, sl: 1.097, tp: 1.103 }, null],
    ["no order type", { ...buy, entry: undefined }, "entry"],
  ])("%s", (_, d, expected) => {
    expect(decisionProblem(d, ctx)).toBe(expected)
  })
})

describe("stepRun", () => {
  it("fills a market order at Start and closes at the SL before the TP in one candle", () => {
    const r = stepRun(startRun(buy, REF), bar(1.1, 1.105, 1.097, 1.1), REF, false)
    expect(r.f).toEqual({ i: -1, p: REF })
    expect(r.x).toEqual({ i: 0, p: 1.098, why: "sl" })
    expect(r.end).toBe(true)
  })

  it("takes a gap through the SL at the open", () => {
    const r = stepRun(startRun(buy, REF), bar(1.097, 1.0975, 1.096, 1.097), REF, false)
    expect(r.x).toEqual({ i: 0, p: 1.097, why: "sl" })
  })

  it("closes at the TP, or at the open when it gaps past it", () => {
    expect(stepRun(startRun(buy, REF), bar(1.1, 1.1045, 1.0995, 1.104), REF, false).x).toEqual({ i: 0, p: 1.104, why: "tp" })
    expect(stepRun(startRun(buy, REF), bar(1.105, 1.106, 1.1045, 1.105), REF, false).x).toEqual({ i: 0, p: 1.105, why: "tp" })
  })

  it("fills a pending order below Start when the low reaches it, at the open on a gap", () => {
    const d: Decision = { ...buy, entry: "pending", price: 1.099, sl: 1.097, tp: 1.103 }
    const r0 = stepRun(startRun(d, REF), bar(1.1, 1.1005, 1.0995, 1.1), REF, false)
    expect(r0.f).toBeNull()
    expect(stepRun(r0, bar(1.0995, 1.0996, 1.0985, 1.099), REF, false).f).toEqual({ i: 1, p: 1.099 })
    expect(stepRun(r0, bar(1.098, 1.0985, 1.0975, 1.098), REF, false).f).toEqual({ i: 1, p: 1.098 })
  })

  it("fills a sell stop below Start and a buy stop above it", () => {
    const sellStop: Decision = { ...buy, action: "sell", entry: "pending", price: 1.099, sl: 1.101, tp: 1.095 }
    expect(stepRun(startRun(sellStop, REF), bar(1.1, 1.1, 1.0985, 1.0988), REF, false).f).toEqual({ i: 0, p: 1.099 })
    const buyStop: Decision = { ...buy, entry: "pending", price: 1.101, sl: 1.099, tp: 1.105 }
    expect(stepRun(startRun(buyStop, REF), bar(1.1, 1.1012, 1.0998, 1.101), REF, false).f).toEqual({ i: 0, p: 1.101 })
  })

  it("closes an open position at the last candle's close", () => {
    const r = stepRun(startRun(buy, REF), bar(1.1, 1.101, 1.099, 1.1007), REF, true)
    expect(r.x).toEqual({ i: 0, p: 1.1007, why: "auto" })
  })

  it("leaves a pending order unfilled at the end", () => {
    const d: Decision = { ...buy, entry: "pending", price: 1.095, sl: 1.093, tp: 1.099 }
    const r = stepRun(startRun(d, REF), bar(1.1, 1.101, 1.099, 1.1), REF, true)
    expect(r).toMatchObject({ f: null, x: null, end: true })
  })

  it("runs a no-trade decision to the end without a position", () => {
    const bars = [bar(1.1, 1.2, 1.0, 1.1), bar(1.1, 1.2, 1.0, 1.1)]
    expect(finishRun(startRun({ action: "no_trade", reasons: ["news"] }, REF), bars, REF)).toMatchObject({ n: 2, f: null, x: null, end: true })
  })
})

describe("closeRun", () => {
  it("closes by hand at the last close with the reason", () => {
    const r = stepRun(startRun(buy, REF), bar(1.1, 1.101, 1.0995, 1.1008), REF, false)
    expect(closeRun(r, 1.1008, "target_area")?.x).toEqual({ i: 0, p: 1.1008, why: "manual", cr: "target_area" })
  })

  it("refuses without an open position", () => {
    expect(closeRun(startRun({ action: "no_trade", reasons: ["news"] }, REF), REF, "fear")).toBeNull()
  })
})

describe("pnlUsd", () => {
  it.each([
    ["buy", 1.1, 1.102, 0.1, 10, 20],
    ["sell", 1.1, 1.102, 0.1, 10, -20],
    ["buy", 150, 149.5, 0.5, 6.67, -166.75],
  ] as const)("%s %d → %d", (side, entry, exit, lot, pipValue, expected) => {
    expect(pnlUsd(side, entry, exit, lot, entry > 10 ? 0.01 : PIP, pipValue)).toBeCloseTo(expected, 2)
  })
})
