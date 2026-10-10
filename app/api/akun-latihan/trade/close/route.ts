import { authed, errorJson, isUuid, respond } from "@/lib/demo/route"
import { msg } from "@/lib/i18n/translator"
import { closeLive } from "@/lib/live/engine"

/** POST { trade }: close the open position now, at the server's price. */
export async function POST(request: Request) {
  const auth = await authed(request)
  if (!auth.ok) return auth.response
  const { trade } = auth.body
  if (!isUuid(trade)) return errorJson(msg("errors.unknownTrade"), 400)
  return respond(await closeLive(auth.userId, trade))
}
