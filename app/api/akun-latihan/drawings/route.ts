import { authed, errorJson, json } from "@/lib/demo/route"
import { msg } from "@/lib/i18n/translator"
import { isLivePair } from "@/lib/live/config"
import { saveDrawings } from "@/lib/live/desk"

/** POST { pair, drawings }: replaces that pair's drawings. Never scored. */
export async function POST(request: Request) {
  const auth = await authed(request)
  if (!auth.ok) return auth.response
  const { pair, drawings } = auth.body
  if (!isLivePair(pair) || !Array.isArray(drawings)) return errorJson(msg("errors.badLines"), 400)
  const result = await saveDrawings(auth.userId, pair, drawings)
  if (!result.ok) return errorJson(msg(result.status === 404 ? "errors.noActive" : "errors.linesFailed"), result.status)
  return json({ ok: true })
}
