import "server-only"
import { DEFAULT_PAIR, DEFAULT_TIMEFRAME, isLivePair, isTimeframe, type LivePair, type Timeframe } from "@/lib/live/config"
import { parseDrawings, shiftDrawing, type Drawing } from "@/lib/live/drawings"
import { accountNow, chartSlice, type ChartSlice } from "@/lib/live/store"
import { createAdminClient } from "@/lib/supabase/admin"

// The trading screen's own state, server side: the chart the player last had
// open, their drawings, and the candles. Drawings are stored with absolute
// times in demo_drawings (no RLS policy: the browser can't read it) and sent
// with times relative to the account's "now". Writes use the service role,
// always scoped to the player's own active account.

export type Desk = {
  pair: LivePair
  timeframe: Timeframe
  chart: ChartSlice | null
  /** Relative times, like the candles. */
  drawings: Drawing[]
}

/** The player's active account id, or null. */
async function activeAccount(userId: string) {
  const { data } = await createAdminClient()
    .from("demo_accounts")
    .select("id, last_pair, last_timeframe")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle()
  return data as { id: string; last_pair: string | null; last_timeframe: string | null } | null
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
export async function loadDesk(userId: string, pair?: unknown, timeframe?: unknown): Promise<Desk | null> {
  const account = await activeAccount(userId)
  if (!account) return null
  const p = isLivePair(pair) ? pair : isLivePair(account.last_pair) ? account.last_pair : DEFAULT_PAIR
  const tf = isTimeframe(timeframe) ? timeframe : isTimeframe(account.last_timeframe) ? account.last_timeframe : DEFAULT_TIMEFRAME
  const now = await accountNow(account.id)
  const [chart, drawings] = await Promise.all([chartSlice(now, p, tf), drawingsFor(account.id, p, now)])
  if (p !== account.last_pair || tf !== account.last_timeframe) {
    await createAdminClient().from("demo_accounts").update({ last_pair: p, last_timeframe: tf }).eq("id", account.id)
  }
  return { pair: p, timeframe: tf, chart, drawings }
}

/** Replaces the drawings of one pair. `drawings` arrive with relative times. */
export async function saveDrawings(userId: string, pair: LivePair, drawings: unknown) {
  const account = await activeAccount(userId)
  if (!account) return { ok: false as const, status: 404 }
  const now = await accountNow(account.id)
  const absolute = parseDrawings(drawings).map((d) => shiftDrawing(d, now))
  const { error } = await createAdminClient()
    .from("demo_drawings")
    .upsert(
      { account_id: account.id, user_id: userId, pair, drawings: absolute, updated_at: new Date().toISOString() },
      { onConflict: "account_id,pair" },
    )
  return error ? { ok: false as const, status: 500 } : { ok: true as const }
}
