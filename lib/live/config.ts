// The trading screen's data: which pairs and timeframes exist, how much of
// each the chart shows, and the limits on drawings. Pure and client-safe.

/** The nine pairs, in the order the picker lists them. */
export const LIVE_PAIRS = ["EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCAD", "EURJPY", "GBPCAD", "EURAUD", "GBPNZD"] as const
export type LivePair = (typeof LIVE_PAIRS)[number]

export const TIMEFRAMES = ["M15", "M30", "H1", "H4"] as const
export type Timeframe = (typeof TIMEFRAMES)[number]

export const TIMEFRAME_SECONDS: Record<Timeframe, number> = { M15: 900, M30: 1800, H1: 3600, H4: 14400 }

export const DEFAULT_PAIR: LivePair = "EURUSD"
export const DEFAULT_TIMEFRAME: Timeframe = "H1"

export const isLivePair = (v: unknown): v is LivePair => typeof v === "string" && (LIVE_PAIRS as readonly string[]).includes(v)
export const isTimeframe = (v: unknown): v is Timeframe => typeof v === "string" && (TIMEFRAMES as readonly string[]).includes(v)

export const CHART = {
  /** Closed candles sent for one chart. */
  BARS: 120,
  /** Empty candle slots kept right of the last candle, room to draw into the future. */
  RIGHT_SLOTS: 14,
} as const

export const DRAWINGS = {
  /** Per account, per pair. */
  MAX: 60,
  /** Points in one path. */
  MAX_PATH_POINTS: 40,
  /** Undo steps kept in the browser. */
  UNDO: 50,
} as const

/** Seconds in a week: drawings and labels use positions within it. */
export const WEEK = 7 * 86_400

/**
 * The drawing tools' tutorial video. Not made yet: `src` null shows a
 * placeholder. `id` is stored in demo_tips_seen once watched.
 */
export const TUTORIAL_VIDEO = { id: "tools-video", src: null as string | null } as const
