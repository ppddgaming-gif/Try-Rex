import { describe, expect, it } from "vitest"
import { REX_CHAT } from "@/lib/demo/config"
import { rexComments } from "@/lib/demo/rex-comments"
import {
  chatMessages,
  chatQuota,
  chatRefusal,
  cleanQuestion,
  cleanReply,
  dayStart,
  systemPrompt,
  tradeFacts,
} from "@/lib/demo/rex-chat"
import type { TradeRow } from "@/lib/demo/state"
import { translator } from "@/lib/i18n/test-messages"

const id = translator("id")
const en = translator("en")

// A closed EURUSD BUY at 1.17000: SL 30 pips kept, TP 45 pips, 1.5% risk, stopped out.
const trade: TradeRow = {
  id: "00000000-0000-4000-8000-000000000001",
  number: 3,
  sessionId: null,
  pair: "EURUSD",
  side: "buy",
  lot: 0.05,
  stage: 1,
  reasons: ["trend-naik", "pantulan-support"],
  entryPrice: 1.17,
  entryIndex: 1_790_000_000,
  openedClock: 100,
  slInitial: 1.167,
  tpInitial: 1.1745,
  sl: 1.167,
  tp: 1.1745,
  balanceAtEntry: 1000,
  margin: 58.5,
  spread: 0.5,
  commission: 0,
  riskAmount: 15.5,
  riskPct: 1.55,
  rewardRisk: 1.5,
  rangeAvg: 0.002,
  revenge: false,
  swap: 0,
  status: "closed",
  exitPrice: 1.167,
  exitIndex: 1_790_010_000,
  closedClock: 110,
  exitReason: "sl",
  pips: -30,
  gross: -15,
  net: -15.5,
  counted: true,
  checks: { slAtEntry: true, riskWithinLimit: true, rewardRisk: true, slNotWidened: true, notRevenge: true },
  disiplin: 100,
  xp: 20,
  review: "ya",
  reviewNote: "Ikut rencana",
}

const comments = (t: TradeRow) =>
  rexComments({
    pair: t.pair,
    side: t.side,
    reasons: t.reasons,
    entry: t.entryPrice,
    slInitial: t.slInitial,
    rangeAvg: t.rangeAvg,
    riskPct: t.riskPct,
    rewardRisk: t.rewardRisk,
    checks: t.checks!,
  })

describe("tradeFacts: the trade as booked, in the player's words", () => {
  it.each([
    ["the pair, side and lot", "Trade #3: EURUSD BUY, 0.05 lot, Stage 1"],
    ["the entry", "Entry: 1.17000"],
    ["SL with its distance", "Stop loss: 1.16700 (30.0 pips from entry)"],
    ["TP with its distance", "Take profit: 1.17450 (45.0 pips from entry)"],
    ["reward:risk", "Reward:risk: 1.50"],
    ["the average candle range in pips", "Average candle range before entry: 20.0 pips"],
    ["the close", "1.16700, -30.0 pips"],
    ["the Disiplin score", "Disiplin score: 100%"],
    ["the player's note", 'Player\'s note: "Ikut rencana"'],
  ])("states %s", (_, line) => {
    expect(tradeFacts(trade, comments(trade), en)).toContain(line)
  })

  it("labels checks, reasons and the review in the reader's language", () => {
    const facts = tradeFacts(trade, comments(trade), id)
    expect(facts).toContain(id("demo.checks.slAtEntry"))
    expect(facts).toContain(id("common.reasons.trend-naik"))
    expect(facts).toContain(id("demo.ui.review.ya"))
    expect(facts).toContain(id("demo.ui.exit.sl"))
  })

  it.each([
    ["an SL moved away", { sl: 1.165 }, "1.16700 (30.0 pips from entry) at entry, moved to 1.16500 (50.0 pips from entry)"],
    ["no TP", { tp: null, tpInitial: null, rewardRisk: null }, "Take profit: none"],
    ["no review", { review: null, reviewNote: null }, "not answered"],
    ["a failed check", { checks: { ...trade.checks!, notRevenge: false }, revenge: true }, "Revenge trade: yes"],
  ])("handles %s", (_, over, line) => {
    const t = { ...trade, ...over } as TradeRow
    expect(tradeFacts(t, comments(t), en)).toContain(line)
  })

  it("says nothing about time: no candle times or dates reach the model", () => {
    const facts = tradeFacts(trade, comments(trade), en)
    expect(facts).not.toContain(String(trade.entryIndex))
    expect(facts).not.toContain(String(trade.exitIndex))
    expect(facts).not.toMatch(/20\d\d/)
  })
})

