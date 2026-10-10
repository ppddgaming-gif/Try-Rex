import "server-only"
import { loadSegment } from "@/lib/demo/candles"
import { LINES, REVIEW, type StageNumber } from "@/lib/demo/config"
import type { Checks, SlChange } from "@/lib/demo/disiplin"
import type { ExitReason } from "@/lib/demo/fills"
import { roundPrice } from "@/lib/demo/money"
import type { ClosedSummary, ReviewAnswer, TradeRow, TradingState } from "@/lib/demo/state"
import { isTipId, type TipId } from "@/lib/demo/tips"
import { buildView, type DemoEvent, type DemoView } from "@/lib/demo/view"
import { msg, type Msg } from "@/lib/i18n/translator"
import type { ReasonId } from "@/lib/reasons"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

// Akun Latihan's trading state, server side. Reads go through the player's
// own session, so RLS limits them to their rows. Orders, closes and SL/TP
// moves now run on the live chart (lib/live/engine.ts); what stays here is
// loading the state and the self-written review and notes.

export const TRADE_COLUMNS =
  "id, number, session_id, pair, side, lot, stage, reasons, entry_price, entry_index, opened_clock, " +
  "sl_initial, tp_initial, sl, tp, balance_at_entry, margin, spread, commission, risk_amount, risk_pct, " +
  "reward_risk, range_avg, revenge, swap, status, exit_price, exit_index, closed_clock, exit_reason, pips, " +
  "gross, net, counted, checks, disiplin, xp, review, review_note"

export type Row = Record<string, unknown>
const num = (v: unknown) => Number(v)
const numOrNull = (v: unknown) => (v === null || v === undefined ? null : Number(v))

export function toTradeRow(r: Row): TradeRow {
  return {
    id: String(r.id),
    number: num(r.number),
    sessionId: r.session_id === null || r.session_id === undefined ? null : String(r.session_id),
    pair: String(r.pair),
    side: r.side === "sell" ? "sell" : "buy",
    lot: num(r.lot),
    stage: num(r.stage) as StageNumber,
    reasons: (r.reasons as ReasonId[]) ?? [],
    entryPrice: num(r.entry_price),
    entryIndex: num(r.entry_index),
    openedClock: num(r.opened_clock),
    slInitial: numOrNull(r.sl_initial),
    tpInitial: numOrNull(r.tp_initial),
    sl: numOrNull(r.sl),
    tp: numOrNull(r.tp),
    balanceAtEntry: num(r.balance_at_entry),
    margin: num(r.margin),
    spread: num(r.spread),
    commission: num(r.commission),
    riskAmount: numOrNull(r.risk_amount),
    riskPct: numOrNull(r.risk_pct),
    rewardRisk: numOrNull(r.reward_risk),
    rangeAvg: num(r.range_avg),
    revenge: Boolean(r.revenge),
    swap: num(r.swap),
    status: r.status === "closed" ? "closed" : "open",
    exitPrice: numOrNull(r.exit_price),
    exitIndex: numOrNull(r.exit_index),
    closedClock: numOrNull(r.closed_clock),
    exitReason: (r.exit_reason as ExitReason | null) ?? null,
    pips: numOrNull(r.pips),
    gross: numOrNull(r.gross),
    net: numOrNull(r.net),
    counted: r.counted === null || r.counted === undefined ? null : Boolean(r.counted),
    checks: (r.checks as Checks | null) ?? null,
    disiplin: numOrNull(r.disiplin),
    xp: num(r.xp ?? 0),
    review: (r.review as ReviewAnswer | null) ?? null,
    reviewNote: (r.review_note as string | null) ?? null,
  }
}

export type Loaded = { state: TradingState; lessonPassed: boolean }

