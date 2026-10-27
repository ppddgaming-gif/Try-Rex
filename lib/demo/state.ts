import type { StageNumber } from "@/lib/demo/config"
import type { Checks, SlChange } from "@/lib/demo/disiplin"
import type { Bar, ExitReason, OpenTrade } from "@/lib/demo/fills"
import { isBust, roundMoney, type Side } from "@/lib/demo/money"
import type { TipId } from "@/lib/demo/tips"
import type { ReasonId } from "@/lib/reasons"

// The trading state as the server loads it from the player's own rows
// (lib/demo/trading.ts). The planners (lib/demo/actions.ts) and the view
// (lib/demo/view.ts) work on this shape. Types only, plus one mapping.

export type ReviewAnswer = "ya" | "sebagian" | "tidak"
export const REVIEW_ANSWERS: ReviewAnswer[] = ["ya", "sebagian", "tidak"]

export type AccountRow = {
  id: string
  number: number
  balance: number
  startingBalance: number
  /** Bumped by every write; a write built on an older version is refused. */
  version: number
  /** Candles played on this account, across charts: the revenge-trade clock. */
  candlesPlayed: number
}

export type SessionRow = {
  id: string
  segmentId: string
  pair: string
  /** Index of the last candle shown. */
  cursor: number
  lastIndex: number
  status: "active" | "ended"
}

export type TradeRow = {
  id: string
  number: number
  /** The replay chart it was opened on; null for a live-chart trade. */
  sessionId: string | null
  pair: string
  side: Side
  lot: number
  stage: StageNumber
  reasons: ReasonId[]
  entryPrice: number
  /**
   * Replay: the candle index it opened at. Live chart: real unix seconds of
   * the fill. Clocks: candles played (replay) or real M15 candles (live).
   */
  entryIndex: number
  openedClock: number
  slInitial: number | null
  tpInitial: number | null
  sl: number | null
  tp: number | null
  balanceAtEntry: number
  margin: number
  spread: number
  commission: number
  riskAmount: number | null
  riskPct: number | null
  rewardRisk: number | null
  rangeAvg: number
  revenge: boolean
  swap: number
  status: "open" | "closed"
  exitPrice: number | null
  /** Replay: the candle index it closed at. Live chart: real unix seconds of the candle it closed in. */
  exitIndex: number | null
  closedClock: number | null
  exitReason: ExitReason | null
  pips: number | null
  gross: number | null
  net: number | null
  counted: boolean | null
  checks: Checks | null
  disiplin: number | null
  xp: number
  review: ReviewAnswer | null
  reviewNote: string | null
}

/** A closed trade, reduced to what stages, the account stats and the revenge check need. */
export type ClosedSummary = {
  accountId: string
  stage: StageNumber
  counted: boolean
  disiplin: number
  net: number
  swap: number
  lot: number
  closedClock: number
}

/** `start`: unix seconds of the first candle. */
export type SegmentInfo = { pair: string; digits: number; timeframe: string; start: number }

export type TradingState = {
  account: AccountRow
  stage: StageNumber
  /** The account's active session, or its most recent one once ended. */
  session: SessionRow | null
  segment: SegmentInfo | null
  /** The whole segment. Never sent as is: the view cuts it at the cursor. */
  segmentCandles: Bar[]
  /** Open trades of the account. */
  open: TradeRow[]
  /** Closed trades of the current session, oldest first. */
  sessionClosed: TradeRow[]
  /** Every closed trade of the player, all accounts, oldest first. */
  history: ClosedSummary[]
  /** SL changes of each open trade, oldest first. */
  slChanges: Record<string, SlChange[]>
  lines: number[]
  tipsSeen: TipId[]
  /** The player has graduated (demo_profile.graduated_at is set). */
  graduated: boolean
}

export const toOpenTrade = (t: TradeRow): OpenTrade => ({
  id: t.id,
  pair: t.pair,
  side: t.side,
  lot: t.lot,
  entry: t.entryPrice,
  sl: t.sl,
  tp: t.tp,
  costs: roundMoney(t.spread + t.commission),
  margin: t.margin,
  swap: t.swap,
})

/**
 * "Akun habis": nothing is open and the balance is below the stage's fixed
 * line (config AKUN_HABIS). Trading stops, a new chart included; what's left
 * is Rex's review, the risk lesson and a new account.
 */
export function accountBust(state: TradingState) {
  return state.open.length === 0 && isBust(state.account.balance, state.stage)
}
