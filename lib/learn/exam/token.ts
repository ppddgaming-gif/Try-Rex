import "server-only"
import { createHmac, randomInt, timingSafeEqual } from "node:crypto"
import { EXAM } from "@/lib/learn/exam/engine"
import type { LevelId } from "@/lib/learn/types"

// A dealt paper, carried by the browser between "start" and "submit": the
// level, the seed and when it was dealt, signed so it can't be altered. The
// server rebuilds the paper from the seed to grade it; the answers are never
// in the token.

export type Paper = { level: LevelId; seed: number; issued: number }

function secret() {
  const s = process.env.LEARN_EXAM_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (s) return `learn-exam:${s}`
  if (process.env.NODE_ENV === "production") throw new Error("Belajar exam: no signing secret")
  return "learn-exam:development-only"
}

const sign = (body: string) => createHmac("sha256", secret()).update(body).digest("base64url")

export function issuePaper(level: LevelId, now = Math.floor(Date.now() / 1000)): { paper: Paper; token: string } {
  const paper: Paper = { level, seed: randomInt(0, 2 ** 32 - 1), issued: now }
  const body = Buffer.from(JSON.stringify(paper)).toString("base64url")
  return { paper, token: `${body}.${sign(body)}` }
}

/** The paper in `token`, or null when it's altered, malformed or expired. */
export function readPaper(token: unknown, now = Math.floor(Date.now() / 1000)): Paper | null {
  if (typeof token !== "string" || token.length > 400) return null
  const [body, mac] = token.split(".")
  if (!body || !mac) return null
  const expected = Buffer.from(sign(body))
  const given = Buffer.from(mac)
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null
  try {
    const p = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as Paper
    const okLevel = Number.isInteger(p.level) && p.level >= 1 && p.level <= 6
    const okTime = Number.isInteger(p.issued) && now - p.issued >= 0 && now - p.issued <= EXAM.TTL_SECONDS
    return okLevel && okTime && Number.isInteger(p.seed) ? p : null
  } catch {
    return null
  }
}
