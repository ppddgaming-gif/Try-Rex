import { timingSafeEqual } from "node:crypto"
import { reevaluateStale } from "@/lib/demo/evaluation-server"

/**
 * Internal: after PROMPT_VERSION changes, evaluate older journal evaluations
 * again with the new prompt and replace them. Not for players: it needs the
 * ADMIN_SECRET env var in the `x-admin-secret` header, and answers 404 when
 * the secret isn't set. Each call handles up to `batches` groups (default 3);
 * call again while the response says `more: true`.
 *
 *   curl -X POST https://<site>/api/admin/reevaluate -H "x-admin-secret: $ADMIN_SECRET" -d '{"batches":3}'
 */
export async function POST(request: Request) {
  const secret = process.env.ADMIN_SECRET
  if (!secret) return new Response(null, { status: 404 })
  const given = request.headers.get("x-admin-secret") ?? ""
  const a = Buffer.from(given)
  const b = Buffer.from(secret)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return new Response(null, { status: 404 })

  let batches = 3
  try {
    const body = (await request.json()) as { batches?: unknown }
    if (typeof body.batches === "number" && Number.isInteger(body.batches)) batches = Math.min(20, Math.max(1, body.batches))
  } catch {}
  return Response.json(await reevaluateStale(batches))
}
