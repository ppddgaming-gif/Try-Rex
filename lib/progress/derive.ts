import { emptyProgress, type Attempt, type Progress, type Streak } from "@/lib/progress/types"

// Every number the UI shows is derived here from the stored attempts. No
// component holds a literal statistic.

/** XP needed to go from `level` to `level + 1`. */
export const xpToNextLevel = (level: number) => 100 * level

/**
 * Level 1 at 0 XP; each level needs 100 × level more to reach the next
 * (L1→2: 100, L2→3: 200, …). `into` and `needed` drive the XP bar.
 */
export function levelFromXp(xp: number) {
  let level = 1
  let remaining = Math.max(0, Math.floor(xp))
  while (remaining >= xpToNextLevel(level)) {
    remaining -= xpToNextLevel(level)
    level++
  }
  return { level, into: remaining, needed: xpToNextLevel(level) }
}

export const totalChallenges = (p: Progress) => p.attempts.length

export const correctCount = (p: Progress) => p.attempts.filter((a) => a.correct).length

/** Share of correct answers, 0–1, or null before the first attempt. */
export function accuracy(p: Progress) {
  const n = totalChallenges(p)
  return n === 0 ? null : correctCount(p) / n
}

/** Local calendar date as YYYY-MM-DD. Local, not UTC: a streak day is the player's day. */
export function localDateKey(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

/** Attempt count per local date, for the practice calendar. */
export function attemptsPerDay(attempts: Attempt[]) {
  const counts = new Map<string, number>()
  for (const a of attempts) {
    const key = localDateKey(new Date(a.createdAt))
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return counts
}

function daysBetween(fromKey: string, toKey: string) {
  const [fy, fm, fd] = fromKey.split("-").map(Number)
  const [ty, tm, td] = toKey.split("-").map(Number)
  // Date.UTC on the calendar parts sidesteps daylight-saving hour shifts.
  return Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / 86_400_000)
}

/**
 * Streak after an attempt on local day `today`: unchanged if already played
 * today, +1 if the last play was yesterday, otherwise back to 1.
 */
export function nextStreak(streak: Streak, today: string): Streak {
  if (streak.lastPlayedDate === today) return streak
  const continues = streak.lastPlayedDate !== null && daysBetween(streak.lastPlayedDate, today) === 1
  const current = continues ? streak.current + 1 : 1
  return { current, best: Math.max(streak.best, current), lastPlayedDate: today }
}

/**
 * Progress rebuilt from attempts alone (oldest first): XP is their sum and
 * the streak is replayed day by day. The account store keeps only attempts,
 * so these totals can never drift from the history.
 */
export function progressFromAttempts(attempts: Attempt[]): Progress {
  const base = emptyProgress()
  let xp = 0
  let streak = base.streak
  for (const a of attempts) {
    xp += a.xpEarned
    streak = nextStreak(streak, localDateKey(new Date(a.createdAt)))
  }
  return { ...base, xp, attempts, streak }
}

/**
 * The streak as it stands on `today`: a streak whose last play is older than
 * yesterday has already broken, even though nothing has been written yet.
 */
export function liveStreak(streak: Streak, today: string) {
  if (streak.lastPlayedDate === null) return 0
  const gap = daysBetween(streak.lastPlayedDate, today)
  return gap <= 1 ? streak.current : 0
}

export const playedToday = (streak: Streak, today: string) => streak.lastPlayedDate === today

/** Attempts newest first. */
export const recentAttempts = (p: Progress, n: number) => p.attempts.slice(-n).reverse()

export const INSIGHT_UNLOCK = 5

const DECISION_WORD = { buy: "BUY", sell: "SELL", wait: "WAIT" } as const

/**
 * One factual line about how the player has answered, counted from the
 * attempts. It states what happened; it gives no advice.
 */
export function insightLine(p: Progress) {
  const n = totalChallenges(p)
  if (n < INSIGHT_UNLOCK) return null
  const tally = { buy: 0, sell: 0, wait: 0 }
  for (const a of p.attempts) tally[a.decision]++
  const top = (Object.keys(tally) as (keyof typeof tally)[]).sort((a, b) => tally[b] - tally[a])
  const tie = tally[top[0]] === tally[top[1]]
  const pick = tie ? "Pilihanmu cukup merata." : `Kamu paling sering pilih ${DECISION_WORD[top[0]]}.`
  return `${n} soal, ${correctCount(p)} tepat. ${pick}`
}
