import { DISIPLIN, STAGES, type StageNumber } from "@/lib/demo/config"
import { rollingDisiplin, type Checks } from "@/lib/demo/disiplin"
import { figuresAt, openPnl, type ExitReason } from "@/lib/demo/fills"
import { accountFigures, bustLine, roundMoney, type AccountFigures, type Side } from "@/lib/demo/money"
import { levelPips } from "@/lib/demo/orders"
import { commentsFor } from "@/lib/demo/journal"
import type { RexComment } from "@/lib/demo/rex-comments"
import { progressLabel, stageProgress, type StageProgress } from "@/lib/demo/stages"
import { accountBust, toOpenTrade, type ReviewAnswer, type TradeRow, type TradingState } from "@/lib/demo/state"
import type { TipId } from "@/lib/demo/tips"
import type { ReasonId } from "@/lib/reasons"

// What the browser receives: the trading screen's whole state, built on the
// server from the player's rows. Candles stop at the cursor (non-negotiable
// #1); nothing here says what price does next. Pure; client code imports the
// types only.

export type ViewCandle = { t: number; o: number; h: number; l: number; c: number }

export type TradeView = {
  id: string
  number: number
  side: Side
  lot: number
  reasons: ReasonId[]
  entry: number
  entryIndex: number
  sl: number | null
  tp: number | null
  /** Current SL and TP as pips from entry (SL on the losing side). */
  slPips: number | null
  tpPips: number | null
  slInitial: number | null
  tpInitial: number | null
  margin: number
  costs: number
  swap: number
  revenge: boolean
  /** What the order panel said SL would cost (costs included); null without SL. */
  plannedLoss: number | null
  riskPct: number | null
  rewardRisk: number | null
  status: "open" | "closed"
  /** Open: P/L at the current price, costs and swap included. Closed: net + swap. */
  pnl: number
  exit: { price: number; index: number; reason: ExitReason; pips: number; net: number } | null
  disiplin: { checks: Checks; score: number; xp: number; counted: boolean } | null
  review: { answer: ReviewAnswer; note: string | null } | null
  /** The journal note (also written with the review); never scored. */
  note: string | null
  /** Rex's comments once closed (lib/demo/rex-comments.ts). */
  rex: RexComment[] | null
}

export type DemoEvent =
  | { kind: "opened"; number: number; revenge: boolean; noTp: boolean; riskAbove: boolean }
  | { kind: "closed"; number: number; reason: ExitReason }
  | { kind: "stop_out"; price: number }
  | { kind: "segment_end" }
  | { kind: "stage_up"; stage: StageNumber }
  | { kind: "graduated" }
  | { kind: "xp"; amount: number }

export type DemoView = {
  account: {
    number: number
    startingBalance: number
    figures: AccountFigures
    /** "Akun habis" (lib/demo/state.ts accountBust): trading has stopped. */
    bust: boolean
    /** The stage's fixed "akun habis" line (config AKUN_HABIS). */
    bustLine: number
  }
  /**
   * The player's Disiplin: the rolling average of their last counted trades
   * on every account, so a reset or a new account never wipes the record.
   * null before the first.
   */
  disiplin: number | null
  stage: {
    current: StageNumber
    pairs: string[]
    fixedLot: number | null
    maxOpenTrades: number
    slTpRequired: boolean
    progress: StageProgress
    label: string
  }
  session: {
    id: string
    pair: string
    digits: number
    timeframe: string
    period: string
    /** Up to and including the current candle. Never beyond. */
    candles: ViewCandle[]
    /** Candles left to play. */
    remaining: number
    ended: boolean
  } | null
  open: TradeView[]
  /** This session's closed trades, newest first. */
  closed: TradeView[]
  /**
   * A loss inside the revenge window: a bigger lot than `lot` now would be a
   * revenge trade. For the order panel's warning.
   */
  lossWindow: { lot: number; candlesAgo: number } | null
  lines: number[]
  tipsSeen: TipId[]
  /**
   * The first trade is guided step by step: true until the player's first
   * trade (on any account) has closed and been reviewed.
   */
  guide: boolean
  /** The player has graduated (lib/demo/stages.ts graduationReached, recorded once). */
  graduated: boolean
  events: DemoEvent[]
}

