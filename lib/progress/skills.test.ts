import { describe, expect, it } from "vitest"
import type { Decision, Trend } from "@/lib/mock-data"
import { disiplinSamples, evaluationSamples, gameSamples, skillMeters, SKILLS, type SkillSample } from "@/lib/progress/skills"

const at = (i: number) => new Date(Date.UTC(2026, 10, 1, 0, i)).toISOString()
const many = (n: number, value: number, source: SkillSample["source"] = "game", from = 0): SkillSample[] =>
  Array.from({ length: n }, (_, i) => ({ skill: "trend_reading", value, source, at: at(from + i) }))

describe("skillMeters", () => {
  it("stays null below the minimum, for every skill", () => {
    const m = skillMeters(many(SKILLS.MIN_SAMPLES - 1, 1))
    expect(m).toEqual({ trend_reading: null, entry_timing: null, risk_management: null, market_structure: null })
  })

  it.each([
    ["exactly the minimum", many(5, 1), 100, 5],
    ["a mean of whole and half answers", [...many(3, 1), ...many(3, 0.5, "game", 10)], 75, 6],
    ["only the newest WINDOW count", [...many(20, 0, "game", 0), ...many(20, 1, "asesmen", 100)], 100, 20],
    ["values outside 0..1 are clamped", [...many(4, 2), ...many(1, -1, "game", 10)], 80, 5],
  ] as [string, SkillSample[], number, number][])("%s", (_name, samples, value, count) => {
    const meter = skillMeters(samples).trend_reading
    expect(meter?.value).toBe(value)
    expect(meter?.count).toBe(count)
  })

  it("counts the sources of the samples it used", () => {
    const meter = skillMeters([...many(3, 1, "game"), ...many(2, 1, "asesmen", 10), ...many(1, 0, "demo", 20)]).trend_reading
    expect(meter?.sources).toEqual({ game: 3, asesmen: 2, demo: 1 })
  })

  it("keeps the skills apart", () => {
    const risk: SkillSample[] = many(5, 0.4).map((s) => ({ ...s, skill: "risk_management" }))
    const m = skillMeters([...many(5, 1), ...risk])
    expect(m.trend_reading?.value).toBe(100)
    expect(m.risk_management?.value).toBe(40)
    expect(m.entry_timing).toBeNull()
  })
})

describe("gameSamples: only what the 30 visible candles show", () => {
  it.each([
    ["up, BUY goes with the trend", "up", 50, "buy", [["trend_reading", 1]]],
    ["up, WAIT", "up", 50, "wait", [["trend_reading", 0.5]]],
    ["up, SELL goes against it", "up", 50, "sell", [["trend_reading", 0]]],
    ["down, SELL goes with the trend", "down", 50, "sell", [["trend_reading", 1]]],
    ["down, BUY goes against it", "down", 50, "buy", [["trend_reading", 0]]],
    ["flat, WAIT", "flat", 50, "wait", [["trend_reading", 1]]],
    ["flat, BUY", "flat", 50, "buy", [["trend_reading", 0.5]]],
    ["top of the range, BUY", "up", 85, "buy", [["trend_reading", 1], ["market_structure", 0]]],
    ["top of the range, SELL", "up", 80, "sell", [["trend_reading", 0], ["market_structure", 1]]],
    ["top of the range, WAIT", "flat", 95, "wait", [["trend_reading", 1], ["market_structure", 1]]],
    ["bottom of the range, SELL", "down", 10, "sell", [["trend_reading", 1], ["market_structure", 0]]],
    ["bottom of the range, BUY", "down", 20, "buy", [["trend_reading", 0], ["market_structure", 1]]],
    ["middle of the range: no structure sample", "down", 21, "buy", [["trend_reading", 0]]],
  ] as [string, Trend, number, Decision, [string, number][]][])("%s", (_name, trend, rangePos, decision, want) => {
    expect(gameSamples({ decision, trend, rangePos }).map((s) => [s.skill, s.value])).toEqual(want)
  })
})

describe("disiplinSamples", () => {
  const all = { slAtEntry: true, riskWithinLimit: true, rewardRisk: true, slNotWidened: true, notRevenge: true }
  it.each([
    ["every check passed", all, [["risk_management", 1], ["entry_timing", 1]]],
    ["no SL and too much risk", { ...all, slAtEntry: false, riskWithinLimit: false }, [["risk_management", 0.5], ["entry_timing", 1]]],
    ["a revenge trade", { ...all, notRevenge: false }, [["risk_management", 1], ["entry_timing", 0]]],
    ["only some checks stored", { slAtEntry: false, rewardRisk: true }, [["risk_management", 0.5]]],
    ["no checks", null, []],
  ] as [string, Record<string, boolean> | null, [string, number][]][])("%s", (_name, checks, want) => {
    expect(disiplinSamples(checks).map((s) => [s.skill, s.value])).toEqual(want)
  })
})

describe("evaluationSamples", () => {
  it.each([
    [{ risk: 90, sl: 60, rr: 30, entry: 70 }, 0.6, 0.7],
    [{ risk: 100, sl: 100, rr: 100, entry: 0 }, 1, 0],
  ])("%o", (scores, risk, entry) => {
    expect(evaluationSamples(scores).map((s) => s.value)).toEqual([risk, entry])
  })
})
