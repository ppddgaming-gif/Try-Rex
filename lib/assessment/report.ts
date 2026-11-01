import { scoreBasic, scoreComplex, scoreScenario, type Aspect, type ScenarioScore } from "@/lib/assessment/grade"
import { pnlUsd } from "@/lib/assessment/sim"
import type { Action, Answer, Bar, Decision, EntryType, ItemKey, PublicPackage, ScenarioRun, Text } from "@/lib/assessment/types"

// The end-of-package review: every item with its score, keys and
// explanations, per-aspect averages and the Learn 101 levels to revisit.
// Built only once every item is answered. Pure: the route passes the keys,
// candles and lesson titles in. No ranking, no comparison with anyone else.

/** A level is flagged for revisiting below this share of its multiple-choice points. */
export const REVISIT_BELOW = 0.7

export type ScenarioReview = {
  type: "scenario"
  id: string
  score: ScenarioScore
  decision: Decision
  ideal: { action: Action; entry: EntryType | null; acceptable: Action[] }
  validReasons: string[]
  fill: ScenarioRun["f"]
  exit: ScenarioRun["x"]
  /** Profit or loss of the trade: shown as one sample, never part of the score. */
  pnl: number | null
  feedback: Record<Aspect, Text>
  event: Text | null
  candles: Bar[]
  context: number
}

export type McqReview = {
  type: "mcq_complex" | "mcq_basic"
  id: string
  level: number
  chosen: string[]
  correct: string[]
  score: number
  explanations: Record<string, Text>
  explanation: Text | null
  lesson: { slug: string; title: Text | null }
}

export type Report = {
  items: (ScenarioReview | McqReview)[]
  scenarios: { average: number; count: number }
  aspects: Record<Aspect, { points: number; max: number } | null>
  complex: { score: number; max: number }
  basic: { score: number; max: number }
  levels: { level: number; earned: number; possible: number; revisit: boolean }[]
}

export type ReportInputs = {
  pkg: PublicPackage
  answers: Answer[]
  keyOf: (id: string) => ItemKey
  windowOf: (id: string) => { context: Bar[]; play: Bar[] }
  lessonTitle: (slug: string) => Text | null
}

const round1 = (v: number) => Math.round(v * 10) / 10
const ASPECTS: Aspect[] = ["risk", "sl", "tp", "decision", "management"]

export function buildReport({ pkg, answers, keyOf, windowOf, lessonTitle }: ReportInputs): Report {
  const items: Report["items"] = []
  const aspectSum = Object.fromEntries(ASPECTS.map((a) => [a, { points: 0, max: 0 }])) as Record<Aspect, { points: number; max: number }>
  const levels = new Map<number, { earned: number; possible: number }>()
  const scenarioTotals: number[] = []
  const complex = { score: 0, max: 0 }
  const basic = { score: 0, max: 0 }

  pkg.items.forEach((item, idx) => {
    const answer = answers[idx]
    const key = keyOf(item.id)
    if (item.type === "scenario" && key.type === "scenario") {
      const run = answer as ScenarioRun
      const score = scoreScenario(key, run, item.balance, item.pipSize)
      scenarioTotals.push(score.total)
      for (const a of ASPECTS) {
        const s = score.aspects[a]
        if (s) {
          aspectSum[a].points += s.points
          aspectSum[a].max += s.max
        }
      }
      const w = windowOf(item.id)
      const d = run.d
      items.push({
        type: "scenario",
        id: item.id,
        score,
        decision: d,
        ideal: { action: key.decision.ideal, entry: key.decision.entry, acceptable: key.decision.acceptable },
        validReasons: key.decision.valid_reasons,
        fill: run.f,
        exit: run.x,
        pnl: d.action !== "no_trade" && run.f && run.x ? pnlUsd(d.action, run.f.p, run.x.p, d.lot as number, item.pipSize, item.pipValue) : null,
        feedback: key.feedback,
        event: key.event?.name ?? null,
        candles: [...w.context, ...w.play],
        context: w.context.length,
      })
      return
    }
    if (item.type === "scenario" || key.type === "scenario") return
    const chosen = (answer as { s: string[] }).s
    const score = key.type === "mcq_complex" ? scoreComplex(key, chosen) : scoreBasic(key, chosen)
    const bucket = key.type === "mcq_complex" ? complex : basic
    bucket.score += score
    bucket.max += 1
    const lv = levels.get(key.level) ?? { earned: 0, possible: 0 }
    lv.earned += score
    lv.possible += 1
    levels.set(key.level, lv)
    items.push({
      type: key.type,
      id: item.id,
      level: key.level,
      chosen,
      correct: key.type === "mcq_complex" ? key.correct : [key.correct],
      score,
      explanations: key.type === "mcq_complex" ? key.explanations : {},
      explanation: key.type === "mcq_basic" ? key.explanation : null,
      lesson: { slug: key.source, title: lessonTitle(key.source) },
    })
  })

  return {
    items,
    scenarios: {
      average: scenarioTotals.length ? round1(scenarioTotals.reduce((a, b) => a + b, 0) / scenarioTotals.length) : 0,
      count: scenarioTotals.length,
    },
    aspects: Object.fromEntries(ASPECTS.map((a) => [a, aspectSum[a].max ? { points: round1(aspectSum[a].points), max: aspectSum[a].max } : null])) as Report["aspects"],
    complex: { score: round1(complex.score), max: complex.max },
    basic: { score: basic.score, max: basic.max },
    levels: [...levels.entries()]
      .sort(([a], [b]) => a - b)
      .map(([level, v]) => ({ level, earned: round1(v.earned), possible: v.possible, revisit: v.earned / v.possible < REVISIT_BELOW })),
  }
}
