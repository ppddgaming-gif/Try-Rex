import { closeAccount, openAccount } from "@/lib/demo/accounts"
import { authed, errorJson, json } from "@/lib/demo/route"
import { getAccess } from "@/lib/demo/server"
import { msg } from "@/lib/i18n/translator"

/**
 * POST { action }:
 * - "open" (the default): Akun #1, or the next account once the last one is
 *   closed (and, after running out, the risk lesson is passed);
 * - "close": end an account that has run out ("habis"), checked here;
 * - "reset": end the active account by choice.
 * The server checks the unlock itself and takes the starting balance from its
 * own config: nothing about money comes from the request.
 */
export async function POST(request: Request) {
  const auth = await authed(request)
  if (!auth.ok) return auth.response

  const access = await getAccess(auth.userId)
  if (!access.open) return errorJson(msg("unlock.hint", { needed: access.unlock.needed, sessions: access.unlock.sessions }), 403)

  const action = auth.body.action ?? "open"
  const result =
    action === "open"
      ? await openAccount(auth.userId)
      : action === "close"
        ? await closeAccount(auth.userId, "habis")
        : action === "reset"
          ? await closeAccount(auth.userId, "reset")
          : null
  if (!result) return errorJson(msg("errors.invalid"), 400)
  return "error" in result ? errorJson(result.error, result.status) : json(result)
}
