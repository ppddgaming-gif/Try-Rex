import { describe, expect, it } from "vitest"
import { unlockFromAnswers } from "@/lib/demo/access"

describe("unlocking Akun Latihan after 3 game sessions (15 answers)", () => {
  it.each([
    [0, 0, false],
    [4, 0, false],
    [5, 1, false],
    [14, 2, false],
    [15, 3, true],
    [200, 3, true],
    [-3, 0, false],
  ])("%s answers → %s sessions, unlocked %s", (answers, sessions, unlocked) => {
    const u = unlockFromAnswers(answers)
    expect(u.sessions).toBe(sessions)
    expect(u.needed).toBe(3)
    expect(u.unlocked).toBe(unlocked)
  })
})
