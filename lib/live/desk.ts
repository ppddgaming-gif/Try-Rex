import "server-only"
import { dataTime } from "@/lib/live/clock"
import { DEFAULT_PAIR, DEFAULT_TIMEFRAME, isLivePair, isTimeframe, type LivePair, type Timeframe } from "@/lib/live/config"
import { parseDrawings, shiftDrawing, type Drawing } from "@/lib/live/drawings"
import type { Synced } from "@/lib/live/engine"
import { chartSlice, type ChartSlice } from "@/lib/live/store"
import { createAdminClient } from "@/lib/supabase/admin"

// The trading screen's own state, server side: the chart the player last had
// open, their drawings, and the candles up to the account's "now". Drawings
// are stored with absolute data times in demo_drawings (no RLS policy: the
// browser can't read it) and sent with times relative to "now". Writes use
// the service role, always scoped to the player's own active account.

export type Desk = {
  pair: LivePair
  timeframe: Timeframe
  chart: ChartSlice | null
  /** Relative times, like the candles; null when not asked for (a poll). */
  drawings: Drawing[] | null
}

async function drawingsFor(accountId: string, pair: LivePair, now: number): Promise<Drawing[]> {
  const { data } = await createAdminClient()
    .from("demo_drawings")
    .select("drawings")
    .eq("account_id", accountId)
    .eq("pair", pair)
    .maybeSingle()
  return parseDrawings(data?.drawings).map((d) => shiftDrawing(d, -now))
}

/**
 * The chart to show. `pair` / `timeframe` from the request win; otherwise the
 * account's last ones; otherwise the defaults. A requested chart is remembered.
 */
export async function loadDesk(
  userId: string,
  synced: Synced,
  options: { pair?: unknown; timeframe?: unknown; drawings: boolean },
): Promise<Desk> {
  const admin = createAdminClient()
  const { data: account } = await admin
    .from("demo_accounts")
    .select("last_pair, last_timeframe")
    .eq("id", synced.state.account.id)
    .eq("user_id", userId)
    .maybeSingle()
  const last = account as { last_pair: string | null; last_timeframe: string | null } | null
  const p = isLivePair(options.pair) ? options.pair : isLivePair(last?.last_pair) ? last.last_pair : DEFAULT_PAIR
  const tf = isTimeframe(options.timeframe) ? options.timeframe : isTimeframe(last?.last_timeframe) ? last.last_timeframe : DEFAULT_TIMEFRAME
  const now = dataTime(synced.real, synced.clock.offsetWeeks)
  const [chart, drawings] = await Promise.all([
    chartSlice(now, synced.real, p, tf),
    options.drawings ? drawingsFor(synced.state.account.id, p, now) : null,
  ])
  if (last && (p !== last.last_pair || tf !== last.last_timeframe)) {
    await admin.from("demo_accounts").update({ last_pair: p, last_timeframe: tf }).eq("id", synced.state.account.id)
  }
  return { pair: p, timeframe: tf, chart, drawings }
}

/** How far a drawing's anchor may be from now: a tab left open over a weekend still saves. */
const MAX_ANCHOR_AGE = 4 * 86_400

/**
 * Replaces the drawings of one pair. `drawings` arrive with times relative to
 * `anchor`, the real time of the chart they were drawn on.
 */
export async function saveDrawings(userId: string, synced: Synced, pair: LivePair, drawings: unknown, anchor: unknown) {
  const at = typeof anchor === "number" && Number.isFinite(anchor) && Math.abs(anchor - synced.real) <= MAX_ANCHOR_AGE ? Math.floor(anchor) : synced.real
  const base = dataTime(at, synced.clock.offsetWeeks)
  const absolute = parseDrawings(drawings).map((d) => shiftDrawing(d, base))
  const { error } = await createAdminClient()
    .from("demo_drawings")
    .upsert(
      { account_id: synced.state.account.id, user_id: userId, pair, drawings: absolute, updated_at: new Date().toISOString() },
      { onConflict: "account_id,pair" },
    )
  return error ? { ok: false as const, status: 500 } : { ok: true as const }
}