describe("chatMessages", () => {
  it.each([
    ["the opening", [], null, ["system", "user"]],
    ["a first question", [{ role: "assistant" as const, content: "Opening" }], "Why?", ["system", "user", "assistant", "user"]],
  ])("orders %s as rules, facts, history, question", (_, turns, question, roles) => {
    const m = chatMessages({ facts: "FACTS", locale: "en", turns, question })
    expect(m.map((x) => x.role)).toEqual(roles)
    expect(m[1].content).toContain("FACTS")
    if (question) expect(m.at(-1)!.content).toBe(question)
  })

  it.each(["id", "en"] as const)("puts the %s reply language in the system prompt", (locale) => {
    expect(systemPrompt(locale)).toContain(locale === "id" ? "Bahasa Indonesia" : "English")
  })

  it.each([/process, never the outcome/i, /never give a signal/i, /never invent statistics/i, /brokers/i])(
    "keeps the non-negotiables in the rules: %s",
    (rule) => expect(systemPrompt("en")).toMatch(rule),
  )
})

describe("cleanQuestion / cleanReply", () => {
  it.each([
    ["  Kenapa   SL?  ", "Kenapa SL?"],
    ["", null],
    ["   \n ", null],
    [42, null],
    [null, null],
    ["x".repeat(REX_CHAT.QUESTION_MAX_CHARS + 50), "x".repeat(REX_CHAT.QUESTION_MAX_CHARS)],
  ])("question %j → %j", (raw, out) => expect(cleanQuestion(raw)).toBe(out))

  it.each([
    ["<think>plan</think>\nJawaban.", "Jawaban."],
    ["A\n\n\n\nB", "A\n\nB"],
    ["<think>only thinking</think>", null],
    ["  ok  ", "ok"],
  ])("reply %j → %j", (raw, out) => expect(cleanReply(raw)).toBe(out))
})

describe("limits", () => {
  const Q = REX_CHAT.QUESTIONS_PER_TRADE
  const D = REX_CHAT.CALLS_PER_DAY
  it.each([
    [0, 0, Q, D],
    [2, 10, Q - 2, D - 10],
    [Q + 3, D + 3, 0, 0],
  ])("%i asked, %i today → %i and %i left", (asked, today, q, d) => {
    expect(chatQuota(asked, today)).toEqual({ questionsLeft: q, todayLeft: d })
  })

  it.each([
    ["intro with room", { questionsLeft: 0, todayLeft: 1 }, "intro", null],
    ["question with room", { questionsLeft: 1, todayLeft: 1 }, "question", null],
    ["question, trade used up", { questionsLeft: 0, todayLeft: 5 }, "question", "errors.rexChatTrade"],
    ["intro, day used up", { questionsLeft: 5, todayLeft: 0 }, "intro", "errors.rexChatDay"],
    ["question, both used up: the day first", { questionsLeft: 0, todayLeft: 0 }, "question", "errors.rexChatDay"],
  ] as const)("%s", (_, quota, kind, key) => {
    expect(chatRefusal(quota, kind)?.key ?? null).toBe(key)
  })

  it.each([
    // 2026-10-31 16:59 UTC = 23:59 WIB → that day started 2026-10-30 17:00 UTC.
    ["late evening WIB", Date.UTC(2026, 9, 31, 16, 59), "2026-10-30T17:00:00.000Z"],
    // 17:00 UTC = 00:00 WIB the next day.
    ["midnight WIB", Date.UTC(2026, 9, 31, 17, 0), "2026-10-31T17:00:00.000Z"],
    ["early morning UTC", Date.UTC(2026, 9, 31, 2, 0), "2026-10-30T17:00:00.000Z"],
  ])("the day resets at midnight WIB: %s", (_, now, start) => {
    expect(dayStart(now).toISOString()).toBe(start)
  })
})
