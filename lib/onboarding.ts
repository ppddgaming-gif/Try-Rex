import type { GameLevel } from "@/lib/game-data"

// The /start quiz: five questions whose answers set the player's starting
// level, which pairs their rounds lean on, and their daily target. Pure and
// client-safe; storage lives in lib/use-onboarding.ts and lib/profile-actions.ts.
// "There are no wrong answers" is a design rule here: every option is a
// preference or a self-assessment, never a test. The wording lives in the
// onboarding catalogue: questions.<id>.title and questions.<id>.options.<value>.

export const ONBOARDING_VERSION = 1

export type Option = { value: string }

export const QUESTIONS = [
  { id: "motivation", options: [{ value: "social" }, { value: "circle" }, { value: "income" }, { value: "lost" }] },
  { id: "experience", options: [{ value: "none" }, { value: "demo" }, { value: "real" }, { value: "regular" }] },
  { id: "skill", options: [{ value: "unknown" }, { value: "basics" }, { value: "levels" }, { value: "patterns" }] },
  { id: "focus", options: [{ value: "majors" }, { value: "yen" }, { value: "cross" }, { value: "all" }] },
  { id: "time", options: [{ value: "5" }, { value: "15" }, { value: "30" }, { value: "free" }] },
] as const satisfies readonly { id: string; options: readonly Option[] }[]

export type QuestionId = "motivation" | "experience" | "skill" | "focus" | "time"
export type Answers = Partial<Record<QuestionId, string>>

/** What is stored: in profiles.onboarding for accounts, localStorage for guests. */
export type OnboardingRecord = {
  version: typeof ONBOARDING_VERSION
  answers: Answers
  /** True when the player chose "Lewati"; the plan then uses the defaults. */
  skipped: boolean
  /** ISO timestamp. */
  completedAt: string
}

export type Plan = {
  level: GameLevel
  /** Pairs the shuffle leans on; empty means no preference. */
  focusPairs: string[]
  /** Questions per day, or null for no target. */
  dailyGoal: number | null
  motivation: string | null
}

const FOCUS_PAIRS: Record<string, string[]> = {
  majors: ["EURUSD", "GBPUSD", "AUDUSD", "USDCAD"],
  yen: ["USDJPY", "EURJPY"],
  cross: ["EURAUD", "GBPCAD", "EURJPY"],
  all: [],
}

const STEP: Record<string, number> = {
  none: 0, demo: 1, real: 2, regular: 3,
  unknown: 0, basics: 1, levels: 2, patterns: 3,
}

export const DEFAULT_PLAN: Plan = { level: "easy", focusPairs: [], dailyGoal: 5, motivation: null }

/**
 * Experience and chart skill add up to 0–6: up to 2 starts on Mudah, 3–4 on
 * Menengah, 5–6 on Sulit. A "belum tahu" anywhere keeps it gentle.
 */
export function planFrom(record: OnboardingRecord | null): Plan {
  if (!record || record.skipped) return DEFAULT_PLAN
  const a = record.answers
  const score = (STEP[a.experience ?? ""] ?? 0) + (STEP[a.skill ?? ""] ?? 0)
  const level: GameLevel = score <= 2 ? "easy" : score <= 4 ? "medium" : "hard"
  const goal = a.time && a.time !== "free" ? Number(a.time) : null
  return {
    level,
    focusPairs: FOCUS_PAIRS[a.focus ?? "all"] ?? [],
    dailyGoal: goal !== null && Number.isFinite(goal) ? goal : null,
    motivation: a.motivation ?? null,
  }
}

/**
 * Catalogue key (in the onboarding namespace) of one stored answer's label,
 * for summaries on the result and settings pages; null when unanswered.
 */
export function answerLabelKey(id: QuestionId, value: string | undefined) {
  const q = QUESTIONS.find((x) => x.id === id)
  const o = q?.options.find((o) => o.value === value)
  return o ? `questions.${id}.options.${o.value}.label` : null
}

const MOTIVATIONS = QUESTIONS[0].options.map((o) => o.value)

/**
 * A known motivation answer. Rex's line for it is
 * onboarding.motivationLines.<value>.
 */
export const isMotivation = (v: unknown): v is (typeof MOTIVATIONS)[number] =>
  typeof v === "string" && (MOTIVATIONS as readonly string[]).includes(v)

/**
 * Checks a record that arrived from outside (a form post, localStorage).
 * Unknown keys and values are dropped, so nothing unexpected is ever stored.
 */
export function parseRecord(input: unknown): OnboardingRecord | null {
  if (!input || typeof input !== "object") return null
  const raw = input as Record<string, unknown>
  if (raw.version !== ONBOARDING_VERSION) return null
  const answers: Answers = {}
  const rawAnswers = (raw.answers ?? {}) as Record<string, unknown>
  for (const q of QUESTIONS) {
    const v = rawAnswers[q.id]
    if (typeof v === "string" && q.options.some((o) => o.value === v)) answers[q.id] = v
  }
  const completedAt = typeof raw.completedAt === "string" && !Number.isNaN(Date.parse(raw.completedAt)) ? raw.completedAt : null
  if (!completedAt) return null
  return { version: ONBOARDING_VERSION, answers, skipped: raw.skipped === true, completedAt }
}
