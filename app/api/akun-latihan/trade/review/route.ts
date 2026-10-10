import { authed, errorJson, isUuid, respond } from "@/lib/demo/route"
import { REVIEW_ANSWERS, type ReviewAnswer } from "@/lib/demo/state"
import { reviewTrade } from "@/lib/demo/trading"
import { msg } from "@/lib/i18n/translator"

/**
 * POST { trade, answer: "ya" | "sebagian" | "tidak", note? }: "Apakah kamu
 * mengikuti rencanamu?" Self-reported, shown in the journal, never scored.
 */
export async function POST(request: Request) {
  const auth = await authed(request)
  if (!auth.ok) return auth.response
  const { trade, answer, note } = auth.body
  if (!isUuid(trade) || !REVIEW_ANSWERS.includes(answer as ReviewAnswer) || (note != null && typeof note !== "string")) {
    return errorJson(msg("errors.badReview"), 400)
  }
  return respond(await reviewTrade(auth.userId, trade, answer as ReviewAnswer, (note as string | null | undefined) ?? null))
}
