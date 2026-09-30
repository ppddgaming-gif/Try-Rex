import { describe, expect, it } from "vitest"
import { unlockFromAnswers } from "@/lib/demo/access"

describe("unlocking Akun Latihan after 3 game sessions (15 answers)", () => {
  it.each([
    [0, 0, false, "Selesaikan 3 sesi Trading Game dulu (0/3)"],
    [4, 0, false, "Selesaikan 3 sesi Trading Game dulu (0/3)"],
    [5, 1, false, "Selesaikan 3 sesi Trading Game dulu (1/3)"],
    [14, 2, false, "Selesaikan 3 sesi Trading Game dulu (2/3)"],
    [15, 3, true, null],
    [200, 3, true, null],
    [-3, 0, false, "Selesaikan 3 sesi Trading Game dulu (0/3)"],
  ])("%s answers → %s sessions, unlocked %s", (answers, sessions, unlocked, hint) => {
    const u = unlockFromAnswers(answers)
    expect(u.sessions).toBe(sessions)
    expect(u.unlocked).toBe(unlocked)
    expect(u.hint).toBe(hint)
  })
})
