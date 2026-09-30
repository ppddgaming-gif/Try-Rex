import { describe, expect, it } from "vitest"
import type { StageNumber } from "@/lib/demo/config"
import { progressLabel, stageAfter, stageProgress, type ScoredTrade } from "@/lib/demo/stages"

const run = (stage: StageNumber, scores: number[]): ScoredTrade[] => scores.map((score) => ({ stage, score }))
const times = (n: number, score: number) => Array<number>(n).fill(score)

describe("stage unlocks", () => {
  it.each([
    ["Stage 1, 10 trades at 80%", 1, run(1, times(10, 80)), 2],
    ["Stage 1, 10 trades at 79%", 1, run(1, [...times(9, 80), 71]), 1],
    ["Stage 1, 9 trades at 100%", 1, run(1, times(9, 100)), 1],
    ["Stage 1, early misses outside the last 20", 1, run(1, [...times(5, 0), ...times(20, 100)]), 2],
    ["Stage 2, 20 Stage 2 trades at 80%", 2, [...run(1, times(10, 80)), ...run(2, times(20, 80))], 3],
    ["Stage 2, 19 Stage 2 trades", 2, [...run(1, times(10, 100)), ...run(2, times(19, 100))], 2],
    ["Stage 2, Stage 1 trades don't count", 2, [...run(1, times(30, 100)), ...run(2, times(5, 100))], 2],
    ["Stage 3 is the top", 3, run(3, times(40, 100)), 3],
  ] as [string, StageNumber, ScoredTrade[], StageNumber][])("%s → Stage %i", (_name, stage, trades, after) => {
    expect(stageAfter(stage, trades)).toBe(after)
  })
})

describe("progressLabel", () => {
  it.each([
    ["no trades yet", 1, [], "0/10 trade · Disiplin — (butuh 80%)"],
    ["the ticket's example", 1, run(1, [...times(6, 80), 36]), "7/10 trade · Disiplin 74% (butuh 80%)"],
    ["past the count", 1, run(1, times(12, 70)), "10/10 trade · Disiplin 70% (butuh 80%)"],
    ["Stage 2", 2, run(2, times(3, 100)), "3/20 trade · Disiplin 100% (butuh 80%)"],
    ["Stage 3", 3, run(3, times(4, 90)), "Stage tertinggi · 4 trade · Disiplin 90%"],
  ] as [string, StageNumber, ScoredTrade[], string][])("%s", (_name, stage, trades, label) => {
    expect(progressLabel(stageProgress(stage, trades))).toBe(label)
  })
})
