import { getTranslations } from "next-intl/server"
import { llmConfigured } from "@/lib/ai/groq"
import { evaluateJournals } from "@/lib/demo/evaluation-server"
import type { Refusal } from "@/lib/demo/evaluation"
import { authed, isUuid, json } from "@/lib/demo/route"

const STATUS: Record<Refusal, number> = {
  empty: 400,
  tooMany: 400,
  notFound: 404,
  evaluated: 409,
  incomplete: 409,
  mixedMonths: 400,
  limit: 429,
  aiFailed: 502,
  aiBusy: 503,
  unconfigured: 503,
}

/**
 * POST { journals: [trade ids] }: AI Evaluation of the player's journal
 * entries, all from one month. Every check runs here (the month, one
 * evaluation per entry, written enough, the daily limit); the model is called
 * only then, and results are saved only when the reply is complete. A failed
 * call saves nothing and doesn't count toward the limit.
 */
export async function POST(request: Request) {
  const auth = await authed(request)
  if (!auth.ok) return auth.response
  const t = await getTranslations("evaluation.errors")
  const refuse = (refusal: Refusal, resetAt?: string) => json({ error: t(refusal), code: refusal, resetAt: resetAt ?? null }, STATUS[refusal])

  const ids = auth.body.journals
  if (!Array.isArray(ids) || !ids.every(isUuid)) return refuse("empty")
  if (!llmConfigured()) return refuse("unconfigured")

  try {
    const result = await evaluateJournals(auth.userId, ids as string[])
    if (result === "not-ready") return json({ error: t("notReady"), code: "notReady", resetAt: null }, 503)
    if (!result.ok) return refuse(result.refusal, result.resetAt)
    return json({ evaluated: result.evaluated, runsLeft: result.runsLeft })
  } catch (e) {
    console.error(e)
    return json({ error: t("saveFailed"), code: "saveFailed", resetAt: null }, 500)
  }
}
