import type { Report } from "@/lib/assessment/report"
import type { CompetencyKey } from "@/lib/progress/types"

// Which of the dashboard's four skills each Asesmen item tests. A
// multiple-choice item tests the skill of the Learn 101 lesson it comes
// from; a scenario's risk, SL and TP points test risk management, and its
// decision tests trend reading (or entry timing for a news scenario). The
// values are the rubric's own process scores. Pure.

/** The lesson behind a multiple-choice item, by slug. */
export const LESSON_SKILL: Record<string, CompetencyKey> = {
  trend: "trend_reading",
  "bullish-bearish": "trend_reading",
  "moving-average": "trend_reading",
  "trendline-channel": "trend_reading",
  timeframe: "trend_reading",
  "candlestick-ohlc": "trend_reading",
  "struktur-pasar": "market_structure",
  "support-resistance": "market_structure",
  breakout: "market_structure",
  "pullback-retest": "market_structure",
  "pola-harga": "market_structure",
  "konfirmasi-entry": "entry_timing",
  "sesi-pasar": "entry_timing",
  "berita-berdampak-tinggi": "entry_timing",
  "kalender-ekonomi": "entry_timing",
  "keputusan-impulsif": "entry_timing",
  "fomo-overtrading": "entry_timing",
  rsi: "entry_timing",
  "risk-reward": "risk_management",
  "stop-loss-take-profit": "risk_management",
  "position-sizing": "risk_management",
  "leverage-margin": "risk_management",
  drawdown: "risk_management",
  "pip-lot": "risk_management",
  "risiko-kerugian": "risk_management",
  atr: "risk_management",
  disiplin: "risk_management",
}

/** Lessons that test none of the four skills (fundamentals and basics). */
export const NO_SKILL = new Set([
  "apa-itu-forex",
  "base-quote",
  "currency-pair",
  "bid-ask-spread",
  "ekonomi-dan-mata-uang",
  "suku-bunga",
  "the-fed",
  "inflasi-tenaga-kerja",
  "jurnal-trading",
  "evaluasi-kesalahan",
  "konsistensi-data",
])

export type ItemSkill = { item: string; skill: CompetencyKey; value: number }

const round3 = (v: number) => Math.round(Math.min(1, Math.max(0, v)) * 1000) / 1000

/** The skill results of one finished package. `kindOf` is a scenario key's kind ("normal" or "event"). */
export function assessmentSamples(report: Report, kindOf: (id: string) => string | null): ItemSkill[] {
  const out: ItemSkill[] = []
  for (const r of report.items) {
    if (r.type === "scenario") {
      const a = r.score.aspects
      const risk = [a.risk, a.sl, a.tp].filter((x) => x && x.max > 0) as { points: number; max: number }[]
      if (risk.length) {
        const max = risk.reduce((s, x) => s + x.max, 0)
        out.push({ item: r.id, skill: "risk_management", value: round3(risk.reduce((s, x) => s + x.points, 0) / max) })
      }
      if (a.decision && a.decision.max > 0) {
        out.push({ item: r.id, skill: kindOf(r.id) === "event" ? "entry_timing" : "trend_reading", value: round3(a.decision.points / a.decision.max) })
      }
      continue
    }
    const skill = LESSON_SKILL[r.lesson.slug]
    if (skill) out.push({ item: r.id, skill, value: round3(r.score) })
  }
  return out
}
