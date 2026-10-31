import { REX_CHAT } from "@/lib/demo/config"
import { CHECK_IDS, checkLabel } from "@/lib/demo/disiplin"
import { lot, pct, price, usd } from "@/lib/demo/format"
import { instrument } from "@/lib/demo/instruments"
import { levelPips } from "@/lib/demo/orders"
import { rexCommentText, type RexComment } from "@/lib/demo/rex-comments"
import type { TradeRow } from "@/lib/demo/state"
import { languageInstruction } from "@/lib/i18n/llm"
import type { Locale } from "@/lib/i18n/locale"
import { msg, type Msg, type T } from "@/lib/i18n/translator"

// "Tanya Rex": an LLM explains one closed trade and answers the player's
// questions about it. Everything it is told is the trade as the server booked
// it, up to its close, so it has nothing to say about what price did next
// (non-negotiable #1) and no reason to judge the result (#3). It never
// scores and never adds XP. Pure: the prompt, the facts, the limits. The call
// itself is lib/ai/groq.ts; storage is lib/demo/rex-chat-server.ts.

export type ChatRole = "user" | "assistant"
export type ChatTurn = { role: ChatRole; content: string }
/** One message as the chat completions API takes it. */
export type LlmMessage = { role: "system" | ChatRole; content: string }

/** What's left to ask: on this trade, and today. */
export type ChatQuota = { questionsLeft: number; todayLeft: number }
/** What the browser gets: the conversation so far and the quota. */
export type ChatState = { turns: ChatTurn[]; quota: ChatQuota }

const RULES = `You are Rex, the coach inside TRY-REX, an app where beginners practise forex with virtual money on historical price data. A player is asking about one of their closed practice trades. Its facts are below; they are everything you know about it.

Rules, most important first:
1. Judge the process, never the outcome. A losing trade that followed its plan was a good trade; a winning trade that broke the rules was not. Never praise or blame the player because of profit or loss.
2. You do not know what price did after the trade closed, and you never say what price will do. Never give a signal, an entry, a prediction or "buy/sell now". If asked, say that TRY-REX doesn't give signals and bring the talk back to the plan.
3. Only use numbers from the facts. Never invent statistics, win rates, percentages or market facts. If something isn't in the facts, say you don't know it.
4. Stay on this trade and the ideas behind it: the plan, stop loss, take profit, risk, lot size, reward:risk, the reasons given, the Disiplin checks, revenge trading, the player's own review. For anything else, say briefly that you can only talk about this trade.
5. Never mention brokers, real accounts, deposits or real money, and never give financial advice.
6. Be warm, clear and short: at most about 120 words, plain text, no headings or tables. A short list with "-" is fine. Explain any term a beginner may not know.`

const INTRO =
  "Explain this trade's process to me: what went well, what to work on, and why each Disiplin check passed or failed. Start with the most important point."

/** The system prompt, with the reply language. */
export const systemPrompt = (locale: Locale) => `${RULES}\n\n${languageInstruction(locale)}`

const yesNo = (v: boolean) => (v ? "yes" : "no")

/**
 * The closed trade as plain lines for the prompt: plan, handling, result,
 * Disiplin, Rex's rule-based comments and the player's review. Labels come
 * from `t` (the root translator) so the model quotes them in the player's
 * words. Nothing after the close.
 */
