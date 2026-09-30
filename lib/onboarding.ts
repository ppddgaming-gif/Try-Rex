import type { GameLevel } from "@/lib/game-data"

// The /start quiz: five questions whose answers set the player's starting
// level, which pairs their rounds lean on, and their daily target. Pure and
// client-safe; storage lives in lib/use-onboarding.ts and lib/profile-actions.ts.
// "There are no wrong answers" is a design rule here: every option is a
// preference or a self-assessment, never a test.

export const ONBOARDING_VERSION = 1

export type Option = { value: string; label: string; sub: string }
export type Question = { id: QuestionId; title: string; options: Option[] }

export const QUESTIONS = [
  {
    id: "motivation",
    title: "Apa yang bikin kamu penasaran sama trading?",
    options: [
      { value: "social", label: "Lihat konten di sosial media", sub: "TikTok, YouTube, Instagram" },
      { value: "circle", label: "Teman atau keluarga trading", sub: "Penasaran mereka ngapain" },
      { value: "income", label: "Mau tambah penghasilan", sub: "Cari pemasukan di luar gaji" },
      { value: "lost", label: "Sudah coba, dan rugi", sub: "Mau paham di mana salahnya" },
    ],
  },
  {
    id: "experience",
    title: "Sejauh mana kamu sudah mencoba trading?",
    options: [
      { value: "none", label: "Belum pernah sama sekali", sub: "Baru mau mulai dari nol" },
      { value: "demo", label: "Pernah pakai akun demo", sub: "Uang virtual, belum uang sungguhan" },
      { value: "real", label: "Pernah pakai uang sungguhan", sub: "Beberapa kali, belum rutin" },
      { value: "regular", label: "Rutin trading", sub: "Hampir setiap minggu" },
    ],
  },
  {
    id: "skill",
    title: "Seberapa nyaman kamu membaca chart candlestick?",
    options: [
      { value: "unknown", label: "Belum tahu", sub: "Candlestick itu apa, ya?" },
      { value: "basics", label: "Tahu dasarnya", sub: "Body, sumbu, warna naik dan turun" },
      { value: "levels", label: "Bisa menandai level", sub: "Support, resistance, arah trend" },
      { value: "patterns", label: "Pakai pola dan konfirmasi", sub: "Pin bar, breakout, retest" },
    ],
  },
  {
    id: "focus",
    title: "Pair mana yang paling ingin kamu latih?",
    options: [
      { value: "majors", label: "Pair utama dengan USD", sub: "EURUSD, GBPUSD, AUDUSD, USDCAD" },
      { value: "yen", label: "Pair yen", sub: "USDJPY, EURJPY" },
      { value: "cross", label: "Cross pair", sub: "EURAUD, GBPCAD. Geraknya lebih liar" },
      { value: "all", label: "Belum tahu, campur saja", sub: "Rex pilihkan dari semua pair" },
    ],
  },
  {
    id: "time",
    title: "Berapa lama kamu mau latihan setiap hari?",
    options: [
      { value: "5", label: "5 menit", sub: "1 ronde, 5 soal" },
      { value: "15", label: "15 menit", sub: "3 ronde, 15 soal" },
      { value: "30", label: "30 menit atau lebih", sub: "6 ronde, 30 soal" },
      { value: "free", label: "Belum tahu", sub: "Tanpa target dulu" },
    ],
  },
] as const satisfies readonly { id: string; title: string; options: readonly Option[] }[]

export type QuestionId = "motivation" | "experience" | "skill" | "focus" | "time"
export type Answers = Partial<Record<QuestionId, string>>

/** What is stored: in profiles.onboarding for accounts, localStorage for guests. */
export type OnboardingRecord = {
  version: typeof ONBOARDING_VERSION
  answers: Answers
  /** True when the player chose "Lewati"; the plan then uses the defaults. */
  skipped: boolean
  /** ISO timestamp. */
  completedAt: string
}

export type Plan = {
  level: GameLevel
  /** Pairs the shuffle leans on; empty means no preference. */
  focusPairs: string[]
  /** Questions per day, or null for no target. */
  dailyGoal: number | null
  motivation: string | null
}

const FOCUS_PAIRS: Record<string, string[]> = {
  majors: ["EURUSD", "GBPUSD", "AUDUSD", "USDCAD"],
  yen: ["USDJPY", "EURJPY"],
  cross: ["EURAUD", "GBPCAD", "EURJPY"],
  all: [],
}

const STEP: Record<string, number> = {
  none: 0, demo: 1, real: 2, regular: 3,
  unknown: 0, basics: 1, levels: 2, patterns: 3,
}

export const DEFAULT_PLAN: Plan = { level: "easy", focusPairs: [], dailyGoal: 5, motivation: null }

/**
 * Experience and chart skill add up to 0–6: up to 2 starts on Mudah, 3–4 on
 * Menengah, 5–6 on Sulit. A "belum tahu" anywhere keeps it gentle.
 */
export function planFrom(record: OnboardingRecord | null): Plan {
  if (!record || record.skipped) return DEFAULT_PLAN
  const a = record.answers
  const score = (STEP[a.experience ?? ""] ?? 0) + (STEP[a.skill ?? ""] ?? 0)
  const level: GameLevel = score <= 2 ? "easy" : score <= 4 ? "medium" : "hard"
  const goal = a.time && a.time !== "free" ? Number(a.time) : null
  return {
    level,
    focusPairs: FOCUS_PAIRS[a.focus ?? "all"] ?? [],
    dailyGoal: goal !== null && Number.isFinite(goal) ? goal : null,
    motivation: a.motivation ?? null,
  }
}

export const LEVEL_LABELS: Record<GameLevel, string> = { easy: "Mudah", medium: "Menengah", hard: "Sulit" }

/** Label for one stored answer, for summaries on the result and account pages. */
export function answerLabel(id: QuestionId, value: string | undefined) {
  const q = QUESTIONS.find((x) => x.id === id)
  return q?.options.find((o) => o.value === value)?.label ?? null
}

/** Rex's one line for the result screen, keyed on why they came. */
export const MOTIVATION_LINES: Record<string, string> = {
  social:
    "Konten trading di sosial media jarang menunjukkan kalahnya. Di sini kamu lihat semuanya, termasuk saat analisis yang bagus tetap meleset.",
  circle: "Sekarang kamu bisa lihat sendiri apa yang mereka lakukan, tanpa mempertaruhkan uang siapa pun.",
  income:
    "Sebelum uang sungguhan, latih dulu keputusannya. Target harianmu membangun kebiasaan, bukan janji keuntungan.",
  lost: "Setelah setiap soal, buka “Bedah soal ini”. Di situ kelihatan di mana keputusan meleset dan kenapa.",
}

/**
 * Checks a record that arrived from outside (a form post, localStorage).
 * Unknown keys and values are dropped, so nothing unexpected is ever stored.
 */
export function parseRecord(input: unknown): OnboardingRecord | null {
  if (!input || typeof input !== "object") return null
  const raw = input as Record<string, unknown>
  if (raw.version !== ONBOARDING_VERSION) return null
  const answers: Answers = {}
  const rawAnswers = (raw.answers ?? {}) as Record<string, unknown>
  for (const q of QUESTIONS) {
    const v = rawAnswers[q.id]
    if (typeof v === "string" && q.options.some((o) => o.value === v)) answers[q.id] = v
  }
  const completedAt = typeof raw.completedAt === "string" && !Number.isNaN(Date.parse(raw.completedAt)) ? raw.completedAt : null
  if (!completedAt) return null
  return { version: ONBOARDING_VERSION, answers, skipped: raw.skipped === true, completedAt }
}
