import { describe, expect, it } from "vitest"
import {
  disiplinChecks,
  disiplinScore,
  isCounted,
  isRevenge,
  rollingDisiplin,
  slWidened,
  tradeXp,
  type DisiplinInput,
  type SlChange,
} from "@/lib/demo/disiplin"

describe("slWidened", () => {
  it.each([
    ["buy, never moved", "buy", [], false],
    ["buy, moved closer", "buy", [{ from: 1.167, to: 1.168 }], false],
    ["buy, to break-even", "buy", [{ from: 1.167, to: 1.17 }], false],
    ["buy, past entry into profit", "buy", [{ from: 1.167, to: 1.172 }], false],
    ["buy, moved further", "buy", [{ from: 1.167, to: 1.166 }], true],
    ["buy, closer then further again", "buy", [{ from: 1.167, to: 1.169 }, { from: 1.169, to: 1.168 }], true],
    ["buy, removed", "buy", [{ from: 1.167, to: null }], true],
    ["buy, added where there was none", "buy", [{ from: null, to: 1.167 }], false],
    ["sell, moved closer", "sell", [{ from: 1.173, to: 1.172 }], false],
    ["sell, moved further", "sell", [{ from: 1.173, to: 1.174 }], true],
  ] as [string, "buy" | "sell", SlChange[], boolean][])("%s", (_name, side, changes, widened) => {
    expect(slWidened(side, changes)).toBe(widened)
  })
})

describe("isRevenge: within 3 candles of a loss, with a bigger lot", () => {
  const loss = { lot: 0.02, closedClock: 40, result: -3.1 }
  it.each([
    ["bigger lot, same candle", 0.05, 40, [loss], true],
    ["bigger lot, 3 candles later", 0.05, 43, [loss], true],
    ["bigger lot, 4 candles later", 0.05, 44, [loss], false],
    ["same lot, 1 candle later", 0.02, 41, [loss], false],
    ["smaller lot, 1 candle later", 0.01, 41, [loss], false],
    ["bigger lot after a win", 0.05, 41, [{ ...loss, result: 4.5 }], false],
    ["bigger lot after a break-even", 0.05, 41, [{ ...loss, result: 0 }], false],
    ["no trades before", 0.05, 41, [], false],
  ] as const)("%s", (_name, lot, clock, closed, revenge) => {
    expect(isRevenge(lot, clock, [...closed])).toBe(revenge)
  })
})

describe("disiplinChecks", () => {
  const planned: DisiplinInput = { side: "buy", slAtEntry: 1.167, riskPct: 1.6, rewardRisk: 1.5, slChanges: [], revenge: false }

  it.each([
    ["a full plan passes everything", {}, 100, []],
    ["no SL at entry", { slAtEntry: null, riskPct: null, rewardRisk: null }, 40, ["slAtEntry", "riskWithinLimit", "rewardRisk"]],
    ["risk exactly at the limit", { riskPct: 2 }, 100, []],
    ["risk above the limit", { riskPct: 2.1 }, 80, ["riskWithinLimit"]],
    ["no TP", { rewardRisk: null }, 80, ["rewardRisk"]],
    ["reward below 1.5× risk", { rewardRisk: 1.4 }, 80, ["rewardRisk"]],
    ["SL widened later", { slChanges: [{ from: 1.167, to: 1.165 }] }, 80, ["slNotWidened"]],
    ["a revenge trade", { revenge: true }, 80, ["notRevenge"]],
  ] as [string, Partial<DisiplinInput>, number, string[]][])("%s", (_name, over, score, failed) => {
    const checks = disiplinChecks({ ...planned, ...over })
    expect(Object.entries(checks).filter(([, ok]) => !ok).map(([id]) => id)).toEqual(failed)
    expect(disiplinScore(checks)).toBe(score)
  })

  it("a profitable trade with risk above the limit still scores low and earns little XP", () => {
    // SL set, but 15% of the balance at risk and a 1:1 target. The outcome
    // isn't an input at all: a win can't raise the score.
    const checks = disiplinChecks({ ...planned, riskPct: 15.5, rewardRisk: 1 })
    const score = disiplinScore(checks)
    expect(score).toBe(60)
    expect(tradeXp(score, true)).toBe(12)
    expect(tradeXp(100, true)).toBe(20)
  })
})

describe("counting and XP", () => {
  it.each([
    [10, 10, false],
    [10, 11, true],
    [10, 25, true],
  ])("opened at %i, closed at %i → counted %s", (open, close, counted) => {
    expect(isCounted(open, close)).toBe(counted)
  })

  it.each([
    [100, true, 20],
    [80, true, 16],
    [40, true, 8],
    [0, true, 0],
    [100, false, 0],
  ])("score %i, counted %s → %i XP", (score, counted, xp) => {
    expect(tradeXp(score, counted)).toBe(xp)
  })
})

describe("rollingDisiplin", () => {
  it.each([
    [[], null],
    [[100], 100],
    [[100, 60], 80],
    [[80, 80, 60], 73],
    // Only the last 20 count: five early zeros are gone.
    [[0, 0, 0, 0, 0, ...Array(20).fill(100)], 100],
  ] as [number[], number | null][])("%j → %s", (scores, avg) => {
    expect(rollingDisiplin(scores)).toBe(avg)
  })
})
