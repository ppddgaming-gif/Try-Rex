import { authed, errorJson, json } from "@/lib/demo/route"
import { msg } from "@/lib/i18n/translator"
import { isLivePair } from "@/lib/live/config"
import { saveDrawings } from "@/lib/live/desk"
import { syncLive } from "@/lib/live/engine"

/** POST { pair, drawings, anchor }: replaces that pair's drawings (times relative to `anchor`). Never scored. */
export async function POST(request: Request) {
  const auth = await authed(request)
  if (!auth.ok) return auth.response
  const { pair, drawings, anchor } = auth.body
  if (!isLivePair(pair) || !Array.isArray(drawings)) return errorJson(msg("errors.badLines"), 400)
  const synced = await syncLive(auth.userId).catch(() => "not-ready" as const)
  if (synced === null) return errorJson(msg("errors.noActive"), 404)
  if (synced === "not-ready") return errorJson(msg("errors.liveNotReady"), 503)
  const result = await saveDrawings(auth.userId, synced, pair, drawings, anchor)
  if (!result.ok) return errorJson(msg("errors.linesFailed"), result.status)
  return json({ ok: true })
}
