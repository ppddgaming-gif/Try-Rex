import { COUNTING, DISIPLIN, XP } from "@/lib/demo/config"
import type { Side } from "@/lib/demo/money"
import type { T } from "@/lib/i18n/translator"

// The Disiplin score: five checks on every closed trade, all about the plan
// and none about the outcome (non-negotiable #3). Pure; the server scores
// each trade with these when it closes.

export const CHECK_IDS = ["slAtEntry", "riskWithinLimit", "rewardRisk", "slNotWidened", "notRevenge"] as const
export type CheckId = (typeof CHECK_IDS)[number]
export type Checks = Record<CheckId, boolean>

/** A check's name in words (demo.checks.*), with the limits from config. `t` is the root translator. */
export const checkLabel = (id: CheckId, t: T) =>
  t(`demo.checks.${id}`, { max: DISIPLIN.MAX_RISK_PCT, min: DISIPLIN.MIN_REWARD_RISK })

/** One SL change, in order. null = no SL. */
export type SlChange = { from: number | null; to: number | null }

/**
 * True if SL was ever moved further from entry, or removed. Closer, to
 * break-even or past entry into profit is fine; adding a missing SL is fine.
 */
export function slWidened(side: Side, changes: SlChange[]) {
  return changes.some(
    ({ from, to }) => from !== null && (to === null || (side === "buy" ? to < from : to > from)),
  )
}

export type LosingTrade = { lot: number; closedClock: number; result: number }

/**
 * A revenge trade: opened within REVENGE_WINDOW_CANDLES of a losing trade's
 * close, with a bigger lot than that trade. Clocks count candles played on
 * the account, so switching charts doesn't reset the window. The live chart
 * passes its own window, in M15 candles.
 */
export function isRevenge(lot: number, openedClock: number, closed: LosingTrade[], window: number = DISIPLIN.REVENGE_WINDOW_CANDLES) {
  return closed.some(
    (t) =>
      t.result < 0 &&
      openedClock >= t.closedClock &&
      openedClock - t.closedClock <= window &&
      lot > t.lot + 1e-9,
  )
}

export type DisiplinInput = {
  side: Side
  /** SL when the order was placed. */
  slAtEntry: number | null
  /** Loss at SL as % of balance at entry; null without SL. */
  riskPct: number | null
  /** TP distance ÷ SL distance at entry; null unless both were set. */
  rewardRisk: number | null
  slChanges: SlChange[]
  revenge: boolean
}

export function disiplinChecks(i: DisiplinInput): Checks {
  return {
    slAtEntry: i.slAtEntry !== null,
    riskWithinLimit: i.riskPct !== null && i.riskPct <= DISIPLIN.MAX_RISK_PCT,
    rewardRisk: i.rewardRisk !== null && i.rewardRisk >= DISIPLIN.MIN_REWARD_RISK - 1e-9,
    slNotWidened: !slWidened(i.side, i.slChanges),
    notRevenge: !i.revenge,
  }
}

/** Checks passed ÷ checks, as a whole percent. */
export function disiplinScore(checks: Checks) {
  const passed = CHECK_IDS.filter((id) => checks[id]).length
  return Math.round((passed / CHECK_IDS.length) * 100)
}

/** Held at least MIN_CANDLES_HELD candles: only these earn XP and count toward stages. */
export const isCounted = (openedClock: number, closedClock: number) =>
  closedClock - openedClock >= COUNTING.MIN_CANDLES_HELD

/** XP from the Disiplin score alone; profit never adds any. */
export const tradeXp = (score: number, counted: boolean) => (counted ? Math.round((XP.PER_TRADE * score) / 100) : 0)

/** Average of the last ROLLING_TRADES scores, a whole percent; null with none. */
export function rollingDisiplin(scores: number[], n: number = DISIPLIN.ROLLING_TRADES) {
  const recent = scores.slice(-n)
  if (recent.length === 0) return null
  return Math.round(recent.reduce((s, v) => s + v, 0) / recent.length)
}
