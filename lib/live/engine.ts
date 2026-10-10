import "server-only"
import { settle, type SettlePlan } from "@/lib/demo/actions"
import type { OrderInput } from "@/lib/demo/orders"
import { closeAt } from "@/lib/demo/fills"
import { toOpenTrade, type TradingState } from "@/lib/demo/state"
import { TRADE_COLUMNS, loadTrading, toTradeRow, type Row } from "@/lib/demo/trading"
import { buildView, type DemoEvent, type DemoView } from "@/lib/demo/view"
import { msg, type Msg } from "@/lib/i18n/translator"
import { advanceClock, dataTime, pickOffset, rangeEndReal, rangeIndex, RANGES, realTime } from "@/lib/live/clock"
import { LIVE, M15, MARKET } from "@/lib/live/config"
import {
  askOf,
  exitPrice,
  liveClock,
  planLiveClose,
  planLiveModify,
  planLiveOrder,
  spreadPrice,
  type LiveMarket,
} from "@/lib/live/execute"
import { averageRangeAt, bidAt, marketStatus } from "@/lib/live/market"
import { replay } from "@/lib/live/replay"
import { digitsOf, m15Between } from "@/lib/live/store"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

// The live chart's engine, server side. There is no cron: every read of the
// account first replays the M15 candles since its last check against the
// open position (lib/live/replay), books what happened through the same
// booking step as the replay engine (lib/demo/actions settle), and only then
// answers. The account's clock (offset in whole weeks, last check) lives in
// demo_live_clock, which the browser can't read: from it the data's period
// could be worked out. Trades store real times only.

export type LiveClock = { accountId: string; offsetWeeks: number; lastCheckedAt: number }

const nowReal = () => Math.floor(Date.now() / 1000)
const iso = (s: number) => new Date(s * 1000).toISOString()
const secondsOf = (v: unknown) => Math.floor(Date.parse(String(v)) / 1000)

/** The account's clock; created on first use (the player's previous account's offset, or a random clean week). null when the table is missing. */
async function clockFor(userId: string, accountId: string): Promise<LiveClock | null> {
  const admin = createAdminClient()
  const read = () =>
    admin.from("demo_live_clock").select("offset_weeks, last_checked_at").eq("account_id", accountId).eq("user_id", userId).maybeSingle()
  const found = await read()
  if (found.error) return null
  if (found.data) {
    return { accountId, offsetWeeks: Number(found.data.offset_weeks), lastCheckedAt: secondsOf(found.data.last_checked_at) }
  }
  // A new account carries on the player's market (a reset is not a way to a different market).
  const prev = await admin
    .from("demo_live_clock")
    .select("offset_weeks")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()
  const real = nowReal()
  const offset = prev.data ? Number(prev.data.offset_weeks) : pickOffset(real, Math.random())
  const ins = await admin
    .from("demo_live_clock")
    .upsert({ account_id: accountId, user_id: userId, offset_weeks: offset, last_checked_at: iso(real) }, { onConflict: "account_id", ignoreDuplicates: true })
  if (ins.error) return null
  const again = await read()
  if (again.error || !again.data) return null
  return { accountId, offsetWeeks: Number(again.data.offset_weeks), lastCheckedAt: secondsOf(again.data.last_checked_at) }
}

/** The pair's market at real moment `real` on this clock. */
async function marketAt(pair: string, clock: LiveClock, real: number) {
  const data = dataTime(real, clock.offsetWeeks)
  const bars = await m15Between(pair, data - 8 * 86_400, data + MARKET.CLOSE_GAP_SECONDS + 4 * 86_400)
  const past = bars.filter((b) => b.t <= data)
  const digits = digitsOf(pair)
  const bid = bidAt(pair, past, data, digits)
  const status = marketStatus(bars, data)
  const market: LiveMarket = {
    pair,
    open: status.open && bid !== null,
    bid: bid ?? 0,
    real,
    rangeAvg: averageRangeAt(past, data, LIVE.RANGE_AVG_M15),
  }
  return { market, opensIn: status.opensIn, hasPrice: bid !== null }
}

type Loaded = { state: TradingState; lessonPassed: boolean }

/**
 * A trade still open from the replay engine (before the live chart) closes
 * where its replay chart stands, as "segmen habis", through the replay's own
 * database function. Its times are replay candles, so the live replay must
 * never see it. Returns true when it booked something.
 */
