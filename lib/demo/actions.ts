import { DISIPLIN, PLAN, STAGES, type StageNumber } from "@/lib/demo/config"
import { disiplinChecks, disiplinScore, isCounted, isRevenge, tradeXp, type Checks } from "@/lib/demo/disiplin"
import { closeAt, figuresAt, stepBar, type Closure, type ExitReason, type OpenTrade } from "@/lib/demo/fills"
import { instrument } from "@/lib/demo/instruments"
import { roundMoney } from "@/lib/demo/money"
import { levelPrice, orderProblems, quoteOrder, type OrderInput } from "@/lib/demo/orders"
import { pickSegment, type Segment } from "@/lib/demo/segments"
import { graduationReached, stageAfter } from "@/lib/demo/stages"
import { accountBust, toOpenTrade, type TradingState } from "@/lib/demo/state"
import type { DemoEvent } from "@/lib/demo/view"
import { msg, type Msg } from "@/lib/i18n/translator"
import type { ReasonId } from "@/lib/reasons"

// What each player action does to the account, worked out from the loaded
// state before anything is written. Pure: the route handlers load the state,
// call one of these, and hand the result to a database function that writes
// it in one transaction (lib/demo/trading.ts). Refusals come back as
// { error } holding a demo-catalogue message (errors.*, problems.*), put into
// words by the route in the player's language.

export type Refusal = { error: Msg }

export type TradeClose = {
  id: string
  exit_price: number
  exit_index: number
  closed_clock: number
  exit_reason: ExitReason
  pips: number
  gross: number
  net: number
  counted: boolean
  checks: Checks
  disiplin: number
  xp: number
}

/** Per trade touched by a candle or a close: its swap, and its exit if it closed. */
export type TradeUpdate = { id: string; swap: number; close: TradeClose | null }

export type LedgerEntry = {
  kind: "trade" | "swap" | "commission" | "adjustment"
  label: string
  amount: number
  balance_after: number
  trade_id: string
}

export type SettlePlan = {
  advance: boolean
  updates: TradeUpdate[]
  ledger: LedgerEntry[]
  balance: number
  endSession: boolean
  stage: StageNumber
  /** Graduation reached with this settle, for the first time: the server records it. */
  graduated: boolean
  events: DemoEvent[]
}

const sideLabel = (side: string) => side.toUpperCase()

/** Book `closures` (and the swap of trades still open) against the state. */
function settle(
  state: TradingState,
  closures: Closure[],
  stillOpen: OpenTrade[],
  at: { advance: boolean; clock: number; index: number; endSession: boolean; stopOut: { price: number } | null },
): SettlePlan {
  const rows = new Map(state.open.map((t) => [t.id, t]))
  const updates: TradeUpdate[] = []
  const ledger: LedgerEntry[] = []
  const events: DemoEvent[] = []
  let balance = state.account.balance
  let xp = 0
  const scored = state.history.filter((h) => h.counted).map((h) => ({ stage: h.stage, score: h.disiplin }))

  for (const c of closures) {
    const row = rows.get(c.id)
    if (!row) throw new Error(`Unknown trade ${c.id}`)
    const checks = disiplinChecks({
      side: row.side,
      slAtEntry: row.slInitial,
      riskPct: row.riskPct,
      rewardRisk: row.rewardRisk,
      slChanges: state.slChanges[row.id] ?? [],
      revenge: row.revenge,
    })
    const score = disiplinScore(checks)
    const counted = isCounted(row.openedClock, at.clock)
    const earned = tradeXp(score, counted)
    xp += earned
    if (counted) scored.push({ stage: row.stage, score })

    updates.push({
      id: row.id,
      swap: c.swap,
      close: {
        id: row.id,
        exit_price: c.price,
        exit_index: at.index,
        closed_clock: at.clock,
        exit_reason: c.reason,
        pips: c.pips,
        gross: c.gross,
        net: c.net,
        counted,
        checks,
        disiplin: score,
        xp: earned,
      },
    })

    // The trade's result before commission, then commission and swap as
    // their own rows, so each cost is visible in "Riwayat saldo". The labels
    // are stored as written here (Indonesian); the dashboard rebuilds them in
    // the reader's language from the kind and the trade number
    // (lib/demo/format.ts ledgerLabel), so keep the "#n" in them.
    const label = `Trade #${row.number} · ${sideLabel(row.side)} ${row.pair}`
    const beforeCommission = roundMoney(c.gross - row.spread)
    balance = roundMoney(balance + beforeCommission)
    ledger.push({ kind: "trade", label, amount: beforeCommission, balance_after: balance, trade_id: row.id })
    if (row.commission > 0) {
      balance = roundMoney(balance - row.commission)
      ledger.push({ kind: "commission", label: `Komisi trade #${row.number}`, amount: -row.commission, balance_after: balance, trade_id: row.id })
    }
    if (c.swap !== 0) {
      balance = roundMoney(balance + c.swap)
      ledger.push({ kind: "swap", label: `Swap trade #${row.number}`, amount: c.swap, balance_after: balance, trade_id: row.id })
    }
    events.push({ kind: "closed", number: row.number, reason: c.reason })
  }

  // Negative balance protection: a gap can lose more than the account holds.
  if (balance < 0 && closures.length > 0) {
    ledger.push({
      kind: "adjustment",
      label: "Perlindungan saldo negatif",
      amount: roundMoney(-balance),
      balance_after: 0,
      trade_id: closures[closures.length - 1].id,
    })
    balance = 0
  }

  for (const t of stillOpen) {
    if (t.swap !== rows.get(t.id)?.swap) updates.push({ id: t.id, swap: t.swap, close: null })
  }

  if (at.stopOut) events.unshift({ kind: "stop_out", price: at.stopOut.price })
  if (at.endSession) events.push({ kind: "segment_end" })
  const stage = stageAfter(state.stage, scored)
  if (stage > state.stage) events.push({ kind: "stage_up", stage })
  const graduated = !state.graduated && graduationReached(state.stage, scored)
  if (graduated) events.push({ kind: "graduated" })
  if (xp > 0) events.push({ kind: "xp", amount: xp })

  return { advance: at.advance, updates, ledger, balance, endSession: at.endSession, stage, graduated, events }
}

