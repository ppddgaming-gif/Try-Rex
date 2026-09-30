import { authed, json } from "@/lib/demo/route"
import { isTipId } from "@/lib/demo/tips"
import { createAdminClient } from "@/lib/supabase/admin"

/** POST { tip }: records that the player has seen a Rex tip. Idempotent. */
export async function POST(request: Request) {
  const auth = await authed(request)
  if (!auth.ok) return auth.response

  const { tip } = auth.body
  if (!isTipId(tip)) return json({ error: "Tip tidak dikenal." }, 400)

  const admin = createAdminClient()
  const { error } = await admin
    .from("demo_tips_seen")
    .upsert({ user_id: auth.userId, tip_id: tip }, { onConflict: "user_id,tip_id", ignoreDuplicates: true })
  if (error) return json({ error: "Gagal menyimpan." }, 500)

  return json({ ok: true })
}
