import { authed, errorJson, isUuid, json, respond } from "@/lib/demo/route"
import { REVIEW_ANSWERS, type ReviewAnswer } from "@/lib/demo/state"
import { reviewTrade } from "@/lib/demo/trading"
import { msg } from "@/lib/i18n/translator"
import { liveView, syncLive } from "@/lib/live/engine"

/**
 * POST { trade, answer: "ya" | "sebagian" | "tidak", note? }: "Apakah kamu
 * mengikuti rencanamu?" Self-reported, shown in the journal, never scored.
 * Answers with the live screen's view.
 */
export async function POST(request: Request) {
  const auth = await authed(request)
  if (!auth.ok) return auth.response
  const { trade, answer, note } = auth.body
  if (!isUuid(trade) || !REVIEW_ANSWERS.includes(answer as ReviewAnswer) || (note != null && typeof note !== "string")) {
    return errorJson(msg("errors.badReview"), 400)
  }
  const saved = await reviewTrade(auth.userId, trade, answer as ReviewAnswer, (note as string | null | undefined) ?? null)
  if ("error" in saved) return respond(saved)
  const synced = await syncLive(auth.userId)
  if (!synced || synced === "not-ready") return json({ ok: true })
  return json({ view: await liveView(synced, []) })
}
