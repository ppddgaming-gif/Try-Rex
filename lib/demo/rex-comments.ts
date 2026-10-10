import { DISIPLIN } from "@/lib/demo/config"
import { checkLabel, type CheckId, type Checks } from "@/lib/demo/disiplin"
import { pct } from "@/lib/demo/format"
import { instrument } from "@/lib/demo/instruments"
import type { Side } from "@/lib/demo/money"
import { joinList, type T } from "@/lib/i18n/translator"
import type { ReasonId } from "@/lib/reasons"

// Everything Rex says about a closed trade or a finished account. Rule-based
// and all in this file. Each rule looks at the plan and how it was handled,
// never at the result (non-negotiable #3): a losing trade that followed its
// plan is praised, a winning one that didn't is not. Pure; the server attaches
// the comments to each closed trade as data, and rexCommentText() puts them
// into words in the reader's language (catalogue: rex.*).

export type CommentId =
  | "revenge"
  | "sl-widened"
  | "no-sl"
  | "risk-above"
  | "reason-contradicts"
  | "sl-too-close"
  | "feeling"
  | "good"

/** One comment and the plan's numbers it quotes. */
export type RexComment =
  | { id: "revenge" | "sl-widened" | "no-sl" | "feeling"; tone: "warn" }
  | { id: "risk-above"; tone: "warn"; riskPct: number }
  | { id: "reason-contradicts"; tone: "warn"; side: Side; reasons: ReasonId[] }
  | { id: "sl-too-close"; tone: "warn"; pair: string; slDistance: number; rangeAvg: number }
  | { id: "good"; tone: "good"; side: Side; riskPct: number; rewardRisk: number | null; rewardOk: boolean }

export type CommentInput = {
  pair: string
  side: Side
  reasons: readonly ReasonId[]
  entry: number
  /** SL when the order was placed. */
  slInitial: number | null
  /** Average candle range (high − low) of the recent candles at entry, in price. */
  rangeAvg: number
  riskPct: number | null
  rewardRisk: number | null
  checks: Checks
}

/** Reasons that point the other way: a BUY "because the trend is down". */
export const CONTRADICTS: Record<Side, readonly ReasonId[]> = {
  buy: ["trend-turun", "penolakan-resistance"],
  sell: ["trend-naik", "pantulan-support"],
}

const pips = (distance: number, pair: string) => (distance / instrument(pair).pipSize).toFixed(1)

/** Rex's comments on a closed trade, the most serious first. With nothing to flag, one that says what went well. */
export function rexComments(t: CommentInput): RexComment[] {
  const out: RexComment[] = []

  if (!t.checks.notRevenge) out.push({ id: "revenge", tone: "warn" })
  if (!t.checks.slNotWidened) out.push({ id: "sl-widened", tone: "warn" })
  if (t.slInitial === null) {
    out.push({ id: "no-sl", tone: "warn" })
  } else if (t.riskPct !== null && t.riskPct > DISIPLIN.MAX_RISK_PCT) {
    out.push({ id: "risk-above", tone: "warn", riskPct: t.riskPct })
  }
  const against = t.reasons.filter((r) => CONTRADICTS[t.side].includes(r))
  if (against.length > 0) out.push({ id: "reason-contradicts", tone: "warn", side: t.side, reasons: against })
  if (t.slInitial !== null && t.rangeAvg > 0 && Math.abs(t.entry - t.slInitial) < t.rangeAvg) {
    out.push({ id: "sl-too-close", tone: "warn", pair: t.pair, slDistance: Math.abs(t.entry - t.slInitial), rangeAvg: t.rangeAvg })
  }
  if (t.reasons.includes("ikut-feeling")) out.push({ id: "feeling", tone: "warn" })
  if (out.length > 0) return out

  // Nothing flagged: SL was set and kept, risk within the limit, reasons in
  // line with the side. Say so, plus the one check no rule above covers.
  return [{ id: "good", tone: "good", side: t.side, riskPct: t.riskPct ?? 0, rewardRisk: t.rewardRisk, rewardOk: t.checks.rewardRisk }]
}

/** A comment in words. `t` is the root translator (keys rex.*, common.*, demo.*). */
export function rexCommentText(c: RexComment, t: T): string {
  const say = (key: string, values?: Record<string, string | number>) => t(`rex.comments.${key}`, values)
  switch (c.id) {
    case "revenge":
      return say("revenge", { window: DISIPLIN.REVENGE_WINDOW_CANDLES })
    case "sl-widened":
      return say("slWidened")
    case "no-sl":
      return say("noSl")
    case "risk-above":
      return say("riskAbove", { risk: pct(c.riskPct), max: DISIPLIN.MAX_RISK_PCT })
    case "reason-contradicts":
      return say("reasonContradicts", {
        side: c.side.toUpperCase(),
        reasons: joinList(c.reasons.map((r) => t("rex.quoted", { text: t(`common.reasons.${r}`) })), t),
      })
    case "sl-too-close":
      return say("slTooClose", {
        sl: pips(c.slDistance, c.pair),
        range: pips(c.rangeAvg, c.pair),
        candles: DISIPLIN.SL_CLOSE_RANGE_CANDLES,
      })
    case "feeling":
      return say("feeling", { reason: t("rex.quoted", { text: t("common.reasons.ikut-feeling") }) })
    case "good": {
      const side = c.side.toUpperCase()
      const items = [t("rex.good.sl"), t("rex.good.risk", { risk: pct(c.riskPct) })]
      if (c.rewardOk && c.rewardRisk !== null) items.push(t("rex.good.target", { rr: c.rewardRisk.toFixed(1) }))
      items.push(t("rex.good.aligned", { side }))
      const text = t("rex.good.lead", { items: joinList(items, t) })
      if (c.rewardOk) return text
      const more =
        c.rewardRisk === null
          ? t("rex.good.addTp", { min: DISIPLIN.MIN_REWARD_RISK })
          : t("rex.good.lowTarget", { rr: c.rewardRisk.toFixed(1), min: DISIPLIN.MIN_REWARD_RISK })
      return `${text} ${more}`
    }
  }
}

/** Values Rex's account-review advice quotes. */
const ADVICE_VALUES = { max: DISIPLIN.MAX_RISK_PCT, min: DISIPLIN.MIN_REWARD_RISK }

/**
 * One line for the review: what to work on first, or that the plan held when
 * nothing failed. `t` is the root translator.
 */
export function reviewAdvice(mostFailed: CheckId | null, t: T) {
  if (mostFailed === null) return t("rex.advice.none")
  return t("rex.advice.lead", { check: checkLabel(mostFailed, t), advice: t(`rex.advice.${mostFailed}`, ADVICE_VALUES) })
}