/** Refusal once the account is "habis": no candle, order or new chart. */
export const BUST_REFUSAL: Refusal = { error: msg("errors.bust") }

function activeSession(state: TradingState): Refusal | { cursor: number; lastIndex: number } {
  const s = state.session
  if (!s || s.status !== "active") return { error: msg("errors.startChart") }
  if (!state.segmentCandles[s.cursor]) return { error: msg("errors.chartGone") }
  return { cursor: s.cursor, lastIndex: s.lastIndex }
}

/** Next candle (also WAIT): fills, swap, stop out, and the end of the segment. */
export function planStep(state: TradingState): SettlePlan | Refusal {
  if (accountBust(state)) return BUST_REFUSAL
  const s = activeSession(state)
  if ("error" in s) return s
  if (s.cursor >= s.lastIndex) return { error: msg("errors.segmentOver") }
  const next = s.cursor + 1
  const last = next === s.lastIndex
  const result = stepBar({
    balance: state.account.balance,
    trades: state.open.map(toOpenTrade),
    prev: state.segmentCandles[s.cursor],
    bar: state.segmentCandles[next],
    last,
  })
  const plan = settle(state, result.closures, result.open, {
    advance: true,
    clock: state.account.candlesPlayed + 1,
    index: next,
    endSession: last,
    stopOut: result.stopOut,
  })
  if (plan.balance !== result.balance) throw new Error("Ledger and fills disagree")
  return plan
}

/** Manual close at the current candle's close. */
export function planClose(state: TradingState, tradeId: string): SettlePlan | Refusal {
  const s = activeSession(state)
  if ("error" in s) return s
  const row = state.open.find((t) => t.id === tradeId)
  if (!row) return { error: msg("errors.tradeClosed") }
  const closure = closeAt(toOpenTrade(row), state.segmentCandles[s.cursor].c, "manual")
  const others = state.open.filter((t) => t.id !== tradeId).map(toOpenTrade)
  return settle(state, [closure], others, {
    advance: false,
    clock: state.account.candlesPlayed,
    index: s.cursor,
    endSession: false,
    stopOut: null,
  })
}

/** What the database stores for a new trade; the session, number and clocks come from the database itself. */
export type NewTrade = {
  session_id: string
  side: "buy" | "sell"
  lot: number
  stage: StageNumber
  reasons: ReasonId[]
  entry_price: number
  sl: number | null
  tp: number | null
  balance_at_entry: number
  margin: number
  spread: number
  commission: number
  risk_amount: number | null
  risk_pct: number | null
  reward_risk: number | null
  range_avg: number
  revenge: boolean
}

/** Average candle range (high − low) of the last candles seen: Rex's "SL too close" yardstick. */
export function averageRange(candles: { h: number; l: number }[], n: number = DISIPLIN.SL_CLOSE_RANGE_CANDLES) {
  const recent = candles.slice(-n)
  if (recent.length === 0) return 0
  return recent.reduce((s, c) => s + (c.h - c.l), 0) / recent.length
}

