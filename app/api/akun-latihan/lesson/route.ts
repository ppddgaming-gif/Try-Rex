import { getTranslations } from "next-intl/server"
import { checkLessonAnswer, isLessonId } from "@/lib/demo/lessons"
import { authed, errorJson, json } from "@/lib/demo/route"
import { getAccess } from "@/lib/demo/server"
import { msg } from "@/lib/i18n/translator"
import { createAdminClient } from "@/lib/supabase/admin"

/**
 * POST { lesson, answer }: checks a lesson's question here, where the answer
 * key lives. A right answer to the intro lesson unlocks the first trade; to
 * the risk lesson, the next account after one ran out.
 */
export async function POST(request: Request) {
  const auth = await authed(request)
  if (!auth.ok) return auth.response

  const { lesson, answer } = auth.body
  if (!isLessonId(lesson) || typeof answer !== "number") return errorJson(msg("errors.badAnswer"), 400)

  const access = await getAccess(auth.userId)
  if (!access.open) return errorJson(msg("unlock.hint", { needed: access.unlock.needed, sessions: access.unlock.sessions }), 403)

  const result = checkLessonAnswer(lesson, answer, await getTranslations("demo.lessons"))
  if (result.correct && lesson === "intro") {
    const admin = createAdminClient()
    const { error } = await admin
      .from("demo_profile")
      .upsert({ user_id: auth.userId, intro_lesson_passed_at: new Date().toISOString() }, { onConflict: "user_id" })
    if (error) return errorJson(msg("errors.saveFailed"), 500)
  }
  if (result.correct && lesson === "risk") {
    const { error } = await createAdminClient()
      .from("demo_profile")
      .update({ recovery_lesson_due: false })
      .eq("user_id", auth.userId)
    if (error) return errorJson(msg("errors.saveFailed"), 500)
  }

  return json(result)
}
