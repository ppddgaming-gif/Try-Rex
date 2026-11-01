import "server-only"
import { createHmac, timingSafeEqual } from "node:crypto"
import { isPackageId, type RunState } from "@/lib/assessment/types"

// A run carried by the browser between requests: the package, which item is
// next and every answer so far, signed so it can't be altered. Like the
// Belajar exam's paper, nothing in it is an answer key.

export const RUN_TTL_SECONDS = 24 * 60 * 60
const MAX_TOKEN = 24_000

function secret() {
  const s = process.env.LEARN_EXAM_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (s) return `assessment-run:${s}`
  if (process.env.NODE_ENV === "production") throw new Error("Assessment: no signing secret")
  return "assessment-run:development-only"
}

const sign = (body: string) => createHmac("sha256", secret()).update(body).digest("base64url")

export function issueRun(state: RunState) {
  const body = Buffer.from(JSON.stringify(state)).toString("base64url")
  return `${body}.${sign(body)}`
}

/** The run in `token`, or null when it's altered, malformed or expired. */
export function readRun(token: unknown, now = Math.floor(Date.now() / 1000)): RunState | null {
  if (typeof token !== "string" || token.length > MAX_TOKEN) return null
  const [body, mac] = token.split(".")
  if (!body || !mac) return null
  const expected = Buffer.from(sign(body))
  const given = Buffer.from(mac)
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null
  try {
    const s = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as RunState
    const fresh = Number.isInteger(s.iat) && now - s.iat >= 0 && now - s.iat <= RUN_TTL_SECONDS
    return s.v === 1 && isPackageId(s.p) && fresh && Number.isInteger(s.i) && Array.isArray(s.a) ? s : null
  } catch {
    return null
  }
}
