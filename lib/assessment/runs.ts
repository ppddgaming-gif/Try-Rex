import "server-only"
import { createAdminClient } from "@/lib/supabase/admin"
import { RUN_TTL_SECONDS } from "@/lib/assessment/token"
import { isPackageId, type RunState } from "@/lib/assessment/types"

// Asesmen runs as the server keeps them (assessment_runs, service role only).
// Every change is saved with a version check, so two requests acting on the
// same state (a double tap, a second tab) can't both land.

export type StoredRun = { id: string; version: number; state: RunState }

/** A thrown error means the table is missing or the database is unreachable. */
export async function createRun(state: RunState): Promise<StoredRun> {
  const db = createAdminClient()
  // Runs older than any token that could still name them.
  const cutoff = new Date((state.iat - 2 * RUN_TTL_SECONDS) * 1000).toISOString()
  await db.from("assessment_runs").delete().lt("created_at", cutoff)
  const { data, error } = await db.from("assessment_runs").insert({ package_id: state.p, state }).select("id, version").single()
  if (error || !data) throw new Error(`Asesmen: could not start a run (${error?.message})`)
  return { id: data.id, version: data.version, state }
}

/** The run, or null when there is no such row. */
export async function loadRun(id: string): Promise<StoredRun | null> {
  const { data, error } = await createAdminClient().from("assessment_runs").select("id, version, state").eq("id", id).maybeSingle()
  if (error) throw new Error(`Asesmen: could not load the run (${error.message})`)
  const state = data?.state as RunState | undefined
  if (!data || !state || state.v !== 1 || !isPackageId(state.p)) return null
  return { id: data.id, version: data.version, state }
}

/** Saves `next` over `run`, or returns null when the run changed since it was loaded. */
export async function saveRun(run: StoredRun, next: RunState): Promise<StoredRun | null> {
  const { data, error } = await createAdminClient()
    .from("assessment_runs")
    .update({ state: next, version: run.version + 1, updated_at: new Date().toISOString() })
    .eq("id", run.id)
    .eq("version", run.version)
    .select("version")
    .maybeSingle()
  if (error) throw new Error(`Asesmen: could not save the run (${error.message})`)
  return data ? { id: run.id, version: data.version, state: next } : null
}
