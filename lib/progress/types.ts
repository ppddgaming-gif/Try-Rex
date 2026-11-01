import type { Decision } from "@/lib/mock-data"

export const PROGRESS_VERSION = 1

/** The four skills from the build spec; the dashboard's meters come from lib/progress/skills.ts. */
export const COMPETENCIES = ["trend_reading", "entry_timing", "risk_management", "market_structure"] as const
export type CompetencyKey = (typeof COMPETENCIES)[number]

// Labels: progress.competencies.<key> in the message catalogues.

/** One answered question. */
export type Attempt = {
  scenarioId: string
  pair: string
  timeframe: string
  /** 1–5, from the dataset level. */
  difficulty: number
  decision: Decision
  correct: boolean
  xpEarned: number
  /** ISO timestamp. */
  createdAt: string
}

export type Streak = {
  current: number
  best: number
  /** Local calendar date (YYYY-MM-DD) of the last attempt, or null if never played. */
  lastPlayedDate: string | null
}

export type Progress = {
  version: typeof PROGRESS_VERSION
  xp: number
  /** Oldest first. */
  attempts: Attempt[]
  streak: Streak
}

export function emptyProgress(): Progress {
  return {
    version: PROGRESS_VERSION,
    xp: 0,
    attempts: [],
    streak: { current: 0, best: 0, lastPlayedDate: null },
  }
}
