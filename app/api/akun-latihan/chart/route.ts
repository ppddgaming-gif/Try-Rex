import { authed, errorJson, json } from "@/lib/demo/route"
import { msg } from "@/lib/i18n/translator"
import { loadDesk } from "@/lib/live/desk"

/**
 * POST { pair?, timeframe? }: the chart (closed candles before the account's
 * "now", relative times only) and the player's drawings for that pair. The
 * choice is remembered on the account.
 */
export async function POST(request: Request) {
  const auth = await authed(request)
  if (!auth.ok) return auth.response
  const desk = await loadDesk(auth.userId, auth.body.pair, auth.body.timeframe).catch(() => undefined)
  if (desk === undefined) return errorJson(msg("errors.chartLoadFailed"), 500)
  if (!desk) return errorJson(msg("errors.noActive"), 404)
  return json(desk)
}
