import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import type { Report } from "@/lib/assessment/report"
import { assessmentSamples, LESSON_SKILL, NO_SKILL } from "@/lib/assessment/skills"
import { PACKAGE_IDS } from "@/lib/assessment/types"
import { lessonBySlug } from "@/lib/learn/content"

describe("the lesson table", () => {
  const sources = new Set<string>()
  for (const p of PACKAGE_IDS) {
    const keys = JSON.parse(readFileSync(`assessment/keys/${p}.keys.json`, "utf8")) as { items: Record<string, { source?: string }> }
    for (const k of Object.values(keys.items)) if (k.source) sources.add(k.source)
  }

  it("covers every lesson the packages draw from, one way or the other", () => {
    expect([...sources].filter((s) => !(s in LESSON_SKILL) && !NO_SKILL.has(s))).toEqual([])
  })

  it("names only real lessons", () => {
    expect([...Object.keys(LESSON_SKILL), ...NO_SKILL].filter((s) => !lessonBySlug.has(s))).toEqual([])
  })

  it("never lists a lesson twice", () => {
    expect(Object.keys(LESSON_SKILL).filter((s) => NO_SKILL.has(s))).toEqual([])
  })
})

describe("assessmentSamples", () => {
  const mcq = (id: string, slug: string, score: number) => ({ type: "mcq_basic", id, level: 1, chosen: [], correct: [], score, explanations: {}, explanation: null, lesson: { slug, title: null } })
  const scenario = (id: string, aspects: Record<string, { points: number; max: number }>) => ({ type: "scenario", id, score: { total: 0, mode: "trade", aspects, measures: {} } })
  const report = (items: unknown[]) => ({ items }) as unknown as Report
  const kinds: Record<string, string> = { S1: "normal", S2: "event", S3: "normal" }
  const run = (items: unknown[]) => assessmentSamples(report(items), (id) => kinds[id] ?? null).map((s) => [s.item, s.skill, s.value])

  it.each([
    ["a trend lesson", [mcq("M1", "trend", 1)], [["M1", "trend_reading", 1]]],
    ["a risk lesson, half right", [mcq("M2", "risk-reward", 0.5)], [["M2", "risk_management", 0.5]]],
    ["a fundamentals lesson tests no skill", [mcq("M3", "the-fed", 1)], []],
    [
      "a traded scenario: risk, SL and TP together, the decision for trend",
      [scenario("S1", { risk: { points: 25, max: 25 }, sl: { points: 10, max: 25 }, tp: { points: 15, max: 15 }, decision: { points: 14, max: 20 }, management: { points: 15, max: 15 } })],
      [["S1", "risk_management", 0.769], ["S1", "trend_reading", 0.7]],
    ],
    ["a news scenario skipped: the decision is entry timing", [scenario("S2", { decision: { points: 20, max: 20 } })], [["S2", "entry_timing", 1]]],
    ["a scenario scored on its decision alone", [scenario("S3", { decision: { points: 0, max: 20 } })], [["S3", "trend_reading", 0]]],
  ] as [string, unknown[], [string, string, number][]][])("%s", (_name, items, want) => {
    expect(run(items)).toEqual(want)
  })
})
