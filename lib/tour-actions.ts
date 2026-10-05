"use server"

import { createClient } from "@/lib/supabase/server"
import { mergeSeen, parseSeen } from "@/lib/tours"

/**
 * Adds tours to the ones the signed-in player has seen (never removes any).
 * Only known tour ids are stored. Returns the full list, or null when it
 * couldn't be saved (no session, or the column doesn't exist yet), in which
 * case the device's copy still keeps the tour from showing again here.
 */
export async function markToursSeen(input: unknown): Promise<string[] | null> {
  const ids = parseSeen(input)
  if (ids.length === 0) return null

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase.from("profiles").select("tours_seen").eq("id", user.id).maybeSingle()
  if (error || !data) return null
  const current = parseSeen(data.tours_seen)
  const next = mergeSeen(current, ids)
  if (next.length === current.length) return current

  const { error: saveError } = await supabase.from("profiles").update({ tours_seen: next }).eq("id", user.id)
  return saveError ? null : next
}
