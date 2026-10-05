import type { StageNumber } from "@/lib/demo/config"
import type { Checks } from "@/lib/demo/disiplin"
import type { ExitReason } from "@/lib/demo/fills"
import { roundMoney, type Side } from "@/lib/demo/money"
import { rexComments, type RexComment } from "@/lib/demo/rex-comments"
import type { ReviewAnswer, TradeRow } from "@/lib/demo/state"
import type { StatTrade } from "@/lib/demo/stats"
import type { ReasonId } from "@/lib/reasons"

// The Trading Journal: one row per closed trade, written automatically.
// Every field is the trade as the server booked it; the comments come from
// lib/demo/rex-comments. Pure; client components import the types only.

export type JournalRow = {
  id: string
  number: number
  pair: string
  side: Side
  lot: number
  stage: StageNumber
  /** Unix seconds of the entry and exit candles; null if the data no longer has the chart. */
  entryTime: number | null
  exitTime: number | null
  entry: number
  exit: number
  exitReason: ExitReason
  slInitial: number | null
  sl: number | null
  tpInitial: number | null
  tp: number | null
  pips: number
  /** The trade's own result; swap is separate. */
  net: number
  swap: number
  /** What it did to the balance: net + swap. */
  total: number
  riskPct: number | null
  rewardRisk: number | null
  reasons: ReasonId[]
  review: ReviewAnswer | null
  note: string | null
  checks: Checks
  score: number
  xp: number
  counted: boolean
  revenge: boolean
  rex: RexComment[]
}

/** A closed trade as the journal shows it; null for a trade that hasn't closed. */
export function journalRow(t: TradeRow, times: { entry: number | null; exit: number | null }): JournalRow | null {
  if (t.status !== "closed" || t.exitPrice === null || t.exitReason === null || t.checks === null) return null
  const net = t.net ?? 0
  return {
    id: t.id,
    number: t.number,
    pair: t.pair,
    side: t.side,
    lot: t.lot,
    stage: t.stage,
    entryTime: times.entry,
    exitTime: times.exit,
    entry: t.entryPrice,
    exit: t.exitPrice,
    exitReason: t.exitReason,
    slInitial: t.slInitial,
    sl: t.sl,
    tpInitial: t.tpInitial,
    tp: t.tp,
    pips: t.pips ?? 0,
    net,
    swap: t.swap,
    total: roundMoney(net + t.swap),
    riskPct: t.riskPct,
    rewardRisk: t.rewardRisk,
    reasons: t.reasons,
    review: t.review,
    note: t.reviewNote,
    checks: t.checks,
    score: t.disiplin ?? 0,
    xp: t.xp,
    counted: Boolean(t.counted),
    revenge: t.revenge,
    rex: commentsFor(t) ?? [],
  }
}

/** Rex's comments on a trade once its checks exist (at close). */
export function commentsFor(t: TradeRow): RexComment[] | null {
  if (t.checks === null) return null
  return rexComments({
    pair: t.pair,
    side: t.side,
    reasons: t.reasons,
    entry: t.entryPrice,
    slInitial: t.slInitial,
    rangeAvg: t.rangeAvg,
    riskPct: t.riskPct,
    rewardRisk: t.rewardRisk,
    checks: t.checks,
  })
}

/** A closed trade reduced for lib/demo/stats. */
export const statTrade = (t: TradeRow): StatTrade => ({
  number: t.number,
  pair: t.pair,
  side: t.side,
  lot: t.lot,
  net: t.net ?? 0,
  swap: t.swap,
  slInitial: t.slInitial,
  riskPct: t.riskPct,
  rewardRisk: t.rewardRisk,
  checks: t.checks ?? { slAtEntry: false, riskWithinLimit: false, rewardRisk: false, slNotWidened: false, notRevenge: false },
  revenge: t.revenge,
})
