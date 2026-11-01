import type { CheckId } from "@/lib/demo/disiplin"
import type { Decision, Trend } from "@/lib/mock-data"
import { COMPETENCIES, type CompetencyKey } from "@/lib/progress/types"

// The dashboard's four skill meters, from what the player actually did.
// Every result becomes one sample (a value from 0 to 1 for one skill); a
// meter is the mean of its newest samples. Every rule here reads the
// process only, never what price did next. Pure; the server reads the rows
// (lib/progress/skills-server.ts).

export const SKILLS = {
  /** A meter is the mean of this many newest samples. */
  WINDOW: 20,
  /** Fewer samples than this and the meter stays "Belum diuji". */
  MIN_SAMPLES: 5,
} as const

export const SKILL_SOURCES = ["game", "asesmen", "demo", "ai"] as const
export type SkillSource = (typeof SKILL_SOURCES)[number]

/** One result for one skill: `value` 0..1, `at` an ISO timestamp. */
export type SkillSample = { skill: CompetencyKey; value: number; source: SkillSource; at: string }

/** A meter: a whole percent, how many samples made it, and how many came from each source. */
export type SkillMeter = { value: number; count: number; sources: Partial<Record<SkillSource, number>> }
export type SkillMeters = Record<CompetencyKey, SkillMeter | null>

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

/** Each skill's newest WINDOW samples averaged; null below MIN_SAMPLES. */
export function skillMeters(samples: SkillSample[]): SkillMeters {
  const newest = [...samples].sort((a, b) => b.at.localeCompare(a.at))
  return Object.fromEntries(
    COMPETENCIES.map((skill) => {
      const recent = newest.filter((s) => s.skill === skill).slice(0, SKILLS.WINDOW)
      if (recent.length < SKILLS.MIN_SAMPLES) return [skill, null]
      const sources: Partial<Record<SkillSource, number>> = {}
      for (const s of recent) sources[s.source] = (sources[s.source] ?? 0) + 1
      const mean = recent.reduce((sum, s) => sum + clamp01(s.value), 0) / recent.length
      return [skill, { value: Math.round(mean * 100), count: recent.length, sources }]
    }),
  ) as SkillMeters
}

type Scored = { skill: CompetencyKey; value: number }

/**
 * One Trading Game answer, judged only against the 30 candles the player saw:
 * the trend (going with it, waiting, or against it) and where the last close
 * sits in the range (buying at the top or selling at the bottom). The input
 * has no room for the answer or what price did next.
 */
export function gameSamples(q: { decision: Decision; trend: Trend; rangePos: number }): Scored[] {
  const out: Scored[] = []
  const withTrend = (q.trend === "up" && q.decision === "buy") || (q.trend === "down" && q.decision === "sell")
  if (q.trend === "flat") out.push({ skill: "trend_reading", value: q.decision === "wait" ? 1 : 0.5 })
  else out.push({ skill: "trend_reading", value: withTrend ? 1 : q.decision === "wait" ? 0.5 : 0 })
  if (q.rangePos >= 80) out.push({ skill: "market_structure", value: q.decision === "buy" ? 0 : 1 })
  else if (q.rangePos <= 20) out.push({ skill: "market_structure", value: q.decision === "sell" ? 0 : 1 })
  return out
}

const RISK_CHECKS: CheckId[] = ["slAtEntry", "riskWithinLimit", "rewardRisk", "slNotWidened"]

/** One closed Akun Latihan trade's Disiplin checks: the risk checks, and not revenge trading. */
export function disiplinSamples(checks: Partial<Record<CheckId, boolean>> | null): Scored[] {
  if (!checks || typeof checks !== "object") return []
  const known = RISK_CHECKS.filter((id) => typeof checks[id] === "boolean")
  const out: Scored[] = []
  if (known.length) out.push({ skill: "risk_management", value: known.filter((id) => checks[id]).length / known.length })
  if (typeof checks.notRevenge === "boolean") out.push({ skill: "entry_timing", value: checks.notRevenge ? 1 : 0 })
  return out
}

/** One saved AI Evaluation (scores 0–100): risk, SL and R:R for risk; the entry decision for timing. */
export function evaluationSamples(s: { risk: number; sl: number; rr: number; entry: number }): Scored[] {
  return [
    { skill: "risk_management", value: clamp01((s.risk + s.sl + s.rr) / 300) },
    { skill: "entry_timing", value: clamp01(s.entry / 100) },
  ]
}
