// The shape of Belajar 101 content. Lessons are data, rendered by
// components/learn/lesson-blocks.tsx. Every lesson is taken from the TRY-REX
// "Materi Basic" handouts: selected and trimmed for beginners, never
// rewritten in meaning, and carried in both languages side by side so the
// page can switch between them.

export type LevelId = 1 | 2 | 3 | 4 | 5 | 6

/** The same text in both languages. */
export type Text = { id: string; en: string }

/** A reference the handout itself lists under "Sumber". */
export type Source = { title: string; publisher: string; url?: string }

/**
 * A real chart from the game data (lib/learn/charts.ts), chosen by what it
 * shows. Every line or mark on it is computed from the candles, never placed
 * by hand.
 */
export type ChartPick =
  | "uptrend"
  | "downtrend"
  | "sideways"
  | "levels"
  /** A few candles up close: bullish and bearish bodies, wicks. */
  | "candles"
  /** The same candles in H4 and grouped into D1. */
  | "timeframes"
  /** Swing highs and lows marked on a trending chart. */
  | "swings"
  /** A trendline through two rising swing lows, computed. */
  | "trendline"
  /** EMA 20 and EMA 50 over the candles. */
  | "ema"
  /** RSI 14 under the candles. */
  | "rsi"
  /** ATR 14 under the candles. */
  | "atr"

export type Block =
  | { kind: "p"; text: Text }
  | { kind: "heading"; text: Text }
  | { kind: "points"; title?: Text; items: Text[] }
  /** Numbered steps, in order. */
  | { kind: "steps"; title?: Text; items: Text[] }
  /** The handouts' DEFINISI / TIPS / AWAS / CATATAN boxes. */
  | { kind: "callout"; tone: "definition" | "tip" | "warning" | "note"; title: Text; text: Text }
  /** A worked example ("CONTOH HITUNGAN"), one line per step, in mono. */
  | { kind: "calc"; title: Text; lines: Text[]; note?: Text }
  | { kind: "table"; head: Text[]; rows: Text[][]; note?: Text }
  | { kind: "diagram"; name: "candle-anatomy" | "trend-shapes" | "risk-reward" | "leverage" | "pair-quote" | "sessions" }
  | { kind: "chart"; pick: ChartPick; caption: Text }
  /** "Uji pemahaman": answer in your head, then reveal. Never scored. */
  | { kind: "check"; items: { q: Text; a: Text }[] }

export type Lesson = {
  slug: string
  level: LevelId
  minutes: number
  title: Text
  summary: Text
  blocks: Block[]
  /** The handout(s) in "Materi Basic" this lesson is taken from. */
  material: string[]
  sources: Source[]
}
