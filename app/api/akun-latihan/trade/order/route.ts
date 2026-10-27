import { authed, errorJson, respond } from "@/lib/demo/route"
import { msg } from "@/lib/i18n/translator"
import { isLivePair } from "@/lib/live/config"
import { placeLiveOrder } from "@/lib/live/engine"
import { parseOrderBody } from "@/lib/live/execute"

/**
 * POST { pair, side, lot, slPips, tpPips, reasons }: a market order on the
 * live chart. The fill price is the server's (the bid now, plus the spread
 * for a BUY), as are costs, margin and risk; a body carrying any other field
 * is refused.
 */
export async function POST(request: Request) {
  const auth = await authed(request)
  if (!auth.ok) return auth.response
  const order = parseOrderBody(auth.body)
  if (!order || !isLivePair(order.pair)) return errorJson(msg("errors.badOrder"), 400)
  return respond(await placeLiveOrder(auth.userId, order.pair, order.input))
}
