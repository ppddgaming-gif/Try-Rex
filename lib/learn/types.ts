// The shape of Belajar 101 content. Lessons are data, rendered by
// components/learn/lesson-blocks.tsx, so real copy and sources can replace
// the drafts without touching any UI.

export type TrackId = "dasar" | "chart" | "risiko" | "crypto" | "psikologi"

/** Title and description: learn.tracks.<id> in the catalogue. */
export type Track = {
  id: TrackId
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

/** Title and summary: learn.lessons.<slug> in the catalogue. */
export type Lesson = {
  slug: string
  track: TrackId
  minutes: number
  level: "pemula" | "menengah"
  blocks: Block[]
  sources: Source[]
  /** Placeholder copy awaiting review against the sources. */
  draft: boolean
  /** Where to practise it, if the game covers it. */
  practice?: { key: "game" | "evaluation"; href: string }
}