function tradeView(t: TradeRow, price: number | null): TradeView {
  const pips = (kind: "sl" | "tp", level: number | null) =>
    level === null ? null : levelPips(t.pair, t.side, t.entryPrice, kind, level)
  const closed = t.status === "closed" && t.exitPrice !== null && t.exitReason !== null
  return {
    id: t.id,
    number: t.number,
    side: t.side,
    lot: t.lot,
    reasons: t.reasons,
    entry: t.entryPrice,
    entryIndex: t.entryIndex,
    sl: t.sl,
    tp: t.tp,
    slPips: pips("sl", t.sl),
    tpPips: pips("tp", t.tp),
    slInitial: t.slInitial,
    tpInitial: t.tpInitial,
    margin: t.margin,
    costs: roundMoney(t.spread + t.commission),
    swap: t.swap,
    revenge: t.revenge,
    plannedLoss: t.riskAmount,
    riskPct: t.riskPct,
    rewardRisk: t.rewardRisk,
    status: t.status,
    pnl: closed ? roundMoney((t.net ?? 0) + t.swap) : price === null ? 0 : openPnl(toOpenTrade(t), price),
    exit: closed
      ? { price: t.exitPrice!, index: t.exitIndex ?? t.entryIndex, reason: t.exitReason!, pips: t.pips ?? 0, net: t.net ?? 0 }
      : null,
    disiplin:
      closed && t.checks && t.disiplin !== null
        ? { checks: t.checks, score: t.disiplin, xp: t.xp, counted: Boolean(t.counted) }
        : null,
    review: t.review ? { answer: t.review, note: t.reviewNote } : null,
    note: t.reviewNote,
    rex: closed ? commentsFor(t) : null,
  }
}

function guided(state: TradingState) {
  const total = state.history.length + state.open.length
  if (total === 0) return true
  if (total > 1) return false
  return state.open.length === 1 || (state.sessionClosed.length === 1 && state.sessionClosed[0].review === null)
}

export function buildView(state: TradingState, events: DemoEvent[] = []): DemoView {
  const { account, session, segment } = state
  const current = session ? state.segmentCandles[session.cursor] : undefined
  const price = current ? current.c : null
  const open = state.open.map(toOpenTrade)
  const figures = price === null ? accountFigures(account.balance, []) : figuresAt(account.balance, open, price)

  const mine = state.history.filter((h) => h.accountId === account.id)
  const scored = state.history.filter((h) => h.counted).map((h) => ({ stage: h.stage, score: h.disiplin }))
  const progress = stageProgress(state.stage, scored)
  const stageCfg = STAGES[state.stage]

  const windowLosses = mine.filter(
    (h) =>
      h.net + h.swap < 0 &&
      account.candlesPlayed >= h.closedClock &&
      account.candlesPlayed - h.closedClock <= DISIPLIN.REVENGE_WINDOW_CANDLES,
  )

  return {
    account: {
      number: account.number,
      startingBalance: account.startingBalance,
      figures,
      bust: accountBust(state),
      bustLine: bustLine(state.stage),
    },
    disiplin: rollingDisiplin(scored.map((t) => t.score)),
    stage: {
      current: state.stage,
      pairs: [...stageCfg.pairs],
      fixedLot: stageCfg.fixedLot,
      maxOpenTrades: stageCfg.maxOpenTrades,
      slTpRequired: stageCfg.slTpRequired,
      progress,
      label: progressLabel(progress),
    },
    session:
      session && segment && current
        ? {
            id: session.id,
            pair: segment.pair,
            digits: segment.digits,
            timeframe: segment.timeframe,
            period: segment.period,
            candles: state.segmentCandles.slice(0, session.cursor + 1).map(({ t, o, h, l, c }) => ({ t, o, h, l, c })),
            remaining: session.lastIndex - session.cursor,
            ended: session.status === "ended",
          }
        : null,
    open: state.open.map((t) => tradeView(t, price)),
    closed: [...state.sessionClosed].reverse().map((t) => tradeView(t, price)),
    lossWindow:
      windowLosses.length === 0
        ? null
        : {
            lot: Math.min(...windowLosses.map((h) => h.lot)),
            candlesAgo: account.candlesPlayed - Math.max(...windowLosses.map((h) => h.closedClock)),
          },
    lines: state.lines,
    tipsSeen: state.tipsSeen,
    guide: guided(state),
    graduated: state.graduated,
    events,
  }
}
