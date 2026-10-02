import "server-only"
import { ACCOUNT } from "@/lib/demo/config"
import { accountBust } from "@/lib/demo/state"
import { loadTrading } from "@/lib/demo/trading"
import { createAdminClient } from "@/lib/supabase/admin"

// The life of an account: Akun #1, running out ("habis") or a reset, then the
// next one. There is no way to add money: a new account is the only way to a
// new balance, and after running out it waits for the risk lesson.

export type AccountResult = { ok: true; number?: number } | { error: string; status: number }

/** PostgREST's answer when a function isn't in the database (its migration not run yet). */
const missingFunction = (e: { code?: string; message?: string }) =>
  e.code === "PGRST202" || /could not find the function/i.test(e.message ?? "")

/**
 * Opens the next account: Akun #1, or Akun #n once the last one is closed
 * and, if it ran out, the risk lesson has been passed. The starting balance
 * is the server's config; nothing about money comes from the request.
 */
export async function openAccount(userId: string): Promise<AccountResult> {
  const admin = createAdminClient()
  const [accounts, profile] = await Promise.all([
    admin.from("demo_accounts").select("status").eq("user_id", userId),
    admin.from("demo_profile").select("recovery_lesson_due").eq("user_id", userId).maybeSingle(),
  ])
  if (accounts.error || profile.error) return { error: "Akun Latihan belum siap di server.", status: 503 }
  if ((accounts.data ?? []).some((a) => a.status === "active")) {
    return { error: "Kamu masih punya Akun Latihan yang aktif.", status: 409 }
  }
  if (profile.data?.recovery_lesson_due) return { error: "Selesaikan materi risiko dulu.", status: 409 }

  const { data, error } = await admin.rpc("demo_open_account", { p_user: userId, p_balance: ACCOUNT.STARTING_BALANCE })
  if (error) {
    if (error.message.includes("demo_lesson_due")) return { error: "Selesaikan materi risiko dulu.", status: 409 }
    return { error: "Gagal membuat akun. Coba lagi sebentar lagi.", status: 500 }
  }
  return { ok: true, number: (data as { number: number }).number }
}

/**
 * Closes the active account: "habis" once it has run out (the server checks;
 * the risk lesson becomes due), or "reset" by the player's choice. Refused
 * while a trade is open.
 */
export async function closeAccount(userId: string, reason: "habis" | "reset"): Promise<AccountResult> {
  const loaded = await loadTrading(userId)
  if (!loaded) return { error: "Tidak ada akun aktif.", status: 404 }
  const { state } = loaded
  if (state.open.length > 0) return { error: "Tutup trade yang terbuka dulu.", status: 409 }
  if (reason === "habis" && !accountBust(state)) return { error: "Akun ini belum habis.", status: 409 }

  const { error } = await createAdminClient().rpc("demo_close_account", {
    p_user: userId,
    p_account: state.account.id,
    p_version: state.account.version,
    p_status: reason,
  })
  if (error) {
    if (missingFunction(error)) return { error: "Fitur ini menunggu pembaruan database Akun Latihan.", status: 503 }
    if (error.message.includes("demo_stale")) return { error: "Akunmu baru saja berubah. Coba lagi.", status: 409 }
    if (error.message.includes("demo_open_trades")) return { error: "Tutup trade yang terbuka dulu.", status: 409 }
    console.error("Akun Latihan: could not close the account", error.message)
    return { error: "Gagal menutup akun. Coba lagi sebentar lagi.", status: 500 }
  }
  return { ok: true }
}
