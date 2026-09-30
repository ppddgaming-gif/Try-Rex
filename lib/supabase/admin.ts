import "server-only"
import { createClient } from "@supabase/supabase-js"

/**
 * Service-role client: bypasses RLS. The only writer for Akun Latihan tables
 * (non-negotiable #2). Import it from route handlers and server-only modules,
 * never from anything a client component can reach; `server-only` makes the
 * build fail if that ever happens. Always pass an explicit user_id: this
 * client has no idea who is signed in.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set")
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}
