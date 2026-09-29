import { createClient } from "@/lib/supabase/server"

export type PublicStats = { players: number; answers: number }

/**
 * The landing page's counts, from `public_stats()` in
 * supabase/migrations/*_progress_sync.sql: confirmed accounts and answered
 * Trading Game questions. Null when Supabase can't be reached, so the page
 * shows no number rather than a wrong one.
 */
export async function getPublicStats(): Promise<PublicStats | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc("public_stats")
    if (error || !data) return null
    const { players, answers } = data as Partial<PublicStats>
    if (typeof players !== "number" || typeof answers !== "number") return null
    return { players, answers }
  } catch {
    return null
  }
}
