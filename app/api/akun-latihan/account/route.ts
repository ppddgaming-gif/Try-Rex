import { closeAccount, openAccount } from "@/lib/demo/accounts"
import { authed, json } from "@/lib/demo/route"
import { getAccess } from "@/lib/demo/server"

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
  if (!access.open) return json({ error: access.unlock.hint }, 403)

  const action = auth.body.action ?? "open"
  const result =
    action === "open"
      ? await openAccount(auth.userId)
      : action === "close"
        ? await closeAccount(auth.userId, "habis")
        : action === "reset"
          ? await closeAccount(auth.userId, "reset")
          : null
  if (!result) return json({ error: "Permintaan tidak valid." }, 400)
  return "error" in result ? json({ error: result.error }, result.status) : json(result)
}
