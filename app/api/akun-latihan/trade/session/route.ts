import { authed, respond } from "@/lib/demo/route"
import { startSession } from "@/lib/demo/trading"

/** POST {}: a new chart ("Ganti chart", or the first one). Refused while a trade is open. */
export async function POST(request: Request) {
  const auth = await authed(request)
  if (!auth.ok) return auth.response
  return respond(await startSession(auth.userId))
}
