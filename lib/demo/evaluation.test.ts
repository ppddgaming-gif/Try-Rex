import { describe, expect, it, vi } from "vitest"
import { AI_EVAL } from "@/lib/demo/config"
import {
  ASPECTS,
  checkSelection,
  evalDay,
  journalComplete,
  monthOf,
  parseEvaluation,
  PROMPT_VERSION,
  runEvaluation,
  type Candidate,
  type RunDeps,
} from "@/lib/demo/evaluation"

const c = (id: string, number: number, month = "2026-11", over: Partial<Candidate> = {}): Candidate => ({ id, number, month, complete: true, evaluated: false, ...over })
const CANDIDATES = [c("a", 1), c("b", 2), c("o", 3, "2026-10"), c("e", 4, "2026-11", { evaluated: true }), c("i", 5, "2026-11", { complete: false })]

const text = (n: number) => ({ summary: `s${n}`, aspects: Object.fromEntries(ASPECTS.map((k) => [k, `${k}${n}`])), journal: `j${n}` })
const reply = (numbers: number[], over: Record<string, unknown> = {}) =>
  JSON.stringify({
    trades: numbers.map((n) => ({ trade: n, scores: { risk: 80, sl: 70, rr: 60, entry: 50, management: 90 }, id: text(n), en: text(n) })),
    month: { id: { patterns: ["p"], practice: "x" }, en: { patterns: ["p"], practice: "x" } },
    ...over,
  })

function deps(over: Partial<RunDeps> = {}): RunDeps & { saved: unknown[]; logged: unknown[] } {
  const saved: unknown[] = []
  const logged: unknown[] = []
  return {
    saved,
    logged,
    candidates: async () => CANDIDATES,
    runsToday: async () => 0,
    facts: async (picked) => picked.map((p) => `Trade #${p.number}`),
    ai: async () => ({ ok: true, text: reply([1, 2]), model: "m", usage: { prompt: 100, completion: 200 } }),
    save: async (evs) => {
      saved.push(...evs)
      return "ok"
    },
    log: async (e) => {
      logged.push(e)
    },
    now: () => Date.parse("2026-11-02T03:00:00Z"),
    ...over,
  }
}

describe("monthOf", () => {
  it.each([
    ["2026-11-02T03:00:00Z", "2026-11"],
    // 31 Oct 18:00 UTC is 1 Nov 01:00 WIB.
    ["2026-10-31T18:00:00Z", "2026-11"],
    ["2026-10-31T16:59:00Z", "2026-10"],
  ])("%s → %s", (at, month) => expect(monthOf(at)).toBe(month))
})

describe("journalComplete", () => {
  it.each([
    [{ review: "ya" as const, note: "ikut rencana" }, true],
    [{ review: "ya" as const, note: "   " }, false],
    [{ review: null, note: "catatan" }, false],
    [{ review: null, note: null }, false],
  ])("%j → %s", (e, ok) => expect(journalComplete(e)).toBe(ok))
})

describe("checkSelection", () => {
  it.each([
    [["a", "b"], "2026-11"],
    [["a", "a"], "2026-11"],
    [[], "empty"],
    [["a", "zzz"], "notFound"],
    [["a", "o"], "mixedMonths"],
    [["a", "e"], "evaluated"],
    [["a", "i"], "incomplete"],
  ])("%j → %s", (ids, expected) => {
    const r = checkSelection(ids, CANDIDATES)
    expect("refusal" in r ? r.refusal : r.month).toBe(expected)
  })

  it("refuses more than MAX_PER_RUN at once", () => {
    const many = Array.from({ length: AI_EVAL.MAX_PER_RUN + 1 }, (_, i) => c(`x${i}`, 10 + i))
    expect(checkSelection(many.map((m) => m.id), many)).toEqual({ refusal: "tooMany" })
  })
})

describe("evalDay", () => {
  it("resets at midnight WIB", () => {
    const { start, resetAt } = evalDay(Date.parse("2026-11-02T03:00:00Z"))
    expect(start.toISOString()).toBe("2026-11-01T17:00:00.000Z")
    expect(resetAt.toISOString()).toBe("2026-11-02T17:00:00.000Z")
  })
})