async function closeReplayLeftovers(userId: string, state: TradingState): Promise<boolean> {
  const left = state.open.filter((t) => t.sessionId !== null)
  if (left.length === 0) return false
  const s = state.session
  const bar = s ? state.segmentCandles[s.cursor] : undefined
  if (!s || !bar) {
    console.error("Akun Latihan: replay trade open without its chart", left.map((t) => t.id))
    return false
  }
  const mine = left.filter((t) => t.sessionId === s.id)
  const plan = settle(
    state,
    mine.map((t) => closeAt(toOpenTrade(t), bar.c, "segment_end")),
    state.open.filter((t) => !mine.includes(t)).map(toOpenTrade),
    { advance: false, clock: state.account.candlesPlayed, index: s.cursor, endSession: true, stopOut: null },
  )
  const { error } = await createAdminClient().rpc("demo_settle", {
    p_user: userId,
    p_account: state.account.id,
    p_version: state.account.version,
    p_session: s.id,
    p_advance: false,
    p_updates: plan.updates,
    p_ledger: plan.ledger,
    p_balance: plan.balance,
    p_end_session: mine.length === left.length,
    p_stage: plan.stage,
  })
  if (error && !error.message.includes("demo_stale")) throw new Error(`Akun Latihan: could not close replay trades: ${error.message}`)
  return true
}

/** The trading state for the live chart: the account's own closed live trades, no replay session. */
async function loadLiveState(userId: string): Promise<Loaded | null> {
  let loaded = await loadTrading(userId)
  if (!loaded) return null
  if (await closeReplayLeftovers(userId, loaded.state)) {
    loaded = await loadTrading(userId)
    if (!loaded) return null
  }
  const supabase = await createClient()
  const recent = await supabase
    .from("demo_trades")
    .select(TRADE_COLUMNS)
    .eq("account_id", loaded.state.account.id)
    .eq("status", "closed")
    .is("session_id", null)
    .order("number", { ascending: false })
    .limit(5)
  if (recent.error) throw new Error("Akun Latihan: could not load the live trades")
  return {
    lessonPassed: loaded.lessonPassed,
    state: {
      ...loaded.state,
      session: null,
      segment: null,
      segmentCandles: [],
      // Only live trades: a replay leftover that couldn't be closed stays out of the live replay.
      open: loaded.state.open.filter((t) => t.sessionId === null),
      sessionClosed: ((recent.data ?? []) as unknown as Row[]).map(toTradeRow).reverse(),
    },
  }
}

type Written = "ok" | "stale" | { error: string }

async function writeSettle(userId: string, state: TradingState, plan: SettlePlan, checkedAt: number): Promise<Written> {
  const admin = createAdminClient()
  const { error } = await admin.rpc("demo_live_settle", {
    p_user: userId,
    p_account: state.account.id,
    p_version: state.account.version,
    p_checked_at: iso(checkedAt),
    p_updates: plan.updates,
    p_ledger: plan.ledger,
    p_balance: plan.balance,
    p_stage: plan.stage,
  })
  if (error) return error.message.includes("demo_stale") ? "stale" : { error: error.message }
  if (plan.graduated) {
    // Recorded once; if this fails, the next settle tries again.
    const grad = await admin.from("demo_profile").update({ graduated_at: new Date().toISOString() }).eq("user_id", userId).is("graduated_at", null)
    if (grad.error) console.error("Akun Latihan: could not record graduation", grad.error.message)
  }
  return "ok"
}

/**
 * Replays the open position from the last check to `real` (never past the end
 * of the clock's data range) and books the result. Returns the events, or
 * "stale" when another request booked first.
 */
