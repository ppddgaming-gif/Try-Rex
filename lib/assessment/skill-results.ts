import "server-only"
import { keyOf } from "@/lib/assessment/data"
import type { Report } from "@/lib/assessment/report"
import { assessmentSamples } from "@/lib/assessment/skills"
import type { PackageId } from "@/lib/assessment/types"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

/**
 * A finished package's skill results, saved to the signed-in player's
 * account for the dashboard's meters. A run is credited once (the unique
 * (run_id, item_id, skill)), to whoever asks for its report while signed in;
 * guests save nothing. Never fails the report: a missing table or a database
 * error is logged and skipped.
 */
export async function saveSkillResults(runId: string, pkg: PackageId, report: Report) {
  try {
    const {
      data: { user },
    } = await (await createClient()).auth.getUser()
    if (!user) return
    const kindOf = (id: string) => {
      const key = keyOf(pkg, id)
      return key?.type === "scenario" ? key.kind : null
    }
    const rows = assessmentSamples(report, kindOf).map((s) => ({ user_id: user.id, run_id: runId, package_id: pkg, item_id: s.item, skill: s.skill, value: s.value }))
    if (!rows.length) return
    const { error } = await createAdminClient().from("assessment_skill_results").upsert(rows, { onConflict: "run_id,item_id,skill", ignoreDuplicates: true })
    if (error) console.error("Asesmen: could not save the skill results", error.message)
  } catch (e) {
    console.error("Asesmen: could not save the skill results", e)
  }
}
