// The shape of Belajar 101 content. Lessons are data, rendered by
// components/learn/lesson-blocks.tsx, so real copy and sources can replace
// the drafts without touching any UI.

export type TrackId = "dasar" | "chart" | "risiko" | "crypto" | "psikologi"

export type Track = {
  id: TrackId
  title: string
  description: string
  /** Lesson slugs in reading order. */
  lessons: string[]
}

/**
 * Where a claim comes from. Every lesson must end up with at least one
 * `added` source before it loses its draft banner.
 */
export type Source =
  | { status: "needed"; note: string }
  | { status: "added"; title: string; publisher: string; url: string; accessed: string }

/** A real chart from the game data, chosen by what it shows. */
export type ChartPick = "uptrend" | "downtrend" | "sideways" | "levels"

export type Block =
  | { kind: "p"; text: string }
  | { kind: "heading"; text: string }
  | { kind: "points"; title?: string; items: string[] }
  | { kind: "callout"; tone: "tip" | "warning" | "example"; title: string; text: string }
  | { kind: "diagram"; name: "candle-anatomy" | "trend-shapes" | "risk-reward" | "leverage" }
  | { kind: "chart"; pick: ChartPick; caption: string; reveal?: boolean }
  | { kind: "quiz"; question: string; options: string[]; answer: number; explain: string }

export type Lesson = {
  slug: string
  track: TrackId
  title: string
  summary: string
  minutes: number
  level: "pemula" | "menengah"
  blocks: Block[]
  sources: Source[]
  /** Placeholder copy awaiting review against the sources. */
  draft: boolean
  /** Where to practise it, if the game covers it. */
  practice?: { label: string; href: string }
}
