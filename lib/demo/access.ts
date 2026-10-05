import { UNLOCK } from "@/lib/demo/config"

export type Unlock = {
  /** Finished game sessions, capped at the requirement. */
  sessions: number
  needed: number
  unlocked: boolean
  /** "Selesaikan 3 sesi Trading Game dulu (1/3)", or null once open. */
  hint: string | null
}

/**
 * Akun Latihan opens after UNLOCK.GAME_SESSIONS Trading Game rounds. The game
 * doesn't store rounds, so a session is ANSWERS_PER_SESSION answers, counted
 * by the server from the player's practice_attempts.
 */
export function unlockFromAnswers(answers: number): Unlock {
  const needed = UNLOCK.GAME_SESSIONS
  const sessions = Math.min(needed, Math.floor(Math.max(0, answers) / UNLOCK.ANSWERS_PER_SESSION))
  const unlocked = sessions >= needed
  return {
    sessions,
    needed,
    unlocked,
    hint: unlocked ? null : `Selesaikan ${needed} sesi Trading Game dulu (${sessions}/${needed})`,
  }
}