/** The player's active account and everything the trading screen needs; null without an account. */
export async function loadTrading(userId: string): Promise<Loaded | null> {
  const supabase = await createClient()

  // The account first: its version guards everything read after it.
  const acc = await supabase
    .from("demo_accounts")
    .select("id, number, balance, starting_balance, version, candles_played")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle()
  if (acc.error || !acc.data) return null
  const account = {
    id: String(acc.data.id),
    number: num(acc.data.number),
    balance: num(acc.data.balance),
    startingBalance: num(acc.data.starting_balance),
    version: num(acc.data.version),
    candlesPlayed: num(acc.data.candles_played),
  }

  const [profile, session, open, history, tips] = await Promise.all([
    supabase.from("demo_profile").select("stage, intro_lesson_passed_at, graduated_at").eq("user_id", userId).maybeSingle(),
    supabase
      .from("demo_sessions")
      .select("id, segment_id, pair, cursor, last_index, status")
      .eq("account_id", account.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from("demo_trades").select(TRADE_COLUMNS).eq("account_id", account.id).eq("status", "open").order("number"),
    // Newest 1,000 closed trades: far more than stages (last 20) or the
    // revenge window need; the account stats count within them.
    supabase
      .from("demo_trades")
      .select("account_id, stage, counted, disiplin, net, swap, lot, closed_clock")
      .eq("user_id", userId)
      .eq("status", "closed")
      .order("closed_at", { ascending: false })
      .order("number", { ascending: false })
      .limit(1000),
    supabase.from("demo_tips_seen").select("tip_id").eq("user_id", userId),
  ])
  if (profile.error || session.error || open.error || history.error || tips.error) {
    throw new Error("Akun Latihan: could not load the trading state")
  }

  const openRows = ((open.data ?? []) as unknown as Row[]).map(toTradeRow)
  const s = session.data
  const sessionRow = s
    ? {
        id: String(s.id),
        segmentId: String(s.segment_id),
        pair: String(s.pair),
        cursor: num(s.cursor),
        lastIndex: num(s.last_index),
        status: s.status === "ended" ? ("ended" as const) : ("active" as const),
      }
    : null
  const segment = sessionRow ? loadSegment(sessionRow.segmentId) : null

  const [closedInSession, changes, lines] = await Promise.all([
    sessionRow
      ? supabase
          .from("demo_trades")
          .select(TRADE_COLUMNS)
          .eq("session_id", sessionRow.id)
          .eq("status", "closed")
          .order("number")
      : null,
    openRows.length
      ? supabase
          .from("demo_trade_changes")
          .select("trade_id, old_price, new_price")
          .in("trade_id", openRows.map((t) => t.id))
          .eq("field", "sl")
          .order("seq")
      : null,
    sessionRow
      ? supabase.from("demo_lines").select("prices").eq("user_id", userId).eq("segment_id", sessionRow.segmentId).maybeSingle()
      : null,
  ])

  const slChanges: Record<string, SlChange[]> = {}
  for (const c of (changes?.data ?? []) as Row[]) {
    const list = slChanges[String(c.trade_id)] ?? (slChanges[String(c.trade_id)] = [])
    list.push({ from: numOrNull(c.old_price), to: numOrNull(c.new_price) })
  }

  const summaries: ClosedSummary[] = ((history.data ?? []) as Row[])
    .map((h) => ({
      accountId: String(h.account_id),
      stage: num(h.stage) as StageNumber,
      counted: Boolean(h.counted),
      disiplin: num(h.disiplin),
      net: num(h.net),
      swap: num(h.swap),
      lot: num(h.lot),
      closedClock: num(h.closed_clock),
    }))
    .reverse()

  return {
    lessonPassed: Boolean(profile.data?.intro_lesson_passed_at),
    state: {
      account,
      stage: (num(profile.data?.stage ?? 1) || 1) as StageNumber,
      session: sessionRow,
      segment: segment?.info ?? null,
      segmentCandles: segment?.candles ?? [],
      open: openRows,
      sessionClosed: ((closedInSession?.data ?? []) as unknown as Row[]).map(toTradeRow),
      history: summaries,
      slChanges,
      lines: ((lines?.data?.prices as unknown[]) ?? []).map(Number).filter(Number.isFinite),
      tipsSeen: ((tips.data ?? []) as Row[]).map((t) => t.tip_id).filter(isTipId) as TipId[],
      graduated: Boolean(profile.data?.graduated_at),
    },
  }
}

export type ActionResult = { view: DemoView } | Failure

/**
 * A refusal (a demo-catalogue message; the route puts it into words), with the
 * current view when there is one so the screen can catch up.
 */
type Failure = { error: Msg; status: number; view?: DemoView }
const fail = (error: Msg, status = 409, view?: DemoView): Failure => ({ error, status, view })

async function viewAfter(userId: string, events: DemoEvent[]): Promise<ActionResult> {
  const loaded = await loadTrading(userId)
  if (!loaded) return fail(msg("errors.accountMissing"), 404)
  return { view: buildView(loaded.state, events) }
}

/** The screen's current state, for the page and after a refused write. */
export async function currentView(userId: string): Promise<ActionResult> {
  return viewAfter(userId, [])
}

const cleanNote = (note: string | null) => note?.replace(/\s+/g, " ").trim().slice(0, REVIEW.NOTE_MAX_CHARS) || null

/** "Apakah kamu mengikuti rencanamu?" on a closed trade. Self-reported; never scored. */
export async function reviewTrade(userId: string, tradeId: string, answer: ReviewAnswer, note: string | null) {
  const clean = cleanNote(note)
  // An empty note keeps one already added from the journal.
  const { data, error } = await createAdminClient()
    .from("demo_trades")
    .update(clean ? { review: answer, review_note: clean } : { review: answer })
    .eq("id", tradeId)
    .eq("user_id", userId)
    .eq("status", "closed")
    .select("id")
  if (error) return fail(msg("errors.saveFailedShort"), 500)
  if (!data?.length) return fail(msg("errors.tradeMissing"), 404)
  return { ok: true as const }
}

/**
 * "Tambah catatan" in the journal: the note on a closed trade of the
 * player's, on any of their accounts. Self-written, never scored.
 */
export async function saveNote(userId: string, tradeId: string, note: string | null) {
  const clean = cleanNote(note)
  const { data, error } = await createAdminClient()
    .from("demo_trades")
    .update({ review_note: clean })
    .eq("id", tradeId)
    .eq("user_id", userId)
    .eq("status", "closed")
    .select("id")
  if (error) return fail(msg("errors.noteFailed"), 500)
  if (!data?.length) return fail(msg("errors.tradeMissing"), 404)
  return { ok: true as const, note: clean }
}

/** The drawn lines of the session's segment. Never scored. */
export async function saveLines(userId: string, sessionId: string, prices: number[]) {
  const loaded = await loadTrading(userId)
  const session = loaded?.state.session
  if (!loaded || !session || session.id !== sessionId) return fail(msg("errors.chartChanged"))
  if (prices.length > LINES.MAX_PER_SEGMENT) return fail(msg("errors.maxLines", { max: LINES.MAX_PER_SEGMENT }), 422)
  const clean = prices.map((p) => roundPrice(session.pair, p))
  const { error } = await createAdminClient()
    .from("demo_lines")
    .upsert(
      { user_id: userId, segment_id: session.segmentId, prices: clean, updated_at: new Date().toISOString() },
      { onConflict: "user_id,segment_id" },
    )
  if (error) return fail(msg("errors.linesFailed"), 500)
  return { ok: true as const }
}
