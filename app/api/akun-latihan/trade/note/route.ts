import { authed, isUuid, json } from "@/lib/demo/route"
import { saveNote } from "@/lib/demo/trading"

/**
 * POST { trade, note }: "Tambah catatan" in the journal, on any closed trade
 * of the player's. An empty note removes it. Never scored.
 */
export async function POST(request: Request) {
  const auth = await authed(request)
  if (!auth.ok) return auth.response
  const { trade, note } = auth.body
  if (!isUuid(trade) || (note != null && typeof note !== "string")) {
    return json({ error: "Format catatan tidak valid." }, 400)
  }
  const result = await saveNote(auth.userId, trade, (note as string | null | undefined) ?? null)
  return "error" in result ? json({ error: result.error }, result.status) : json(result)
}
