import "server-only"
import { getTranslations } from "next-intl/server"
import { msg, say, type Msg } from "@/lib/i18n/translator"
import { createClient } from "@/lib/supabase/server"

// Shared plumbing for the Akun Latihan route handlers.

export const json = (body: unknown, status = 200) => Response.json(body, { status })

/**
 * A refusal as a response, in the player's language. `m` is a key in the demo
 * catalogue ("errors.badOrder"). With `view`, the screen can catch up.
 */
export async function errorJson(m: Msg, status: number, view?: unknown) {
  const t = await getTranslations("demo")
  return json(view === undefined ? { error: say(t, m) } : { error: say(t, m), view }, status)
}

/**
 * A trading action's outcome as a response: the new view, or the refusal in
 * words (with the current view, when there is one, so the screen catches up).
 */
export const respond = (result: { view: unknown } | { error: Msg; status: number; view?: unknown }) =>
  "error" in result ? errorJson(result.error, result.status, result.view ?? null) : json({ view: result.view })

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
export const isUuid = (v: unknown): v is string => typeof v === "string" && UUID.test(v)

/** A finite number, null, or undefined when the value is neither (invalid input). */
export function numberOrNull(v: unknown): number | null | undefined {
  if (v === null) return null
  return typeof v === "number" && Number.isFinite(v) ? v : undefined
}

/**
 * The signed-in user and the parsed JSON body, or an error response.
 * Only JSON is accepted: a cross-site HTML form can't send it, so the
 * session cookie alone can't be used to post here from another site.
 */
export async function authed(request: Request): Promise<
  { ok: true; userId: string; body: Record<string, unknown> } | { ok: false; response: Response }
> {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return { ok: false, response: await errorJson(msg("errors.badRequest"), 415) }
  }
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, response: await errorJson(msg("errors.signIn"), 401) }

  let body: unknown = {}
  try {
    body = await request.json()
  } catch {
    return { ok: false, response: await errorJson(msg("errors.badRequest"), 400) }
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, response: await errorJson(msg("errors.badRequest"), 400) }
  }
  return { ok: true, userId: user.id, body: body as Record<string, unknown> }
}
