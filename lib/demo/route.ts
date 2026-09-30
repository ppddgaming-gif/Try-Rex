import "server-only"
import { createClient } from "@/lib/supabase/server"

// Shared plumbing for the Akun Latihan route handlers.

export const json = (body: unknown, status = 200) => Response.json(body, { status })

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
