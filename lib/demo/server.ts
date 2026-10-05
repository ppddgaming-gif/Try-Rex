import "server-only"
import { cache } from "react"
import { unlockFromAnswers, type Unlock } from "@/lib/demo/access"
import { isTipId, type TipId } from "@/lib/demo/tips"
import { createClient } from "@/lib/supabase/server"

// Reading Akun Latihan state for server components and route handlers.
// Reads go through the signed-in player's own session, so RLS (own rows
// only) applies even here; writes live in the route handlers.

export type DemoAccount = {
  id: string
  number: number
  status: "active" | "habis" | "reset"
  startingBalance: number
  balance: number
  createdAt: string
  closedAt: string | null
}

export type LedgerRow = { id: string; kind: string; label: string; amount: number; balanceAfter: number; createdAt: string }

export type DemoState = {
  unlock: Unlock
  introLessonPassed: boolean
  /** The active account; null before the first one and between a closed account and the next. */
  account: DemoAccount | null
  /** Every account this player has opened, newest first (Akun #n). */
  accounts: DemoAccount[]
  accountCount: number
  /** An account ran out and the risk lesson hasn't been passed since. */
  recoveryLessonDue: boolean
  graduated: boolean
  tipsSeen: { id: TipId; seenAt: string }[]
  /** False when the Akun Latihan tables don't exist yet (a migration not run). */
  ready: boolean
}

/** Answers the player has recorded in the Trading Game, counted here, not by the browser. */
export const countGameAnswers = cache(async (userId: string) => {
  const supabase = await createClient()
  const { count } = await supabase
    .from("practice_attempts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
  return count ?? 0
})

export const getUnlock = cache(async (userId: string) => unlockFromAnswers(await countGameAnswers(userId)))

const toAccount = (r: Record<string, unknown>): DemoAccount => ({
  id: String(r.id),
  number: Number(r.number),
  status: r.status as DemoAccount["status"],
  startingBalance: Number(r.starting_balance),
  balance: Number(r.balance),
  createdAt: String(r.created_at),
  closedAt: r.closed_at ? String(r.closed_at) : null,
})

export const loadDemoState = cache(async (userId: string): Promise<DemoState> => {
  const supabase = await createClient()
  const unlock = await getUnlock(userId)

  const [profile, all, tips, trades] = await Promise.all([
    supabase
      .from("demo_profile")
      .select("intro_lesson_passed_at, recovery_lesson_due, graduated_at")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("demo_accounts")
      .select("id, number, status, starting_balance, balance, created_at, closed_at")
      .eq("user_id", userId)
      .order("number", { ascending: false }),
    supabase.from("demo_tips_seen").select("tip_id, seen_at").eq("user_id", userId),
    // Phase B's tables: trading needs them too.
    supabase.from("demo_trades").select("id", { count: "exact", head: true }).eq("user_id", userId),
  ])

  const ready = !profile.error && !all.error && !tips.error && !trades.error
  const accounts = (all.data ?? []).map(toAccount)

  return {
    unlock,
    introLessonPassed: Boolean(profile.data?.intro_lesson_passed_at),
    account: accounts.find((a) => a.status === "active") ?? null,
    accounts,
    accountCount: accounts.length,
    recoveryLessonDue: Boolean(profile.data?.recovery_lesson_due),
    graduated: Boolean(profile.data?.graduated_at),
    tipsSeen: (tips.data ?? [])
      .filter((t) => isTipId(t.tip_id))
      .map((t) => ({ id: t.tip_id as TipId, seenAt: String(t.seen_at) })),
    ready,
  }
})

export async function loadLedger(accountId: string): Promise<LedgerRow[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("demo_ledger")
    .select("id, kind, label, amount, balance_after, created_at")
    .eq("account_id", accountId)
    .order("seq", { ascending: false })
    .limit(50)
  return (data ?? []).map((r) => ({
    id: String(r.id),
    kind: String(r.kind),
    label: String(r.label),
    amount: Number(r.amount),
    balanceAfter: Number(r.balance_after),
    createdAt: String(r.created_at),
  }))
}

/**
 * Whether the player may use Akun Latihan: the game sessions are done, or
 * they already have an account (so resetting game progress never locks
 * anyone out of an account they opened). Null hint = open.
 */
export const getAccess = cache(async (userId: string) => {
  const unlock = await getUnlock(userId)
  if (unlock.unlocked) return { open: true, unlock }
  const supabase = await createClient()
  const { count } = await supabase.from("demo_accounts").select("id", { count: "exact", head: true }).eq("user_id", userId)
  return { open: (count ?? 0) > 0, unlock }
})

/**
 * The gate for the tabs beside Akun and Trading (Jurnal, Riwayat, Kalkulator,
 * Tips Rex): unlocked, with at least one account, active or not. Null sends
 * the player back to /akun-latihan, which shows the step they're on.
 */
export async function sectionState(userId: string): Promise<DemoState | null> {
  const [access, state] = await Promise.all([getAccess(userId), loadDemoState(userId)])
  return state.ready && access.open && state.accountCount > 0 ? state : null
}
