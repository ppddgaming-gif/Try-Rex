import { describe, expect, it } from "vitest"
import { challengeText, periodLabel, timeLabel } from "@/lib/challenge-text"
import { translator } from "@/lib/i18n/test-messages"
import { challenges } from "@/lib/mock-data"

// Every question's words come out whole in both languages: no raw catalogue
// keys, no empty strings, and no Indonesian left in the English version.

const ID_WORDS = /\b(harga|cenderung|tepat|kurang|candle berikutnya|di atas|di bawah|tersentuh|rentang|jawabannya)\b/i

describe("challengeText", () => {
  for (const locale of ["id", "en"] as const) {
    const t = translator(locale, "game.challenge")
    it(`renders all ${challenges.length} questions in ${locale}`, () => {
      for (const c of challenges) {
        const x = challengeText(c, t, locale)
        const all = [x.situation, ...x.reasons, x.suggestion, ...Object.values(x.feedback), x.period]
        for (const s of all) {
          expect(s.trim()).not.toBe("")
          expect(s).not.toMatch(/game\.challenge|\{|\}/)
          if (locale === "en") expect(s).not.toMatch(ID_WORDS)
        }
        expect(x.reasons).toHaveLength(5)
        expect(x.timeLabels).toHaveLength(5)
      }
    })
  }

  it("formats months per language, in UTC", () => {
    // 2021-05-03 08:00 UTC
    const s = Date.UTC(2021, 4, 3, 8) / 1000
    expect(timeLabel(s, "id")).toBe("03 Mei 08:00")
    expect(timeLabel(s, "en")).toBe("03 May 08:00")
    expect(periodLabel(s, "id")).toBe("Mei 2021")
    expect(periodLabel(s, "en")).toBe("May 2021")
  })
})
