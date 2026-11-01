import "server-only"
import { createHmac, timingSafeEqual } from "node:crypto"

// The browser's handle on a run: which run (a row in assessment_runs, see
// runs.ts) and when it started, signed so it can't be altered. The state
// itself stays on the server, so an old token is the same run as it is now
// and can't undo a decision. Nothing in it is an answer key.

export const RUN_TTL_SECONDS = 24 * 60 * 60
const MAX_TOKEN = 512
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

export type RunToken = { v: 2; r: string; iat: number }

function secret() {
  const s = process.env.LEARN_EXAM_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (s) return `assessment-run:${s}`
  if (process.env.NODE_ENV === "production") throw new Error("Assessment: no signing secret")
  return "assessment-run:development-only"
}

const sign = (body: string) => createHmac("sha256", secret()).update(body).digest("base64url")

export function issueRun(runId: string, iat: number) {
  const body = Buffer.from(JSON.stringify({ v: 2, r: runId, iat } satisfies RunToken)).toString("base64url")
  return `${body}.${sign(body)}`
}

/** The run `token` names, or null when it's altered, malformed or expired. */
export function readRun(token: unknown, now = Math.floor(Date.now() / 1000)): RunToken | null {
  if (typeof token !== "string" || token.length > MAX_TOKEN) return null
  const [body, mac] = token.split(".")
  if (!body || !mac) return null
  const expected = Buffer.from(sign(body))
  const given = Buffer.from(mac)
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null
  try {
    const t = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as RunToken
    const fresh = Number.isInteger(t.iat) && now - t.iat >= 0 && now - t.iat <= RUN_TTL_SECONDS
    return t.v === 2 && typeof t.r === "string" && UUID.test(t.r) && fresh ? t : null
  } catch {
    return null
  }
}
