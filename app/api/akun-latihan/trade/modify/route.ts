import { authed, isUuid, json, numberOrNull, respond } from "@/lib/demo/route"
import { modifyTrade } from "@/lib/demo/trading"

/**
 * POST { trade, field: "sl" | "tp", pips }: move SL or TP, in pips from
 * entry (null removes it). Every change is kept.
 */
export async function POST(request: Request) {
  const auth = await authed(request)
  if (!auth.ok) return auth.response
  const { trade, field, pips } = auth.body
  const distance = numberOrNull(pips)
  if (!isUuid(trade) || (field !== "sl" && field !== "tp") || distance === undefined) {
    return json({ error: "Format perubahan tidak valid." }, 400)
  }
  return respond(await modifyTrade(auth.userId, trade, field, distance))
}
