import { NextResponse } from "next/server"
import { BANK } from "@/lib/learn/exam/bank"
import { buildExam, gradeExam, publicExam } from "@/lib/learn/exam/engine"
import { issuePaper, readPaper } from "@/lib/learn/exam/token"
import type { LevelId } from "@/lib/learn/types"

/**
 * POST { action: "start", level } → { token, questions } (no answers).
 * POST { action: "submit", token, answers } → the graded result, with the
 * right answers and explanations, only after the player has committed.
 * Open to guests: Belajar 101 is. Grading happens here, never in the browser.
 */
export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json({ error: "json" }, { status: 415 })
  }
  let body: { action?: unknown; level?: unknown; token?: unknown; answers?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "json" }, { status: 400 })
  }

  if (body.action === "start") {
    const level = Number(body.level)
    if (!Number.isInteger(level) || level < 1 || level > 6) return NextResponse.json({ error: "level" }, { status: 400 })
    const { paper, token } = issuePaper(level as LevelId)
    return NextResponse.json({ token, level, questions: publicExam(buildExam(BANK[paper.level], paper.seed)) })
  }

  if (body.action === "submit") {
    const paper = readPaper(body.token)
    if (!paper) return NextResponse.json({ error: "expired" }, { status: 410 })
    const result = gradeExam(buildExam(BANK[paper.level], paper.seed), body.answers)
    return NextResponse.json({ level: paper.level, ...result })
  }

  return NextResponse.json({ error: "action" }, { status: 400 })
}
