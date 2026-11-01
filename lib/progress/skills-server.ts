import "server-only"
import type { CheckId } from "@/lib/demo/disiplin"
import { challenges, type Decision } from "@/lib/mock-data"
import { disiplinSamples, evaluationSamples, gameSamples, skillMeters, type SkillMeters, type SkillSample, type SkillSource } from "@/lib/progress/skills"
import { COMPETENCIES, type CompetencyKey } from "@/lib/progress/types"
import { createClient } from "@/lib/supabase/server"

// The dashboard's skill meters, read through the player's own session (RLS
// limits every query to their rows). The rules are in lib/progress/skills.ts.
// A source whose table isn't there yet (migration not run) is skipped.

/** More rows than any meter's window needs, newest first. */
const LIMIT = 200

const questions = new Map(challenges.map((c) => [c.id, c]))
const isDecision = (v: unknown): v is Decision => v === "buy" || v === "sell" || v === "wait"
const isSkill = (v: unknown): v is CompetencyKey => (COMPETENCIES as readonly unknown[]).includes(v)

export async function loadSkills(userId: string): Promise<SkillMeters> {
  const supabase = await createClient()
  const [attempts, trades, evaluations, asesmen] = await Promise.all([
    supabase.from("practice_attempts").select("scenario_id, decision, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(LIMIT),
    supabase
      .from("demo_trades")
      .select("checks, closed_at")
      .eq("user_id", userId)
      .eq("status", "closed")
      .order("closed_at", { ascending: false })
      .limit(LIMIT),
    supabase
      .from("demo_journal_evaluations")
      .select("score_risk, score_sl, score_rr, score_entry, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(LIMIT),
    supabase.from("assessment_skill_results").select("skill, value, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(LIMIT),
  ])

  const samples: SkillSample[] = []
  const add = (source: SkillSource, at: unknown, scored: { skill: CompetencyKey; value: number }[]) => {
    if (typeof at !== "string") return
    for (const s of scored) samples.push({ ...s, source, at })
  }

  // The question is rebuilt here from its id; only what its visible candles show is used.
  for (const r of attempts.error ? [] : attempts.data) {
    const q = questions.get(String(r.scenario_id))
    if (q && isDecision(r.decision)) add("game", r.created_at, gameSamples({ decision: r.decision, trend: q.facts.trend, rangePos: q.facts.rangePos }))
  }
  for (const r of trades.error ? [] : trades.data) add("demo", r.closed_at, disiplinSamples(r.checks as Partial<Record<CheckId, boolean>> | null))
  for (const r of evaluations.error ? [] : evaluations.data) {
    add("ai", r.created_at, evaluationSamples({ risk: r.score_risk, sl: r.score_sl, rr: r.score_rr, entry: r.score_entry }))
  }
  for (const r of asesmen.error ? [] : asesmen.data) {
    if (isSkill(r.skill)) add("asesmen", r.created_at, [{ skill: r.skill, value: Number(r.value) }])
  }
  return skillMeters(samples)
}
