import { describe, expect, it } from "vitest"
import type { Checks } from "@/lib/demo/disiplin"
import { reviewAdvice, rexCommentText, rexComments, type CommentId, type CommentInput, type RexComment } from "@/lib/demo/rex-comments"
import { translator } from "@/lib/i18n/test-messages"
import { joinList } from "@/lib/i18n/translator"

const id = translator("id")
const en = translator("en")
/** The first comment's words, in Indonesian. */
const first = (input: CommentInput) => rexCommentText(rexComments(input)[0], id)

const pass: Checks = { slAtEntry: true, riskWithinLimit: true, rewardRisk: true, slNotWidened: true, notRevenge: true }

// A planned EURUSD BUY at 1.1700: SL 30 pips, 1.5% risk, 1.5× reward, average candle range 20 pips.
const planned: CommentInput = {
  pair: "EURUSD",
  side: "buy",
  reasons: ["trend-naik", "pantulan-support"],
  entry: 1.17,
  slInitial: 1.167,
  rangeAvg: 0.002,
  riskPct: 1.5,
  rewardRisk: 1.5,
  checks: pass,
}

const ids = (over: Partial<CommentInput>) => rexComments({ ...planned, ...over }).map((c) => c.id)

describe("rexComments: one rule each, process only", () => {
  it.each([
    ["a full plan: says what went well", {}, ["good"]],
    ["revenge", { checks: { ...pass, notRevenge: false } }, ["revenge"]],
    ["SL moved further", { checks: { ...pass, slNotWidened: false } }, ["sl-widened"]],
    ["risk above the limit", { riskPct: 2.4, checks: { ...pass, riskWithinLimit: false } }, ["risk-above"]],
    ["risk exactly at the limit is fine", { riskPct: 2 }, ["good"]],
    [
      "no SL at all",
      { slInitial: null, riskPct: null, rewardRisk: null, checks: { ...pass, slAtEntry: false, riskWithinLimit: false, rewardRisk: false } },
      ["no-sl"],
    ],
    ["BUY because the trend is down", { reasons: ["trend-turun"] }, ["reason-contradicts"]],
    ["BUY at resistance rejection", { reasons: ["breakout", "penolakan-resistance"] }, ["reason-contradicts"]],
    ["SELL because the trend is up", { side: "sell", slInitial: 1.173, reasons: ["trend-naik"] }, ["reason-contradicts"]],
    ["SELL with a matching reason", { side: "sell", slInitial: 1.173, reasons: ["trend-turun"] }, ["good"]],
    ["breakout fits either side", { side: "sell", slInitial: 1.173, reasons: ["breakout"] }, ["good"]],
    ["SL closer than the average candle", { slInitial: 1.1685 }, ["sl-too-close"]],
    ["SL exactly one average candle away is fine", { slInitial: 1.168 }, ["good"]],
    ["ikut feeling", { reasons: ["ikut-feeling"] }, ["feeling"]],
    [
      "several at once, most serious first",
      { reasons: ["trend-turun", "ikut-feeling"], slInitial: 1.1695, checks: { ...pass, notRevenge: false } },
      ["revenge", "reason-contradicts", "sl-too-close", "feeling"],
    ],
  ] as [string, Partial<CommentInput>, CommentId[]][])("%s", (_name, over, expected) => {
    expect(ids(over)).toEqual(expected)
  })

  it("never mentions the result, in either language", () => {
    const idWords = /untung|rugi \$|profit|loss|menang|kalah|hasil(?!nya)/i
    const enWords = /profit|won|win|lost \$|loss of|result/i
    const all: RexComment[] = [
      rexComments(planned),
      rexComments({ ...planned, reasons: ["trend-turun", "ikut-feeling"], slInitial: 1.1695, riskPct: 5, checks: { ...pass, notRevenge: false, slNotWidened: false, riskWithinLimit: false } }),
      rexComments({ ...planned, slInitial: null, riskPct: null, rewardRisk: null, checks: { ...pass, slAtEntry: false, riskWithinLimit: false, rewardRisk: false } }),
      rexComments({ ...planned, rewardRisk: 1.2, checks: { ...pass, rewardRisk: false } }),
    ].flat()
    for (const c of all) {
      expect(rexCommentText(c, id)).not.toMatch(idWords)
      expect(rexCommentText(c, en)).not.toMatch(enWords)
    }
  })

  it("puts numbers from the plan in the words", () => {
    expect(first({ ...planned, slInitial: 1.1688 })).toContain("SL hanya 12.0 pip dari entry")
    expect(first({ ...planned, slInitial: 1.1688 })).toContain("(20.0 pip)")
    expect(first({ ...planned, riskPct: 4.5, checks: { ...pass, riskWithinLimit: false } })).toContain("Risiko 4.5% saldo")
  })

  it("praise names the reward only when its check passed, and asks for TP when it didn't", () => {
    expect(first(planned)).toContain("target 1.5× risiko")
    const noTp = rexComments({ ...planned, rewardRisk: null, checks: { ...pass, rewardRisk: false } })[0]
    expect(noTp.tone).toBe("good")
    expect(rexCommentText(noTp, id)).not.toContain("target")
    expect(rexCommentText(noTp, id)).toContain("pasang TP")
    const low = rexComments({ ...planned, rewardRisk: 1.2, checks: { ...pass, rewardRisk: false } })[0]
    expect(rexCommentText(low, id)).toContain("target baru 1.2× risiko")
  })

  it("JPY pairs measure pips in hundredths", () => {
    const yen = rexComments({ ...planned, pair: "USDJPY", entry: 110, slInitial: 109.9, rangeAvg: 0.25 })
    expect(rexCommentText(yen[0], id)).toContain("SL hanya 10.0 pip")
  })
})

describe("joinList", () => {
  it.each([
    [["a"], "a", "a"],
    [["a", "b"], "a dan b", "a and b"],
    [["a", "b", "c"], "a, b, dan c", "a, b, and c"],
  ])("%j", (items, inId, inEn) => {
    expect(joinList(items, id)).toBe(inId)
    expect(joinList(items, en)).toBe(inEn)
  })
})

describe("rexCommentText", () => {
  it("quotes the reasons in the reader's language", () => {
    const c = rexComments({ ...planned, reasons: ["trend-turun"] })[0]
    expect(rexCommentText(c, id)).toBe(
      "Kamu BUY dengan alasan “Trend turun”, padahal alasan itu menunjuk ke arah sebaliknya. Cek lagi apa yang sebenarnya kamu lihat di chart.",
    )
    expect(rexCommentText(c, en)).toContain("because of “Downtrend”")
  })

  it("praise reads the same as before", () => {
    expect(first(planned)).toBe(
      "Yang sudah baik: SL dipasang sejak awal dan tidak dijauhkan, risiko 1.5% saldo, target 1.5× risiko, dan alasan sejalan dengan arah BUY. Rencana seperti ini yang dinilai, apa pun hasilnya.",
    )
  })
})

describe("reviewAdvice", () => {
  it("names the check failed most often", () => {
    expect(reviewAdvice("riskWithinLimit", id)).toMatch(/^Risiko maksimal 2% saldo paling sering tidak lolos\. Mulai dari risiko/)
  })
  it("says the plan held when nothing failed", () => {
    expect(reviewAdvice(null, id)).toContain("sudah mengikuti aturan Disiplin")
  })
})
