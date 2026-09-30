import { ACCOUNT } from "@/lib/demo/config"
import { authed, json } from "@/lib/demo/route"
import { getAccess } from "@/lib/demo/server"
import { createAdminClient } from "@/lib/supabase/admin"

/**
 * POST: open Akun #1 (phase C adds later accounts). The server checks the
 * unlock itself and takes the starting balance from its own config: nothing
 * about money comes from the request.
 */
export async function POST(request: Request) {
  const auth = await authed(request)
  if (!auth.ok) return auth.response

  const access = await getAccess(auth.userId)
  if (!access.open) return json({ error: access.unlock.hint }, 403)

  const admin = createAdminClient()
  const existing = await admin
    .from("demo_accounts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", auth.userId)
  if (existing.error) return json({ error: "Akun Latihan belum siap di server." }, 503)
  // Phase A opens the first account only. Starting again after running out
  // (phase C) will come with its review and lesson.
  if ((existing.count ?? 0) > 0) return json({ error: "Kamu sudah punya Akun Latihan." }, 409)

  const { data, error } = await admin.rpc("demo_open_account", {
    p_user: auth.userId,
    p_balance: ACCOUNT.STARTING_BALANCE,
  })
  if (error) return json({ error: "Gagal membuat akun. Coba lagi sebentar lagi." }, 500)

  return json({ ok: true, number: (data as { number: number }).number })
}
