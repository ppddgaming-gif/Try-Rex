import "server-only"
import { createClient } from "@/lib/supabase/server"

// Shared plumbing for the Akun Latihan route handlers.

export const json = (body: unknown, status = 200) => Response.json(body, { status })

/**
 * A trading action's outcome as a response: the new view, or the refusal in
 * words (with the current view, when there is one, so the screen catches up).
 */
export const respond = (result: { view: unknown } | { error: string; status: number; view?: unknown }) =>
  "error" in result
    ? json({ error: result.error, view: result.view ?? null }, result.status)
    : json({ view: result.view })

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
    return { ok: false, response: json({ error: "Format permintaan tidak valid." }, 415) }
  }
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, response: json({ error: "Masuk dulu untuk memakai Akun Latihan." }, 401) }

  let body: unknown = {}
  try {
    body = await request.json()
  } catch {
    return { ok: false, response: json({ error: "Format permintaan tidak valid." }, 400) }
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, response: json({ error: "Format permintaan tidak valid." }, 400) }
  }
  return { ok: true, userId: user.id, body: body as Record<string, unknown> }
}
