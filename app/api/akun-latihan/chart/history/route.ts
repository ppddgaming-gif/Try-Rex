import { authed, errorJson, json } from "@/lib/demo/route"
import { msg } from "@/lib/i18n/translator"
import { RANGES, dataTime, rangeIndex } from "@/lib/live/clock"
import { CHART, TIMEFRAME_SECONDS, isLivePair, isTimeframe } from "@/lib/live/config"
import { syncLive } from "@/lib/live/engine"
import { chartHistory } from "@/lib/live/store"

/**
 * POST { pair, timeframe, before }: older candles for a player panning back.
 * `before` is the real time of the oldest candle the screen has; the answer
 * is up to CHART.HISTORY_BATCH closed candles opening before it, relative to
 * now like every other candle. Never anything after now, never before the
 * start of the account's clean range (the chart's history stays inside it,
 * like LIVE.LEAD_WEEKS intends), and never more than about CHART.HISTORY_MAX
 * candles back.
 */
export async function POST(request: Request) {
  const auth = await authed(request)
  if (!auth.ok) return auth.response
  const { pair, timeframe, before } = auth.body
  if (!isLivePair(pair) || !isTimeframe(timeframe) || typeof before !== "number" || !Number.isFinite(before)) {
    return errorJson(msg("errors.badRequest"), 400)
  }
  try {
    const synced = await syncLive(auth.userId)
    if (synced === null) return errorJson(msg("errors.noActive"), 404)
    if (synced === "not-ready") return errorJson(msg("errors.liveNotReady"), 503)
    const offset = synced.clock.offsetWeeks
    const now = dataTime(synced.real, offset)
    const step = TIMEFRAME_SECONDS[timeframe]
    const range = RANGES[rangeIndex(now)]
    // Weekends and holidays stretch the calendar: 1.6× covers them, as the chart's own read does.
    const deepest = now - Math.ceil(CHART.HISTORY_MAX * step * 1.6)
    const floor = Math.max(range ? range.from : now, deepest)
    const slice = await chartHistory(now, dataTime(Math.floor(before), offset), floor, pair, timeframe, CHART.HISTORY_BATCH)
    return json({ pair, timeframe, anchor: synced.real, ...slice })
  } catch (e) {
    console.error("Akun Latihan: chart history failed", e)
    return errorJson(msg("errors.chartLoadFailed"), 500)
  }
}
