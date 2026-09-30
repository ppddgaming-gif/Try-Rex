import { checkLessonAnswer, isLessonId } from "@/lib/demo/lessons"
import { authed, json } from "@/lib/demo/route"
import { getAccess } from "@/lib/demo/server"
import { createAdminClient } from "@/lib/supabase/admin"

/**
 * POST { lesson, answer }: checks a lesson's question here, where the answer
 * key lives. A right answer to the intro lesson unlocks the first trade.
 */
export async function POST(request: Request) {
  const auth = await authed(request)
  if (!auth.ok) return auth.response

  const { lesson, answer } = auth.body
  if (!isLessonId(lesson) || typeof answer !== "number") return json({ error: "Jawaban tidak valid." }, 400)

  const access = await getAccess(auth.userId)
  if (!access.open) return json({ error: access.unlock.hint }, 403)

  const result = checkLessonAnswer(lesson, answer)
  if (result.correct && lesson === "intro") {
    const admin = createAdminClient()
    const { error } = await admin
      .from("demo_profile")
      .upsert({ user_id: auth.userId, intro_lesson_passed_at: new Date().toISOString() }, { onConflict: "user_id" })
    if (error) return json({ error: "Gagal menyimpan. Coba lagi sebentar lagi." }, 500)
  }

  return json(result)
}
