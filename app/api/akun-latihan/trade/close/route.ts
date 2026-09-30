import { authed, isUuid, json, respond } from "@/lib/demo/route"
import { closeTrade } from "@/lib/demo/trading"

/** POST { trade }: close an open trade at the current candle's close. */
export async function POST(request: Request) {
  const auth = await authed(request)
  if (!auth.ok) return auth.response
  const { trade } = auth.body
  if (!isUuid(trade)) return json({ error: "Trade tidak dikenal." }, 400)
  return respond(await closeTrade(auth.userId, trade))
}
