import { authed, errorJson, json } from "@/lib/demo/route"
import { msg } from "@/lib/i18n/translator"
import { loadDesk } from "@/lib/live/desk"
import { liveQuote, liveView, syncLive } from "@/lib/live/engine"

/**
 * POST { pair?, timeframe?, drawings? }: the live screen's state. Every call
 * first replays the account up to now (SL/TP, market close), then returns the
 * chart (candles up to now only, relative times), the trading view, the
 * order panel's bid/ask and, with `drawings: true`, the pair's drawings. The
 * screen polls this; switching pair or timeframe asks for drawings too.
 */
export async function POST(request: Request) {
  const auth = await authed(request)
  if (!auth.ok) return auth.response
  try {
    const synced = await syncLive(auth.userId)
    if (synced === null) return errorJson(msg("errors.noActive"), 404)
    if (synced === "not-ready") return errorJson(msg("errors.liveNotReady"), 503)
    const desk = await loadDesk(auth.userId, synced, {
      pair: auth.body.pair,
      timeframe: auth.body.timeframe,
      drawings: auth.body.drawings === true,
    })
    const [view, quote] = await Promise.all([liveView(synced), liveQuote(synced, desk.pair)])
    return json({ ...desk, view, quote })
  } catch (e) {
    console.error("Akun Latihan: live chart failed", e)
    return errorJson(msg("errors.chartLoadFailed"), 500)
  }
}