describe("parseEvaluation", () => {
  const picked = [c("a", 1), c("b", 2)]
  it("reads a complete reply, also inside a code fence", () => {
    const out = parseEvaluation("```json\n" + reply([2, 1]) + "\n```", picked, "2026-11")
    expect(out?.map((e) => e.tradeId)).toEqual(["b", "a"])
    expect(out?.[0].scores).toEqual({ risk: 80, sl: 70, rr: 60, entry: 50, management: 90 })
    expect(out?.[0].text.en.practice).toBe("x")
  })

  it.each([
    ["a trade missing", reply([1])],
    ["a trade twice", reply([1, 1, 2])],
    ["an unknown trade", reply([1, 9])],
    ["not JSON", "Maaf, saya tidak bisa."],
    ["a score above 100", reply([1, 2]).replace('"risk":80', '"risk":180')],
    ["a fractional score", reply([1, 2]).replace('"risk":80', '"risk":80.5')],
    ["an aspect missing in English", reply([1, 2]).replace(/"en":\{"summary":"s1","aspects":\{"risk":"risk1",/, '"en":{"summary":"s1","aspects":{')],
    ["no month section", reply([1, 2], { month: null })],
    ["patterns that differ between languages", reply([1, 2], { month: { id: { patterns: ["p"], practice: "x" }, en: { patterns: ["p", "q"], practice: "x" } } })],
  ])("rejects %s", (_, text) => expect(parseEvaluation(text, picked, "2026-11")).toBeNull())
})

describe("runEvaluation", () => {
  it("saves one evaluation per entry and counts the run", async () => {
    const d = deps()
    const r = await runEvaluation(["a", "b"], d)
    expect(r).toEqual({ ok: true, evaluated: ["a", "b"], runsLeft: AI_EVAL.RUNS_PER_DAY - 1 })
    expect(d.saved).toHaveLength(2)
    expect(d.logged).toEqual([expect.objectContaining({ status: "ok", journalIds: ["a", "b"], usage: { prompt: 100, completion: 200 } })])
  })

  it("refuses entries from two months before calling the model", async () => {
    const ai = vi.fn()
    const r = await runEvaluation(["a", "o"], deps({ ai }))
    expect(r).toEqual({ ok: false, refusal: "mixedMonths" })
    expect(ai).not.toHaveBeenCalled()
  })

  it("refuses an entry that was already evaluated", async () => {
    const ai = vi.fn()
    expect(await runEvaluation(["e"], deps({ ai }))).toEqual({ ok: false, refusal: "evaluated" })
    expect(ai).not.toHaveBeenCalled()
  })

  it("refuses a second evaluation that slips past the check (the unique constraint answers conflict)", async () => {
    const d = deps({ save: async () => "conflict" })
    expect(await runEvaluation(["a", "b"], d)).toEqual({ ok: false, refusal: "evaluated" })
    expect(d.logged).toEqual([expect.objectContaining({ status: "conflict" })])
  })

  it("refuses at the daily limit with the reset time, without calling the model", async () => {
    const ai = vi.fn()
    const r = await runEvaluation(["a"], deps({ ai, runsToday: async () => AI_EVAL.RUNS_PER_DAY }))
    expect(r).toEqual({ ok: false, refusal: "limit", resetAt: "2026-11-02T17:00:00.000Z" })
    expect(ai).not.toHaveBeenCalled()
  })

  it.each([
    ["the model fails", { ok: false as const, busy: false }, "aiFailed", "ai_failed"],
    ["the model is busy", { ok: false as const, busy: true }, "aiBusy", "ai_failed"],
    ["the reply is incomplete", { ok: true as const, text: reply([1]), model: "m", usage: null }, "aiFailed", "invalid"],
  ])("saves nothing and doesn't count the run when %s", async (_, answer, refusal, status) => {
    const save = vi.fn()
    const d = deps({ ai: async () => answer, save })
    expect(await runEvaluation(["a", "b"], d)).toEqual({ ok: false, refusal })
    expect(save).not.toHaveBeenCalled()
    // Only "ok" runs count toward the limit, so a failed one costs nothing.
    expect(d.logged).toEqual([expect.objectContaining({ status })])
  })

  it("saves the prompt version with the results", async () => {
    const save = vi.fn(async () => "ok" as const)
    await runEvaluation(["a"], deps({ save, ai: async () => ({ ok: true, text: reply([1]), model: "m", usage: null }) }))
    expect(save).toHaveBeenCalledWith(expect.any(Array), { model: "m", promptVersion: PROMPT_VERSION })
  })
})
