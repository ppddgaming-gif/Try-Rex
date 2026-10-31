import type { LevelId, Text } from "@/lib/learn/types"

// The level exam: 10 multiple-choice questions drawn from a level's bank with
// a seeded PRNG, options shuffled, so two attempts (and two players) almost
// never see the same paper. Some bank entries are generators that build a
// question from the seed (numbers from real historical prices, or from the
// handouts' formulas). Pure: the same seed always rebuilds the same paper, so
// the server can grade without storing it. The answer key never leaves the
// server: the browser gets publicExam() only.

export const EXAM = {
  QUESTIONS: 10,
  /** Right answers needed to pass and unlock the next level. */
  PASS: 7,
  /** How long a paper stays valid after it is dealt. */
  TTL_SECONDS: 3 * 3600,
} as const

export type ExamItem = { id: string; prompt: Text; options: Text[]; answer: number; explain: Text }
export type Generator = { id: string; make: (random: () => number) => Omit<ExamItem, "id"> }
export type BankEntry = ExamItem | Generator
export type Bank = Record<LevelId, BankEntry[]>

/** mulberry32: small, fast, seeded. */
export function prng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

const isGenerator = (e: BankEntry): e is Generator => "make" in e

/** The paper for `seed`: EXAM.QUESTIONS distinct entries, options shuffled. */
export function buildExam(entries: readonly BankEntry[], seed: number): ExamItem[] {
  const random = prng(seed)
  return shuffle(entries, random)
    .slice(0, EXAM.QUESTIONS)
    .map((entry) => {
      const item: ExamItem = isGenerator(entry) ? { id: entry.id, ...entry.make(random) } : entry
      const order = shuffle(
        item.options.map((_, i) => i),
        random,
      )
      return { ...item, options: order.map((i) => item.options[i]), answer: order.indexOf(item.answer) }
    })
}

export type PublicQuestion = { id: string; prompt: Text; options: Text[] }

/** What the browser may see: no answer, no explanation. */
export const publicExam = (items: readonly ExamItem[]): PublicQuestion[] =>
  items.map(({ id, prompt, options }) => ({ id, prompt, options }))

export type ExamResult = {
  correct: number
  total: number
  passed: boolean
  results: { id: string; chosen: number | null; answer: number; right: boolean; explain: Text }[]
}

/** Grades `answers` (one option index per question, or null) against the paper. */
export function gradeExam(items: readonly ExamItem[], answers: unknown): ExamResult {
  const list = Array.isArray(answers) ? answers : []
  const results = items.map((q, i) => {
    const raw = list[i]
    const chosen = Number.isInteger(raw) && raw >= 0 && raw < q.options.length ? (raw as number) : null
    return { id: q.id, chosen, answer: q.answer, right: chosen === q.answer, explain: q.explain }
  })
  const correct = results.filter((r) => r.right).length
  return { correct, total: items.length, passed: correct >= EXAM.PASS, results }
}

/** A number written both ways: "1,0850" and "1.0850". */
export function num(n: number, decimals: number): Text {
  const en = n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
  const id = n.toLocaleString("id-ID", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
  return { id, en }
}

/** Fill {a}, {b}… in both languages with Text values. */
export function fill(template: Text, values: Record<string, Text>): Text {
  const put = (s: string, lang: keyof Text) => s.replace(/\{(\w+)\}/g, (_, k: string) => values[k]?.[lang] ?? `{${k}}`)
  return { id: put(template.id, "id"), en: put(template.en, "en") }
}

/** Three wrong numbers near `right`, distinct from it and from each other. */
export function distractors(right: number, candidates: number[], decimals: number): number[] {
  // Compared as written, so two values can never print the same.
  const key = (v: number) => num(v, decimals).en
  const seen = new Set([key(right)])
  const out: number[] = []
  // Fallbacks in case the candidates collide with the answer or each other.
  const step = right === 0 ? 1 : Math.abs(right)
  for (const c of [...candidates, right * 1.5, right * 0.5, right + step * 0.3, right - step * 0.3, right * 3]) {
    if (!Number.isFinite(c) || seen.has(key(c))) continue
    seen.add(key(c))
    out.push(c)
    if (out.length === 3) break
  }
  return out
}
