import { describe, expect, it } from "vitest"
import keyFile from "@/assessment/keys/P-01.keys.json"
import { bandPoints, RISK_BANDS, RR_BANDS, scoreBasic, scoreComplex, scoreScenario, SL_ATR_BANDS } from "@/lib/assessment/grade"
import { startRun, stepRun } from "@/lib/assessment/sim"
import type { Decision, McqBasicKey, McqComplexKey, ScenarioKey, ScenarioRun } from "@/lib/assessment/types"

const PIP = 0.0001
const t = { id: "x", en: "x" }
const feedback = { decision: t, risk: t, sl: t, tp: t, management: t }
const tradeKey: ScenarioKey = {
  id: "T",
  type: "scenario",
  kind: "normal",
  event: null,
  decision: { ideal: "buy", entry: "market", acceptable: ["no_trade"], valid_reasons: ["trend", "level", "rr"] },
  numbers: {
    reference_price: 1.1,
    atr14_pips: 20,
    invalidation_level: 1.097,
    pip_value_usd_per_lot: 10,
    lot_at_1pct: 0.16,
    lot_at_2pct: 0.33,
    expected_sl_pips: 30,
    min_tp_pips: 45,
  },
  feedback,
}
const noTradeKey: ScenarioKey = { ...tradeKey, decision: { ideal: "no_trade", entry: null, acceptable: [], valid_reasons: ["news", "extreme_vol"] } }

// $5,000, SL 30 pips = 1.5 ATR beyond the invalidation, TP 60 pips (1 : 2), 0.16 lot = 0.96%… use 0.17 for 1.02%.
const good: Decision = { action: "buy", entry: "market", lot: 0.17, sl: 1.097, tp: 1.106, reasons: ["trend", "level"] }
const ran = (d: Decision): ScenarioRun => stepRun(startRun(d, 1.1), { t: 0, o: 1.1, h: 1.1, l: 1.096, c: 1.096 }, 1.1, false)

describe("bandPoints edges", () => {
  it.each([
    [RISK_BANDS, 0.49, 20],
    [RISK_BANDS, 1, 25],
    [RISK_BANDS, 2, 25],
    [RISK_BANDS, 2.01, 18],
    [RISK_BANDS, 10, 4],
    [RISK_BANDS, 10.5, 0],
    [SL_ATR_BANDS, 0.74, 3],
    [SL_ATR_BANDS, 1, 10],
    [SL_ATR_BANDS, 3, 10],
    [SL_ATR_BANDS, 3.5, 7],
    [SL_ATR_BANDS, 5, 4],
    [RR_BANDS, 1.5, 15],
    [RR_BANDS, 1.4999, 15],
    [RR_BANDS, 1.3, 10],
    [RR_BANDS, 0.4, 0],
  ])("%#: %d → %d", (bands, value, points) => {
    expect(bandPoints(bands, value)).toBe(points)
  })
})