async function replayOpen(
  userId: string,
  state: TradingState,
  clock: LiveClock,
  real: number,
  checkpoint: boolean,
): Promise<{ events: DemoEvent[]; wrote: boolean } | "stale"> {
  const row = state.open[0]
  if (!row) return { events: [], wrote: false }
  const off = clock.offsetWeeks
  const inRange = rangeIndex(dataTime(clock.lastCheckedAt, off)) >= 0
  const endReal = inRange ? Math.min(real, rangeEndReal(clock.lastCheckedAt, off)) : real
  const from = dataTime(Math.max(clock.lastCheckedAt, row.entryIndex), off)
  const now = dataTime(endReal, off)
  const range = RANGES[rangeIndex(dataTime(clock.lastCheckedAt, off))]
  const bars = await m15Between(row.pair, from - M15, now + MARKET.CLOSE_GAP_SECONDS + 4 * 86_400)

  const result = replay({
    pair: row.pair,
    digits: digitsOf(row.pair),
    position: { trade: toOpenTrade(row), openedAt: dataTime(row.entryIndex, off) },
    balance: state.account.balance,
    spread: spreadPrice(row.pair) ?? 0,
    bars,
    from,
    now,
    stopAt: range?.to,
  })

  let plan: SettlePlan | null = null
  if (result.close) {
    const { barT, ...closure } = result.close
    const exitReal = realTime(barT, off)
    plan = settle(state, [{ ...closure, reason: closure.reason }], [], {
      advance: false,
      clock: liveClock(exitReal),
      index: exitReal,
      endSession: false,
      stopOut: result.stopOut,
    })
    if (plan.balance !== result.balance) console.error("Akun Latihan: live booking and replay disagree", plan.balance, result.balance)
  } else if (result.open && (checkpoint || result.open.swap !== row.swap)) {
    // Swap changed, or a checkpoint before SL/TP moves: book the state as of now.
    plan = settle(state, [], [result.open], { advance: false, clock: liveClock(endReal), index: endReal, endSession: false, stopOut: null })
  }
  if (!plan) return { events: [], wrote: false }
  const written = await writeSettle(userId, state, plan, endReal)
  if (written === "stale") return "stale"
  if (written !== "ok") throw new Error(`Akun Latihan: live settle failed: ${written.error}`)
  return { events: plan.events, wrote: true }
}

export type Synced = { state: TradingState; lessonPassed: boolean; clock: LiveClock; real: number; events: DemoEvent[] }

/**
 * Brings the account up to now: replays the open position, moves the clock to
 * the next clean range when it has reached the end of one (drawings are
 * cleared then: they belong to the old chart), and reloads. null without an
 * account; "not-ready" when the live tables are missing.
 */
export async function syncLive(userId: string, checkpoint = false): Promise<Synced | null | "not-ready"> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const loaded = await loadLiveState(userId)
    if (!loaded) return null
    const clock = await clockFor(userId, loaded.state.account.id)
    if (!clock) return "not-ready"
    const real = nowReal()
    const replayed = await replayOpen(userId, loaded.state, clock, real, checkpoint)
    if (replayed === "stale") continue
    const { events } = replayed

    let current = clock
    const moved = advanceClock(real, clock.offsetWeeks)
    if (moved.jumps.length > 0) {
      const admin = createAdminClient()
      const upd = await admin
        .from("demo_live_clock")
        .update({ offset_weeks: moved.offsetWeeks, last_checked_at: iso(real) })
        .eq("account_id", clock.accountId)
        .eq("offset_weeks", clock.offsetWeeks)
      if (upd.error) throw new Error("Akun Latihan: could not move the live clock")
      await admin.from("demo_drawings").delete().eq("account_id", clock.accountId)
      current = { ...clock, offsetWeeks: moved.offsetWeeks, lastCheckedAt: real }
    } else if (replayed.wrote) {
      current = { ...clock, lastCheckedAt: real }
    }

    const fresh = replayed.wrote || moved.jumps.length > 0 ? await loadLiveState(userId) : loaded
    if (!fresh) return null
    return { state: fresh.state, lessonPassed: fresh.lessonPassed, clock: current, real, events }
  }
  throw new Error("Akun Latihan: the account kept changing during the live replay")
}

/** The trading view with the open position valued at the price it closes on now. */
export async function liveView(synced: Synced, events: DemoEvent[] = synced.events): Promise<DemoView> {
  const row = synced.state.open[0]
  let price: number | null = null
  if (row) {
    const { market, hasPrice } = await marketAt(row.pair, synced.clock, synced.real)
    price = hasPrice ? exitPrice(row.pair, row.side, market.bid) : row.entryPrice
  }
  return buildView(synced.state, events, {
    price,
    clock: liveClock(synced.real),
    revengeWindow: LIVE.REVENGE_WINDOW_M15,
    maxOpenTrades: LIVE.MAX_OPEN,
  })
}

/** What the order panel needs for a pair: the bid and ask now, and whether the market is open. Never a future price. */
export async function liveQuote(synced: Synced, pair: string) {
  const { market, opensIn, hasPrice } = await marketAt(pair, synced.clock, synced.real)
  return {
    pair,
    open: market.open,
    opensIn,
    bid: hasPrice ? market.bid : null,
    ask: hasPrice && spreadPrice(pair) !== null ? askOf(pair, market.bid) : null,
  }
}

export type LiveResult = { view: DemoView } | { error: Msg; status: number; view?: DemoView }