/** A market order at the current candle's close, after every rule in lib/demo/orders. */
export function planOrder(state: TradingState, input: OrderInput): { trade: NewTrade; events: DemoEvent[] } | Refusal {
  if (accountBust(state)) return BUST_REFUSAL
  const s = activeSession(state)
  if ("error" in s) return s
  const session = state.session!
  const entry = state.segmentCandles[s.cursor].c
  const figures = figuresAt(state.account.balance, state.open.map(toOpenTrade), entry)
  const quote = quoteOrder({
    pair: session.pair,
    side: input.side,
    lot: input.lot,
    entry,
    slPips: input.slPips,
    tpPips: input.tpPips,
    balance: state.account.balance,
    freeMargin: figures.freeMargin,
  })
  const problems = orderProblems(
    input,
    { pair: session.pair, stage: state.stage, openTrades: state.open.length, candlesLeft: s.lastIndex - s.cursor },
    quote,
  )
  if (problems.length > 0) return { error: problems[0].message }

  const losses = state.history
    .filter((h) => h.accountId === state.account.id)
    .map((h) => ({ lot: h.lot, closedClock: h.closedClock, result: h.net + h.swap }))
  const revenge = isRevenge(quote.lot, state.account.candlesPlayed, losses)
  const { digits } = instrument(session.pair)

  return {
    trade: {
      session_id: session.id,
      side: input.side,
      lot: quote.lot,
      stage: state.stage,
      reasons: input.reasons as ReasonId[],
      entry_price: entry,
      sl: quote.sl,
      tp: quote.tp,
      balance_at_entry: state.account.balance,
      margin: quote.margin,
      spread: quote.costs.spread,
      commission: quote.costs.commission,
      risk_amount: quote.loss,
      risk_pct: quote.lossPct,
      reward_risk: quote.rewardRisk,
      range_avg: Number(averageRange(state.segmentCandles.slice(0, s.cursor + 1)).toFixed(digits + 1)),
      revenge,
    },
    events: [
      {
        kind: "opened",
        number: 0,
        revenge,
        noTp: quote.tp === null && !STAGES[state.stage].slTpRequired,
        riskAbove: quote.risk === "above" || quote.risk === "danger",
      },
    ],
  }
}

export type ModifyPlan = { tradeId: string; field: "sl" | "tp"; price: number | null; atIndex: number }

/**
 * Move or remove SL or TP. `pips` is measured from entry: SL on the losing
 * side (negative = past entry, locking in profit), TP on the winning side.
 * Every change is kept, and widening SL fails a Disiplin check at close.
 */
export function planModify(
  state: TradingState,
  tradeId: string,
  field: "sl" | "tp",
  pips: number | null,
): ModifyPlan | Refusal {
  const s = activeSession(state)
  if ("error" in s) return s
  const row = state.open.find((t) => t.id === tradeId)
  if (!row) return { error: msg("errors.tradeClosed") }
  const name = field === "sl" ? "SL" : "TP"

  if (pips === null) {
    if (STAGES[state.stage].slTpRequired) return { error: msg("errors.slTpRequired", { stage: state.stage }) }
  } else {
    const tenths = Math.round(pips * 10)
    const valid =
      Number.isFinite(pips) &&
      Math.abs(tenths - pips * 10) < 1e-9 &&
      Math.abs(pips) <= PLAN.MAX_DISTANCE_PIPS &&
      (field === "sl" || pips > 0)
    if (!valid) return { error: msg("errors.distanceInvalid", { name }) }
  }

  const price = pips === null ? null : levelPrice(row.pair, row.side, row.entryPrice, field, pips)
  const current = field === "sl" ? row.sl : row.tp
  if (price === current) return { error: msg("errors.noChange") }

  if (price !== null) {
    const now = state.segmentCandles[s.cursor].c
    const buy = row.side === "buy"
    const lossSide = field === "sl"
    const ok = lossSide === buy ? price < now : price > now
    if (!ok) return { error: msg("errors.levelSide", { name, side: lossSide === buy ? "below" : "above" }) }
  }

  return { tradeId, field, price, atIndex: s.cursor }
}

/** The next chart. Refused while a trade is open. */
export function planStart(
  state: TradingState,
  pool: Segment[],
  seen: ReadonlyMap<string, number>,
  random: () => number,
): Segment | Refusal {
  // Habis stays habis: no new chart either.
  if (accountBust(state)) return BUST_REFUSAL
  if (state.open.length > 0) return { error: msg("errors.closeBeforeChart") }
  const segment = pickSegment(pool, seen, random, state.session?.segmentId)
  return segment ?? { error: msg("errors.noChartForStage") }
}