describe("scoreScenario", () => {
  it("gives full marks to a sound plan, even though it hit the SL", () => {
    const s = scoreScenario(tradeKey, ran(good), 5000, PIP)
    expect(s.mode).toBe("trade")
    expect(s.measures).toMatchObject({ slPips: 30, slAtr: 1.5, rr: 2, riskPct: 1.02 })
    expect(s.total).toBe(100)
  })

  it("never rewards the outcome: the same plan scores the same whichever way price went", () => {
    const win = stepRun(startRun(good, 1.1), { t: 0, o: 1.1, h: 1.107, l: 1.0995, c: 1.106 }, 1.1, false)
    expect(win.x?.why).toBe("tp")
    expect(scoreScenario(tradeKey, win, 5000, PIP).total).toBe(scoreScenario(tradeKey, ran(good), 5000, PIP).total)
  })

  it("scores risk, SL and TP from the plan", () => {
    const d: Decision = { ...good, lot: 1, sl: 1.0995, tp: 1.1004, reasons: ["trend", "news"] }
    const s = scoreScenario(tradeKey, stepRun(startRun(d, 1.1), { t: 0, o: 1.1, h: 1.1001, l: 1.0999, c: 1.1 }, 1.1, true), 5000, PIP)
    // 5 pips × $10 × 1 lot = $50 = 1% → 25; SL 0.25 ATR → 3 + 12.5; RR 0.8 → 3; side and entry ideal 14 + half the reasons 3.
    expect(s.aspects).toMatchObject({ risk: { points: 25 }, sl: { points: 15.5 }, tp: { points: 3 }, decision: { points: 17 }, management: { points: 15 } })
  })

  it("adds the structure bonus only beyond the invalidation level", () => {
    const inside: Decision = { ...good, sl: 1.0975, tp: 1.105 }
    // 25 pips × $10 × 0.17 = 0.85% → 23 risk points, half of them here; 1.25 ATR → 10; no bonus.
    expect(scoreScenario(tradeKey, ran(inside), 5000, PIP).aspects.sl?.points).toBe(11.5 + 10)
    expect(scoreScenario(tradeKey, ran(good), 5000, PIP).aspects.sl?.points).toBe(25)
  })

  it.each([
    ["structure_broken", 15],
    ["target_area", 15],
    ["small_profit", 7],
    ["fear", 5],
  ])("manual close for %s → %d management points", (reason, points) => {
    const r: ScenarioRun = { ...startRun(good, 1.1), n: 3, x: { i: 2, p: 1.1, why: "manual", cr: reason }, end: true }
    expect(scoreScenario(tradeKey, r, 5000, PIP).aspects.management?.points).toBe(points)
  })

  it("scores the decision alone ×5 for an acceptable no trade and for an unfilled pending order", () => {
    const nt = scoreScenario(tradeKey, startRun({ action: "no_trade", reasons: ["trend", "news"] }, 1.1), 5000, PIP)
    expect(nt).toMatchObject({ mode: "decision_only", total: (8 + 3) * 5 })
    const pending: ScenarioRun = { ...startRun({ ...good, entry: "pending", price: 1.099, sl: 1.097, tp: 1.103 }, 1.1), n: 5, end: true }
    expect(scoreScenario(tradeKey, pending, 5000, PIP)).toMatchObject({ mode: "decision_only", total: (11 + 6) * 5 })
  })

  it("on a no-trade scenario, a trade gets only its reasons", () => {
    expect(scoreScenario(noTradeKey, startRun({ action: "no_trade", reasons: ["news", "extreme_vol"] }, 1.1), 5000, PIP).total).toBe(100)
    expect(scoreScenario(noTradeKey, startRun({ action: "no_trade", reasons: ["news", "trend"] }, 1.1), 5000, PIP).total).toBe(85)
    expect(scoreScenario(noTradeKey, ran(good), 5000, PIP).total).toBe(0)
  })
})

describe("multiple choice", () => {
  const complex: McqComplexKey = { id: "C", type: "mcq_complex", level: 3, source: "x", correct: ["a", "b", "d"], explanations: {} }
  it.each([
    [["a", "b", "d"], 1],
    [["a", "b"], 0.67],
    [["a", "b", "c"], 0.33],
    [["c", "e"], 0],
    [[], 0],
  ])("complex %j → %d", (chosen, score) => {
    expect(scoreComplex(complex, chosen)).toBe(score)
  })
  const basic: McqBasicKey = { id: "B", type: "mcq_basic", level: 1, source: "x", correct: "b", explanation: t }
  it("basic is right or wrong", () => {
    expect(scoreBasic(basic, ["b"])).toBe(1)
    expect(scoreBasic(basic, ["a"])).toBe(0)
    expect(scoreBasic(basic, ["a", "b"])).toBe(0)
  })
})

describe("rubric in code matches the key files", () => {
  const r = keyFile.rubric.scenario_trade
  it("has the same bands and points", () => {
    expect(RISK_BANDS.map((b) => [b.from, b.to, b.points])).toEqual(r.risk.bands.map((b) => [b.from, b.to, b.points]))
    expect(SL_ATR_BANDS.map((b) => [b.from, b.to, b.points])).toEqual(r.sl.volatility_part.bands.map((b) => [b.from, b.to, b.points]))
    const rr = [...r.tp.bands].sort((a, b) => a.from - b.from)
    expect(RR_BANDS.map((b) => [b.from, b.to, b.points])).toEqual(rr.map((b) => [b.from, b.to, b.points]))
  })
})
