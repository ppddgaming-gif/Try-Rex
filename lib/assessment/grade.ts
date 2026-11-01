import { entryOf, pipsBetween } from "@/lib/assessment/sim"
import type { Decision, McqBasicKey, McqComplexKey, ScenarioKey, ScenarioRun } from "@/lib/assessment/types"

// The assessment rubric (assessment/src/common.mjs RUBRIC, which the key files
// carry) as code. Pure and deterministic. The score reads the decision, the
// levels and how the position was closed; it never reads the profit or loss
// or where price went (non-negotiable #3).

/** A band of a measure: `from` ≤ value < `to`, or ≤ `to` when `toIncl`. */
type Band = { from: number; to: number | null; points: number; toIncl?: boolean; fromExcl?: boolean }

// Edges near the ideal belong to the better band: exactly 1% and 2% risk are
// ideal, exactly 1× and 3× ATR are in range, exactly 1 : 1.5 meets the minimum.
export const RISK_BANDS: Band[] = [
  { from: 0, to: 0.5, points: 20 },
  { from: 0.5, to: 1, points: 23 },
  { from: 1, to: 2, points: 25, toIncl: true },
  { from: 2, to: 3, points: 18, fromExcl: true, toIncl: true },
  { from: 3, to: 5, points: 10, fromExcl: true, toIncl: true },
  { from: 5, to: 10, points: 4, fromExcl: true, toIncl: true },
  { from: 10, to: null, points: 0, fromExcl: true },
]
export const SL_ATR_BANDS: Band[] = [
  { from: 0, to: 0.75, points: 3 },
  { from: 0.75, to: 1, points: 7 },
  { from: 1, to: 3, points: 10, toIncl: true },
  { from: 3, to: 4, points: 7, fromExcl: true, toIncl: true },
  { from: 4, to: null, points: 4, fromExcl: true },
]
export const RR_BANDS: Band[] = [
  { from: 0, to: 0.5, points: 0 },
  { from: 0.5, to: 1, points: 3 },
  { from: 1, to: 1.2, points: 7 },
  { from: 1.2, to: 1.5, points: 10 },
  { from: 1.5, to: null, points: 15 },
]
export const SL_STRUCTURE_BONUS = 2.5
export const MAX = { risk: 25, sl: 25, tp: 15, decision: 20, management: 15, noTradeDecision: 70, noTradeReasons: 30 }
export const CHOICE = { idealEntry: 14, idealSide: 11, acceptable: 8, wrong: 0, reasons: 6 }
export const MANAGEMENT: Record<string, number> = { structure_broken: 15, news_ahead: 15, target_area: 15, small_profit: 7, bored: 7, fear: 5 }
/** A decision scored alone (no trade on a trade scenario, a pending order that never filled): ×5 to 100. */
export const DECISION_ONLY_FACTOR = 5

const round2 = (v: number) => Math.round(v * 100) / 100

export function bandPoints(bands: Band[], value: number) {
  const v = round2(value)
  for (const b of bands) {
    const aboveFrom = b.fromExcl ? v > b.from : v >= b.from
    const belowTo = b.to === null || (b.toIncl ? v <= b.to : v < b.to)
    if (aboveFrom && belowTo) return b.points
  }
  return 0
}

export type Aspect = "risk" | "sl" | "tp" | "decision" | "management"
export type AspectScore = { points: number; max: number }

export type ScenarioScore = {
  total: number
  /** How the scenario was scored: a trade, a no-trade scenario, or the decision alone. */
  mode: "trade" | "no_trade" | "decision_only"
  aspects: Partial<Record<Aspect, AspectScore>>
  measures: { riskPct: number | null; slPips: number | null; slAtr: number | null; rr: number | null; validReasons: number; reasons: number }
}

const validShare = (d: Decision, valid: string[]) => {
  const chosen = d.reasons.length
  return { valid: d.reasons.filter((r) => valid.includes(r)).length, chosen }
}

export function scoreScenario(key: ScenarioKey, run: ScenarioRun, balance: number, pipSize: number): ScenarioScore {
  const d = run.d
  const { valid, chosen } = validShare(d, key.decision.valid_reasons)
  const share = chosen ? valid / chosen : 0
  const none = { riskPct: null, slPips: null, slAtr: null, rr: null, validReasons: valid, reasons: chosen }

  if (key.decision.ideal === "no_trade") {
    const decision = d.action === "no_trade" ? MAX.noTradeDecision : 0
    const reasons = round2(MAX.noTradeReasons * share)
    return {
      total: round2(decision + reasons),
      mode: "no_trade",
      aspects: { decision: { points: round2(decision + reasons), max: MAX.noTradeDecision + MAX.noTradeReasons } },
      measures: none,
    }
  }

  const choice =
    d.action === key.decision.ideal
      ? d.entry === key.decision.entry
        ? CHOICE.idealEntry
        : CHOICE.idealSide
      : key.decision.acceptable.includes(d.action)
        ? CHOICE.acceptable
        : CHOICE.wrong
  const decision = round2(choice + CHOICE.reasons * share)

  if (d.action === "no_trade" || !run.f) {
    return {
      total: round2(decision * DECISION_ONLY_FACTOR),
      mode: "decision_only",
      aspects: { decision: { points: decision, max: MAX.decision } },
      measures: none,
    }
  }

  const n = key.numbers
  const entry = entryOf(d, n.reference_price)
  const sl = d.sl as number
  const tp = d.tp as number
  const slPips = round2(pipsBetween(entry, sl, pipSize))
  const riskPct = round2(((slPips * n.pip_value_usd_per_lot * (d.lot as number)) / balance) * 100)
  const slAtr = round2(slPips / n.atr14_pips)
  const rr = round2(pipsBetween(tp, entry, pipSize) / slPips)

  const risk = bandPoints(RISK_BANDS, riskPct)
  const atrPoints = bandPoints(SL_ATR_BANDS, slAtr)
  const inRange = atrPoints === 10
  const inv = n.invalidation_level
  const beyond = inv === null || (d.action === "buy" ? sl <= inv : sl >= inv)
  const slScore = round2(risk * 0.5 + atrPoints + (inRange && beyond ? SL_STRUCTURE_BONUS : 0))
  const tpScore = bandPoints(RR_BANDS, rr)
  const management = run.x?.why === "manual" ? (MANAGEMENT[run.x.cr ?? ""] ?? 0) : MAX.management

  return {
    total: round2(risk + slScore + tpScore + decision + management),
    mode: "trade",
    aspects: {
      risk: { points: risk, max: MAX.risk },
      sl: { points: slScore, max: MAX.sl },
      tp: { points: tpScore, max: MAX.tp },
      decision: { points: decision, max: MAX.decision },
      management: { points: management, max: MAX.management },
    },
    measures: { riskPct, slPips, slAtr, rr, validReasons: valid, reasons: chosen },
  }
}

/** 0–1: +1/k per right option chosen, −1/k per wrong one, floor 0. */
export function scoreComplex(key: McqComplexKey, chosen: string[]) {
  const k = key.correct.length
  const set = new Set(chosen)
  let s = 0
  for (const c of set) s += key.correct.includes(c) ? 1 / k : -1 / k
  return Math.max(0, Math.min(1, round2(s)))
}

export const scoreBasic = (key: McqBasicKey, chosen: string[]) => (chosen.length === 1 && chosen[0] === key.correct ? 1 : 0)
