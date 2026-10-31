import { ACCOUNT, DISIPLIN, UNLOCK } from "@/lib/demo/config"
import { CHECK_IDS } from "@/lib/demo/disiplin"
import { FUTURE, HISTORY } from "@/lib/game-logic"
import { GLOSSARY } from "@/lib/glossary"
import { LESSONS, LEVELS } from "@/lib/learn/content"
import { EXAM } from "@/lib/learn/exam/engine"
import { LIVE_PAIRS, TIMEFRAMES } from "@/lib/live/config"
import { challenges } from "@/lib/mock-data"
import { QUESTIONS } from "@/lib/onboarding"

// Every product number the landing page quotes, read from the code that
// decides it, so the copy can't drift from what the app does. These are
// facts about the product, never about its users (those come from
// public_stats()).
export const FACTS = {
  quiz: QUESTIONS.length,
  levels: LEVELS.length,
  lessons: LESSONS.length,
  examQuestions: EXAM.QUESTIONS,
  examPass: EXAM.PASS,
  questions: challenges.length,
  gamePairs: new Set(challenges.map((c) => c.pair)).size,
  history: HISTORY,
  future: FUTURE,
  round: UNLOCK.ANSWERS_PER_SESSION,
  sessions: UNLOCK.GAME_SESSIONS,
  balance: ACCOUNT.STARTING_BALANCE,
  livePairs: LIVE_PAIRS.length,
  timeframes: TIMEFRAMES.length,
  checks: CHECK_IDS.length,
  maxRisk: DISIPLIN.MAX_RISK_PCT,
  minRr: DISIPLIN.MIN_REWARD_RISK,
  glossary: GLOSSARY.length,
} as const
