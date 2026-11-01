import { NextResponse } from "next/server"
import { contextBars, keyOf, playBars, publicPackage } from "@/lib/assessment/data"
import { buildReport } from "@/lib/assessment/report"
import { closeRun, decisionProblem, finishRun, startRun, stepRun } from "@/lib/assessment/sim"
import { issueRun, readRun } from "@/lib/assessment/token"
import { isPackageId, type Action, type Decision, type RunState, type ScenarioKey, type ScenarioRun } from "@/lib/assessment/types"
import { lessonBySlug } from "@/lib/learn/content"

/**
 * One assessment run, carried by the browser as a signed token. Actions:
 * start (or resume), answer (multiple choice), decide (a scenario's decision,
 * committed before Start), step (the next play candle, one at a time), close
 * (by hand, with a reason), next (finishes the scenario unseen and moves on),
 * report (only once every item is answered). Keys, the play candles and all
 * scoring stay here (non-negotiables 1–3). Open to guests, like Belajar 101.
 */

type Body = { action?: unknown; pkg?: unknown; token?: unknown; choice?: unknown; decision?: unknown; reason?: unknown }

const fail = (error: string, status = 400) => NextResponse.json({ error }, { status })
const now = () => Math.floor(Date.now() / 1000)

/** What the browser may know about the current scenario: what it has seen and its own decision. */
function scenarioView(s: RunState) {
  const pkg = publicPackage(s.p)
  const item = pkg.items[s.i]
  if (!item || item.type !== "scenario") return null
  const run = s.a[s.i] as ScenarioRun | undefined
  const shown = run ? Math.min(run.n, playBars(s.p, item.id).length) : 0
  return { context: contextBars(s.p, item.id), revealed: playBars(s.p, item.id).slice(0, shown), run: run ?? null }
}

const respond = (s: RunState, extra: Record<string, unknown> = {}) =>
  NextResponse.json({ token: issueRun(s), index: s.i, scenario: scenarioView(s), ...extra })

const ACTIONS: Action[] = ["buy", "sell", "no_trade"]

function parseDecision(v: unknown): Decision | null {
  if (!v || typeof v !== "object" || Array.isArray(v)) return null
  const o = v as Record<string, unknown>
  if (!ACTIONS.includes(o.action as Action)) return null
  if (!Array.isArray(o.reasons) || !o.reasons.every((r) => typeof r === "string")) return null
  const num = (x: unknown) => (typeof x === "number" && Number.isFinite(x) ? x : undefined)
  const d: Decision = { action: o.action as Action, reasons: o.reasons as string[] }
  if (d.action === "no_trade") return d
  return {
    ...d,
    entry: o.entry === "market" || o.entry === "pending" ? o.entry : undefined,
    price: o.entry === "pending" ? num(o.price) : undefined,
    lot: num(o.lot),
    sl: num(o.sl),
    tp: num(o.tp),
  }
}

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json")) return fail("json", 415)
  let body: Body
  try {
    body = await request.json()
  } catch {
    return fail("json")
  }

  if (body.action === "start") {
    if (!isPackageId(body.pkg)) return fail("package")
    const resumed = body.token ? readRun(body.token) : null
    if (resumed && resumed.p === body.pkg) return respond(resumed)
    return respond({ v: 1, p: body.pkg, iat: now(), i: 0, a: [] })
  }

  const s = readRun(body.token)
  if (!s) return fail("expired", 410)
  const pkg = publicPackage(s.p)
  const item = pkg.items[s.i]

  if (body.action === "report") {
    if (s.i < pkg.items.length || s.a.length < pkg.items.length) return fail("unfinished", 409)
    const report = buildReport({
      pkg,
      answers: s.a,
      keyOf: (id) => keyOf(s.p, id),
      windowOf: (id) => ({ context: contextBars(s.p, id), play: playBars(s.p, id) }),
      lessonTitle: (slug) => lessonBySlug.get(slug)?.title ?? null,
    })
    return NextResponse.json({ token: issueRun(s), index: s.i, report })
  }

  if (!item) return fail("finished", 409)

  if (body.action === "answer") {
    if (item.type === "scenario") return fail("wrong-item", 409)
    const ids = item.options.map((o) => o.id)
    const choice = body.choice
    if (!Array.isArray(choice) || !choice.every((c) => typeof c === "string" && ids.includes(c)) || new Set(choice).size !== choice.length)
      return fail("choice")
    if (choice.length === 0 || (item.type === "mcq_basic" && choice.length !== 1)) return fail("choice")
    const a = [...s.a]
    a[s.i] = { s: [...choice].sort() }
    return respond({ ...s, i: s.i + 1, a })
  }

  if (item.type !== "scenario") return fail("wrong-item", 409)
  const key = keyOf(s.p, item.id) as ScenarioKey
  const ref = key.numbers.reference_price
  const play = playBars(s.p, item.id)
  const run = s.a[s.i] as ScenarioRun | undefined

  if (body.action === "decide") {
    if (run) return fail("decided", 409)
    const d = parseDecision(body.decision)
    if (!d) return fail("problem.levels")
    const problem = decisionProblem(d, { ref, pipSize: item.pipSize, reasonOptions: item.reasonOptions })
    if (problem) return fail(`problem.${problem}`)
    const a = [...s.a]
    a[s.i] = startRun(d, ref)
    return respond({ ...s, a })
  }

  if (!run) return fail("undecided", 409)

  if (body.action === "step") {
    if (run.end) return respond(s)
    const next = stepRun(run, play[run.n], ref, run.n === play.length - 1)
    const a = [...s.a]
    a[s.i] = next
    // Only the candle just closed: the browser already has the rest of what it has seen.
    return NextResponse.json({ token: issueRun({ ...s, a }), index: s.i, bar: play[run.n], run: next })
  }

  if (body.action === "close") {
    if (typeof body.reason !== "string" || !(body.reason in pkg.closeReasons)) return fail("reason")
    const lastClose = run.n > 0 ? play[run.n - 1].c : ref
    const closed = closeRun(run, lastClose, body.reason)
    if (!closed) return fail("no-position", 409)
    const a = [...s.a]
    a[s.i] = closed
    return respond({ ...s, a })
  }

  if (body.action === "next") {
    const a = [...s.a]
    a[s.i] = finishRun(run, play, ref)
    return respond({ ...s, i: s.i + 1, a })
  }

  return fail("action")
}