export function tradeFacts(trade: TradeRow, comments: RexComment[], t: T): string {
  const p = (v: number) => price(trade.pair, v)
  const level = (kind: "sl" | "tp", initial: number | null, final: number | null) => {
    if (initial === null && final === null) return "none"
    const at = (v: number | null) =>
      v === null ? "none" : `${p(v)} (${levelPips(trade.pair, trade.side, trade.entryPrice, kind, v).toFixed(1)} pips from entry)`
    return initial === final ? at(initial) : `${at(initial)} at entry, moved to ${at(final)}`
  }
  const lines = [
    `Trade #${trade.number}: ${trade.pair} ${trade.side.toUpperCase()}, ${lot(trade.lot)} lot, Stage ${trade.stage}`,
    `Reasons given: ${trade.reasons.map((r) => t(`common.reasons.${r}`)).join(", ") || "none"}`,
    `Entry: ${p(trade.entryPrice)}`,
    `Stop loss: ${level("sl", trade.slInitial, trade.sl)}`,
    `Take profit: ${level("tp", trade.tpInitial, trade.tp)}`,
    `Risk at entry: ${trade.riskPct === null ? "unknown (no SL)" : `${pct(trade.riskPct)} of the balance`}` +
      (trade.riskAmount === null ? "" : ` (${usd(trade.riskAmount)} if SL is hit, costs included)`),
    `Reward:risk: ${trade.rewardRisk === null ? "none (no TP or no SL)" : trade.rewardRisk.toFixed(2)}`,
    `Average candle range before entry: ${(trade.rangeAvg / instrument(trade.pair).pipSize).toFixed(1)} pips`,
    `Revenge trade: ${yesNo(trade.revenge)}`,
  ]
  if (trade.exitPrice !== null && trade.exitReason !== null) {
    lines.push(
      `Closed: ${t(`demo.ui.exit.${trade.exitReason}`)} at ${p(trade.exitPrice)}, ${(trade.pips ?? 0).toFixed(1)} pips, ` +
        `result ${usd(trade.net ?? 0, { signed: true })}, swap ${usd(trade.swap, { signed: true })}`,
    )
  }
  if (trade.checks && trade.disiplin !== null) {
    lines.push(`Disiplin score: ${trade.disiplin}% (counted toward the stage: ${yesNo(Boolean(trade.counted))})`, "Disiplin checks:")
    for (const id of CHECK_IDS) lines.push(`- ${checkLabel(id, t)}: ${trade.checks[id] ? "passed" : "failed"}`)
  }
  if (comments.length > 0) {
    lines.push("Rex's rule-based comments (already shown to the player):")
    for (const c of comments) lines.push(`- ${rexCommentText(c, t)}`)
  }
  lines.push(
    `Player's answer to "${t("demo.ui.journal.followed")}": ${trade.review ? t(`demo.ui.review.${trade.review}`) : "not answered"}`,
  )
  if (trade.reviewNote) lines.push(`Player's note: "${trade.reviewNote}"`)
  return lines.join("\n")
}

/**
 * The whole request: rules, the facts with the opening request, the stored
 * conversation, then the new question (none for the opening explanation).
 */
export function chatMessages(i: { facts: string; locale: Locale; turns: ChatTurn[]; question: string | null }): LlmMessage[] {
  return [
    { role: "system", content: systemPrompt(i.locale) },
    { role: "user", content: `The closed trade:\n${i.facts}\n\n${INTRO}` },
    ...i.turns,
    ...(i.question === null ? [] : [{ role: "user" as const, content: i.question }]),
  ]
}

/** A question as typed, tidied; null when there's nothing left to send. */
export function cleanQuestion(raw: unknown): string | null {
  if (typeof raw !== "string") return null
  const clean = raw.replace(/\s+/g, " ").trim().slice(0, REX_CHAT.QUESTION_MAX_CHARS)
  return clean || null
}

/** Longest reply stored; well above what REPLY_MAX_TOKENS can produce. */
export const REPLY_MAX_CHARS = 4000

/** The model's reply, without any reasoning it wrote inline; null when nothing is left. */
export function cleanReply(raw: string): string | null {
  const clean = raw
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, REPLY_MAX_CHARS)
  return clean || null
}

/** What's left, from the player's questions on this trade and their calls today. */
export const chatQuota = (questionsAsked: number, callsToday: number): ChatQuota => ({
  questionsLeft: Math.max(0, REX_CHAT.QUESTIONS_PER_TRADE - questionsAsked),
  todayLeft: Math.max(0, REX_CHAT.CALLS_PER_DAY - callsToday),
})

/** Why a call can't be made now, or null. A question also needs a quota for this trade. */
export function chatRefusal(quota: ChatQuota, kind: "intro" | "question"): Msg | null {
  if (quota.todayLeft <= 0) return msg("errors.rexChatDay", { max: REX_CHAT.CALLS_PER_DAY })
  if (kind === "question" && quota.questionsLeft <= 0) return msg("errors.rexChatTrade", { max: REX_CHAT.QUESTIONS_PER_TRADE })
  return null
}

/** Start of the current day in REX_CHAT's time zone, as a UTC instant. */
export function dayStart(nowMs: number, offsetHours: number = REX_CHAT.DAY_UTC_OFFSET_HOURS): Date {
  const offset = offsetHours * 3_600_000
  const day = 86_400_000
  return new Date(Math.floor((nowMs + offset) / day) * day - offset)
}
