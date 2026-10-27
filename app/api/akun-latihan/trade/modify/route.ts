import { authed, errorJson, isUuid, numberOrNull, respond } from "@/lib/demo/route"
import { msg } from "@/lib/i18n/translator"
import { modifyLive } from "@/lib/live/engine"

/**
 * POST { trade, field: "sl" | "tp", pips }: move SL or TP, in pips from
 * entry. Both stay required on the live chart. Every change is kept.
 */
export async function POST(request: Request) {
  const auth = await authed(request)
  if (!auth.ok) return auth.response
  const { trade, field, pips } = auth.body
  const distance = numberOrNull(pips)
  if (!isUuid(trade) || (field !== "sl" && field !== "tp") || distance === undefined) {
    return errorJson(msg("errors.badModify"), 400)
  }
  return respond(await modifyLive(auth.userId, trade, field, distance))
}
