import { getLocale } from "next-intl/server"
import { REX_CHAT } from "@/lib/demo/config"
import { cleanQuestion } from "@/lib/demo/rex-chat"
import { askRex, loadChat } from "@/lib/demo/rex-chat-server"
import { authed, errorJson, isUuid, json } from "@/lib/demo/route"
import { isLocale } from "@/lib/i18n/locale"
import { msg } from "@/lib/i18n/translator"

/**
 * POST { trade, action: "load" | "intro" | "ask", question? }: "Tanya Rex"
 * about one closed trade. `load` returns the chat so far, `intro` asks for
 * Rex's opening explanation (once), `ask` sends a question. Answers with
 * { chat: { turns, quota } }. Never scored.
 */
export async function POST(request: Request) {
  const auth = await authed(request)
  if (!auth.ok) return auth.response
  const { trade, action, question } = auth.body
  if (!isUuid(trade) || (action !== "load" && action !== "intro" && action !== "ask")) {
    return errorJson(msg("errors.badRequest"), 400)
  }
  if (action === "load") return send(await loadChat(auth.userId, trade))

  const asked = action === "ask" ? cleanQuestion(question) : null
  if (action === "ask" && (!asked || (question as string).length > REX_CHAT.QUESTION_MAX_CHARS * 2)) {
    return errorJson(msg("errors.rexChatBadQuestion", { max: REX_CHAT.QUESTION_MAX_CHARS }), 400)
  }
  const locale = await getLocale()
  return send(await askRex(auth.userId, trade, asked, isLocale(locale) ? locale : "id"))
}

const send = (r: Awaited<ReturnType<typeof loadChat>>) => ("error" in r ? errorJson(r.error, r.status) : json({ chat: r.chat }))
