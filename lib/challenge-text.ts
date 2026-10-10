import type { Locale } from "@/lib/i18n/locale"
import type { T } from "@/lib/i18n/translator"
import type { Challenge, Decision } from "@/lib/mock-data"

// The words a Trading Game question says about itself, in either language.
// Every sentence is assembled from the facts buildChallenge() computed from
// the candles (lib/mock-data.ts), so the prose can never contradict the
// chart. `t` is scoped to game.challenge. Pure.

const MONTHS: Record<Locale, readonly string[]> = {
  id: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
}

/** "03 Mei 08:00" / "03 May 08:00". Fixed UTC, so server and browser agree. */
export function timeLabel(unixSeconds: number, locale: Locale) {
  const d = new Date(unixSeconds * 1000)
  const day = String(d.getUTCDate()).padStart(2, "0")
  const hh = String(d.getUTCHours()).padStart(2, "0")
  return `${day} ${MONTHS[locale][d.getUTCMonth()]} ${hh}:00`
}

/** "Mar 2021": the month a window starts in, UTC. */
export function periodLabel(unixSeconds: number, locale: Locale) {
  const d = new Date(unixSeconds * 1000)
  return `${MONTHS[locale][d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

export const timeLabels = (times: number[], locale: Locale) => times.map((s) => timeLabel(s, locale))

const signedPct = (v: number) => `${v > 0 ? "+" : ""}${v.toFixed(2)}%`

export function challengeText(c: Challenge, t: T, locale: Locale) {
  const f = c.facts
  const digits = c.digits
  const change = signedPct(f.changePercent)
  const moved = Math.abs(f.changePercent).toFixed(2)
  const trend = t(`trend.${f.trend}`)
  const period = periodLabel(f.startTime, locale)
  const r = f.resistance
  const s = f.support

  const levels =
    r && s
      ? t("situation.both", { r: r.pips, s: s.pips })
      : r
        ? t("situation.resistanceOnly", { r: r.pips })
        : s
          ? t("situation.supportOnly", { s: s.pips })
          : t("situation.none")

  const situation = `${t("situation.lead", { pair: c.pair, timeframe: c.timeframe, period, trend, pos: f.rangePos })} ${levels}`

  const reasons = [
    t("reasons.trend", { trend, slope: `${f.slopePips > 0 ? "+" : ""}${f.slopePips.toFixed(1)}` }),
    r
      ? t("reasons.resistance", { price: r.price.toFixed(digits), pips: r.pips, touches: r.touches })
      : t("reasons.noResistance"),
    s ? t("reasons.support", { price: s.price.toFixed(digits), pips: s.pips, touches: s.touches }) : t("reasons.noSupport"),
    t("reasons.range", { pos: f.rangePos, lo: f.lo.toFixed(digits), hi: f.hi.toFixed(digits) }),
    t("reasons.result", { change }),
  ]

  const suggestion =
    c.answer === "buy"
      ? s
        ? t("suggestion.buySl", { change, pips: s.pips })
        : t("suggestion.buy", { change })
      : c.answer === "sell"
        ? r
          ? t("suggestion.sellSl", { change, pips: r.pips })
          : t("suggestion.sell", { change })
        : t("suggestion.wait", { change })

  const feedbackFor = (choice: Decision): string => {
    if (choice === "wait") return c.answer === "wait" ? t("feedback.waitRight", { change }) : t("feedback.waitWrong", { change })
    if (choice === c.answer) return t(choice === "buy" ? "feedback.buyRight" : "feedback.sellRight", { moved })
    if (c.answer === "wait") return t(choice === "buy" ? "feedback.buyFlat" : "feedback.sellFlat", { change })
    return t(choice === "buy" ? "feedback.buyOpposite" : "feedback.sellOpposite", { moved })
  }
  const feedback: Record<Decision, string> = { buy: feedbackFor("buy"), sell: feedbackFor("sell"), wait: feedbackFor("wait") }

  return {
    period,
    situation,
    reasons,
    suggestion,
    feedback,
    timeLabels: timeLabels(c.times, locale),
    revealTimeLabels: timeLabels(c.revealTimes, locale),
  }
}

export type ChallengeText = ReturnType<typeof challengeText>
