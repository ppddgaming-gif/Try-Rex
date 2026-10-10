import { LINES } from "@/lib/demo/config"
import { authed, errorJson, isUuid, json } from "@/lib/demo/route"
import { saveLines } from "@/lib/demo/trading"
import { msg } from "@/lib/i18n/translator"

/** POST { session, prices }: the horizontal lines drawn on this chart. Saved per segment, never scored. */
export async function POST(request: Request) {
  const auth = await authed(request)
  if (!auth.ok) return auth.response
  const { session, prices } = auth.body
  if (
    !isUuid(session) ||
    !Array.isArray(prices) ||
    prices.length > LINES.MAX_PER_SEGMENT ||
    !prices.every((p) => typeof p === "number" && Number.isFinite(p) && p > 0)
  ) {
    return errorJson(msg("errors.badLines"), 400)
  }
  const result = await saveLines(auth.userId, session, prices as number[])
  return "ok" in result ? json({ ok: true }) : errorJson(result.error, result.status)
}
