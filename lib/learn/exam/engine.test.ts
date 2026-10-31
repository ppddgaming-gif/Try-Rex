import { readdirSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import { LEVEL_1, LEVEL_2, LEVEL_3 } from "@/lib/learn/exam/bank-1-3"
import { LEVEL_4, LEVEL_5, LEVEL_6 } from "@/lib/learn/exam/bank-4-6"
import { EXAM, buildExam, distractors, gradeExam, num, publicExam, type BankEntry } from "@/lib/learn/exam/engine"
import { LEVELS } from "@/lib/learn/content"

const BANKS: [number, BankEntry[]][] = [
  [1, LEVEL_1],
  [2, LEVEL_2],
  [3, LEVEL_3],
  [4, LEVEL_4],
  [5, LEVEL_5],
  [6, LEVEL_6],
]
const SEEDS = Array.from({ length: 200 }, (_, i) => (i * 2654435761) >>> 0)

describe("banks", () => {
  it.each(BANKS)("level %i has more questions than one paper, with unique ids", (_, bank) => {
    expect(bank.length).toBeGreaterThan(EXAM.QUESTIONS + 4)
    expect(new Set(bank.map((e) => e.id)).size).toBe(bank.length)
  })

  it.each(BANKS)("level %i: every dealt question is well formed in both languages", (_, bank) => {
    for (const seed of SEEDS) {
      for (const item of buildExam(bank, seed)) {
        expect(item.options).toHaveLength(4)
        expect(item.answer).toBeGreaterThanOrEqual(0)
        expect(item.answer).toBeLessThan(4)
        for (const lang of ["id", "en"] as const) {
          expect(item.prompt[lang].length).toBeGreaterThan(5)
          expect(item.explain[lang].length).toBeGreaterThan(5)
          expect(item.prompt[lang]).not.toMatch(/\{\w+\}|NaN|undefined|Infinity/)
          const labels = item.options.map((o) => o[lang])
          expect(new Set(labels).size).toBe(4)
          for (const l of labels) expect(l).not.toMatch(/\{\w+\}|NaN|undefined|Infinity/)
        }
      }
    }
  })

  it("covers every level of the curriculum", () => {
    expect(BANKS.map(([l]) => l)).toEqual(LEVELS.map((l) => l.id))
  })
})

describe("buildExam", () => {
  it("rebuilds the same paper from the same seed", () => {
    expect(buildExam(LEVEL_3, 12345)).toEqual(buildExam(LEVEL_3, 12345))
  })

  it("deals EXAM.QUESTIONS distinct questions", () => {
    const paper = buildExam(LEVEL_4, 99)
    expect(paper).toHaveLength(EXAM.QUESTIONS)
    expect(new Set(paper.map((q) => q.id)).size).toBe(EXAM.QUESTIONS)
  })

  it("different seeds almost never deal the same paper", () => {
    const papers = new Set(SEEDS.map((s) => JSON.stringify(buildExam(LEVEL_1, s).map((q) => [q.id, q.answer, q.prompt.id]))))
    expect(papers.size).toBe(SEEDS.length)
  })

  it("moves the right answer around", () => {
    const positions = new Set(SEEDS.flatMap((s) => buildExam(LEVEL_2, s).map((q) => q.answer)))
    expect(positions).toEqual(new Set([0, 1, 2, 3]))
  })
})

describe("publicExam", () => {
  it("never carries the answer or the explanation", () => {
    for (const q of publicExam(buildExam(LEVEL_5, 7))) {
      expect(Object.keys(q).sort()).toEqual(["id", "options", "prompt"])
    }
  })
})

describe("gradeExam", () => {
  const paper = buildExam(LEVEL_6, 2024)
  const right = paper.map((q) => q.answer)

  it.each([
    { name: "all right", answers: right, correct: 10, passed: true },
    { name: "exactly the pass mark", answers: right.map((a, i) => (i < EXAM.PASS ? a : (a + 1) % 4)), correct: EXAM.PASS, passed: true },
    { name: "one below the pass mark", answers: right.map((a, i) => (i < EXAM.PASS - 1 ? a : (a + 1) % 4)), correct: EXAM.PASS - 1, passed: false },
    { name: "nothing answered", answers: [], correct: 0, passed: false },
    { name: "garbage", answers: "abc", correct: 0, passed: false },
    { name: "out-of-range picks", answers: right.map(() => 9), correct: 0, passed: false },
  ])("$name", ({ answers, correct, passed }) => {
    const r = gradeExam(paper, answers)
    expect(r.correct).toBe(correct)
    expect(r.passed).toBe(passed)
    expect(r.total).toBe(EXAM.QUESTIONS)
  })
})

describe("helpers", () => {
  it("num writes both decimal conventions", () => {
    expect(num(1234.5, 2)).toEqual({ id: "1.234,50", en: "1,234.50" })
  })

  it("distractors are distinct from the answer and each other", () => {
    const d = distractors(50, [50, 50, 50], 1)
    expect(d).toHaveLength(3)
    expect(new Set([50, ...d].map((v) => v.toFixed(1))).size).toBe(4)
  })
})

describe("the answer key stays on the server", () => {
  // Files under components/ and every "use client" module must never import a bank.
  const roots = ["components", "lib", "app"]
  const files: string[] = []
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name)
      if (statSync(p).isDirectory()) walk(p)
      else if (/\.tsx?$/.test(name) && !name.endsWith(".test.ts")) files.push(p)
    }
  }
  roots.forEach(walk)

  it("no client module imports the exam bank", () => {
    const offenders = files.filter((f) => {
      const src = readFileSync(f, "utf8")
      const client = src.startsWith('"use client"') || f.startsWith("components")
      return client && /lib\/learn\/exam\/bank/.test(src)
    })
    expect(offenders).toEqual([])
  })
})