async function ready(userId: string, checkpoint = false): Promise<Synced | LiveResult> {
  const synced = await syncLive(userId, checkpoint)
  if (synced === null) return { error: msg("errors.noAccount"), status: 403 }
  if (synced === "not-ready") return { error: msg("errors.liveNotReady"), status: 503 }
  if (!synced.lessonPassed) return { error: msg("errors.lessonFirst"), status: 403 }
  return synced
}

const isResult = (v: Synced | LiveResult): v is LiveResult => "error" in v || "view" in v

/** After a write: sync again (the account changed) and answer with the new view. */
async function after(userId: string, events: DemoEvent[]): Promise<LiveResult> {
  const synced = await syncLive(userId)
  if (!synced || synced === "not-ready") return { error: msg("errors.accountMissing"), status: 404 }
  return { view: await liveView(synced, [...events, ...synced.events]) }
}

async function refused(userId: string, message: string): Promise<LiveResult> {
  const synced = await syncLive(userId)
  const view = synced && synced !== "not-ready" ? await liveView(synced, []) : undefined
  if (message.includes("demo_stale")) return { error: msg("errors.stale"), status: 409, view }
  if (message.includes("demo_open_trades") || message.includes("demo_trades_one_open")) return { error: msg("errors.onePosition"), status: 409, view }
  if (message.includes("demo_trade_missing")) return { error: msg("errors.tradeClosed"), status: 409, view }
  console.error("Akun Latihan: live write failed", message)
  return { error: msg("errors.saveFailed"), status: 500, view }
}

/** A market order at the server's price now. */
export async function placeLiveOrder(userId: string, pair: string, input: OrderInput): Promise<LiveResult> {
  const synced = await ready(userId)
  if (isResult(synced)) return synced
  const { market } = await marketAt(pair, synced.clock, synced.real)
  const plan = planLiveOrder(synced.state, input, market)
  if ("error" in plan) return { error: plan.error, status: 422, view: await liveView(synced, []) }
  const { data, error } = await createAdminClient().rpc("demo_live_open", {
    p_user: userId,
    p_account: synced.state.account.id,
    p_version: synced.state.account.version,
    p_trade: plan.trade,
    p_checked_at: iso(synced.real),
  })
  if (error) return refused(userId, error.message)
  const number = Number((data as Row | null)?.number ?? 0)
  return after(
    userId,
    plan.events.map((e) => (e.kind === "opened" ? { ...e, number } : e)),
  )
}

/** Close the open position now, at the price it closes on. */
export async function closeLive(userId: string, tradeId: string): Promise<LiveResult> {
  const synced = await ready(userId)
  if (isResult(synced)) return synced
  const row = synced.state.open.find((t) => t.id === tradeId)
  if (!row) return { error: msg("errors.tradeClosed"), status: 409, view: await liveView(synced) }
  const { market } = await marketAt(row.pair, synced.clock, synced.real)
  const closure = planLiveClose(synced.state, tradeId, market)
  if ("error" in closure) return { error: closure.error, status: 409, view: await liveView(synced) }
  const plan = settle(synced.state, [closure], [], {
    advance: false,
    clock: liveClock(synced.real),
    index: synced.real,
    endSession: false,
    stopOut: null,
  })
  const written = await writeSettle(userId, synced.state, plan, synced.real)
  if (written === "stale") return refused(userId, "demo_stale")
  if (written !== "ok") return refused(userId, written.error)
  return after(userId, plan.events)
}

/** Move SL or TP of the open position. */
export async function modifyLive(userId: string, tradeId: string, field: "sl" | "tp", pips: number | null): Promise<LiveResult> {
  // Checkpoint first: the replay must not apply the new level to candles before now.
  const synced = await ready(userId, true)
  if (isResult(synced)) return synced
  const row = synced.state.open.find((t) => t.id === tradeId)
  if (!row) return { error: msg("errors.tradeClosed"), status: 409, view: await liveView(synced) }
  const { market } = await marketAt(row.pair, synced.clock, synced.real)
  const plan = planLiveModify(synced.state, tradeId, field, pips, market)
  if ("error" in plan) return { error: plan.error, status: 422, view: await liveView(synced) }
  const { error } = await createAdminClient().rpc("demo_modify_trade", {
    p_user: userId,
    p_account: synced.state.account.id,
    p_version: synced.state.account.version,
    p_trade: plan.tradeId,
    p_field: plan.field,
    p_price: plan.price,
    p_at: plan.atIndex,
  })
  if (error) return refused(userId, error.message)
  return after(userId, [])
}
