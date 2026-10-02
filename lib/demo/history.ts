import "server-only"
import { loadSegment } from "@/lib/demo/candles"
import type { Bar } from "@/lib/demo/fills"
import { journalRow, type JournalRow } from "@/lib/demo/journal"
import type { TradeRow } from "@/lib/demo/state"
import { TRADE_COLUMNS, toTradeRow, type Row } from "@/lib/demo/trading"
import { createClient } from "@/lib/supabase/server"

// Akun Latihan's past: closed trades, the journal, balances and how many
// trades each account made. Reads go through the player's own session, so RLS
// limits them to their rows. Candle times come from lib/demo/candles, here on
// the server, and only for candles the player has already played.

/** Far more than any account makes before it runs out or graduates. */
const MAX_TRADES = 1000

/** An account's closed trades, oldest first. */
export async function loadClosedTrades(userId: string, accountId: string): Promise<TradeRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("demo_trades")
    .select(TRADE_COLUMNS)
    .eq("user_id", userId)
    .eq("account_id", accountId)
    .eq("status", "closed")
    .order("number")
    .limit(MAX_TRADES)
  if (error) throw new Error("Akun Latihan: could not load the trades")
  return ((data ?? []) as unknown as Row[]).map(toTradeRow)
}

/** Every closed trade of the player, all accounts, oldest first. */
export async function loadPlayerTrades(userId: string): Promise<TradeRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("demo_trades")
    .select(TRADE_COLUMNS)
    .eq("user_id", userId)
    .eq("status", "closed")
    .order("closed_at", { ascending: false })
    .order("number", { ascending: false })
    .limit(MAX_TRADES)
  if (error) throw new Error("Akun Latihan: could not load the trades")
  return ((data ?? []) as unknown as Row[]).map(toTradeRow).reverse()
}

/** The account's balance after each ledger row, in booking order: the drawdown's series. */
export async function loadBalances(accountId: string): Promise<number[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("demo_ledger")
    .select("balance_after")
    .eq("account_id", accountId)
    .order("seq")
    .limit(MAX_TRADES * 4)
  if (error) throw new Error("Akun Latihan: could not load the ledger")
  return (data ?? []).map((r) => Number(r.balance_after))
}

/** Closed trades per account id. */
export async function tradeCounts(userId: string): Promise<Map<string, number>> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("demo_trades")
    .select("account_id")
    .eq("user_id", userId)
    .eq("status", "closed")
    .limit(MAX_TRADES * 10)
  if (error) throw new Error("Akun Latihan: could not count the trades")
  const counts = new Map<string, number>()
  for (const r of data ?? []) counts.set(String(r.account_id), (counts.get(String(r.account_id)) ?? 0) + 1)
  return counts
}

/** One account's journal, newest first, each trade with the times of its entry and exit candles. */
export async function loadJournal(userId: string, accountId: string): Promise<JournalRow[]> {
  const supabase = await createClient()
  const [trades, sessions] = await Promise.all([
    loadClosedTrades(userId, accountId),
    supabase.from("demo_sessions").select("id, segment_id").eq("user_id", userId).eq("account_id", accountId),
  ])
  if (sessions.error) throw new Error("Akun Latihan: could not load the charts")

  const segmentOf = new Map((sessions.data ?? []).map((s) => [String(s.id), String(s.segment_id)]))
  const candles = new Map<string, Bar[] | null>()
  const candlesOf = (segment: string) => {
    if (!candles.has(segment)) candles.set(segment, loadSegment(segment)?.candles ?? null)
    return candles.get(segment)
  }
  const timeAt = (bars: Bar[] | null | undefined, index: number | null) =>
    bars && index !== null ? (bars[index]?.t ?? null) : null

  const rows: JournalRow[] = []
  for (const t of trades) {
    const segment = segmentOf.get(t.sessionId)
    const bars = segment ? candlesOf(segment) : null
    const row = journalRow(t, { entry: timeAt(bars, t.entryIndex), exit: timeAt(bars, t.exitIndex) })
    if (row) rows.push(row)
  }
  return rows.reverse()
}
