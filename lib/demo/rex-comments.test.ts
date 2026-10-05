import { describe, expect, it } from "vitest"
import type { Checks } from "@/lib/demo/disiplin"
import { listId, reviewAdvice, rexComments, type CommentId, type CommentInput } from "@/lib/demo/rex-comments"

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

  it("never mentions the result", () => {
    const words = /untung|rugi \$|profit|loss|menang|kalah|hasil(?!nya)/i
    const all = [
      rexComments(planned),
      rexComments({ ...planned, reasons: ["trend-turun", "ikut-feeling"], slInitial: 1.1695, riskPct: 5, checks: { ...pass, notRevenge: false, slNotWidened: false, riskWithinLimit: false } }),
    ].flat()
    for (const c of all) expect(c.text).not.toMatch(words)
  })

  it("puts numbers from the plan in the words", () => {
    expect(rexComments({ ...planned, slInitial: 1.1688 })[0].text).toContain("SL hanya 12.0 pip dari entry")
    expect(rexComments({ ...planned, slInitial: 1.1688 })[0].text).toContain("(20.0 pip)")
    expect(rexComments({ ...planned, riskPct: 4.5, checks: { ...pass, riskWithinLimit: false } })[0].text).toContain("Risiko 4.5% saldo")
  })

  it("praise names the reward only when its check passed, and asks for TP when it didn't", () => {
    expect(rexComments(planned)[0].text).toContain("target 1.5× risiko")
    const noTp = rexComments({ ...planned, rewardRisk: null, checks: { ...pass, rewardRisk: false } })[0]
    expect(noTp.tone).toBe("good")
    expect(noTp.text).not.toContain("target")
    expect(noTp.text).toContain("pasang TP")
    const low = rexComments({ ...planned, rewardRisk: 1.2, checks: { ...pass, rewardRisk: false } })[0]
    expect(low.text).toContain("target baru 1.2× risiko")
  })

  it("JPY pairs measure pips in hundredths", () => {
    const yen = rexComments({ ...planned, pair: "USDJPY", entry: 110, slInitial: 109.9, rangeAvg: 0.25 })
    expect(yen[0].text).toContain("SL hanya 10.0 pip")
  })
})

describe("listId", () => {
  it.each([
    [["a"], "a"],
    [["a", "b"], "a dan b"],
    [["a", "b", "c"], "a, b, dan c"],
  ])("%j", (items, text) => {
    expect(listId(items)).toBe(text)
  })
})

describe("reviewAdvice", () => {
  it("names the check failed most often", () => {
    expect(reviewAdvice("riskWithinLimit")).toMatch(/^Risiko maksimal 2% saldo paling sering tidak lolos\. Mulai dari risiko/)
  })
  it("says the plan held when nothing failed", () => {
    expect(reviewAdvice(null)).toContain("sudah mengikuti aturan Disiplin")
  })
})
