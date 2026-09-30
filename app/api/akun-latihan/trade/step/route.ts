import { authed, respond } from "@/lib/demo/route"
import { step } from "@/lib/demo/trading"

/**
 * POST {}: play the next candle (also WAIT). The server fills SL/TP, swap and
 * stop out, and the response carries candles up to the new one only.
 */
export async function POST(request: Request) {
  const auth = await authed(request)
  if (!auth.ok) return auth.response
  return respond(await step(auth.userId))
}
