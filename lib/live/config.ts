// The trading screen's data: which pairs and timeframes exist, how much of
// each the chart shows, and the limits on drawings. Pure and client-safe.

import type { Locale } from "@/lib/i18n/locale"

/**
 * The pairs on the live chart, in the order the picker lists them. All real
 * historical data: the first six from the MT4 export, EURAUD, GBPCAD and
 * GBPNZD from FXCM's M1 candles, moved onto the same broker clock by
 * scripts/build-live-data.mjs. A pair added here also goes in ALL_PAIRS
 * (lib/demo/config.ts), that script and the demo_accounts / demo_drawings checks.
 */
export const LIVE_PAIRS = ["EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCAD", "EURJPY", "GBPCAD", "EURAUD", "GBPNZD"] as const
export type LivePair = (typeof LIVE_PAIRS)[number]

/**
 * Per pair, everything that differs between pairs on the chart: the decimals
 * of its prices. scripts/build-live-data.mjs detects them from the data (the
 * most decimals among the first 1,000 closes, falling back to 3 for JPY pairs
 * and 5 for the rest) and stores prices at that precision; the detection gives
 * exactly these. Used for display only (axis, legend, readout): nothing is
 * computed at this precision.
 */
export const PAIR_CONFIG: Record<LivePair, { digits: number }> = {
  EURUSD: { digits: 5 },
  GBPUSD: { digits: 5 },
  USDJPY: { digits: 3 },
  AUDUSD: { digits: 5 },
  USDCAD: { digits: 5 },
  EURJPY: { digits: 3 },
  GBPCAD: { digits: 5 },
  EURAUD: { digits: 5 },
  GBPNZD: { digits: 5 },
}

export const TIMEFRAMES = ["M15", "M30", "H1", "H4"] as const
export type Timeframe = (typeof TIMEFRAMES)[number]

export const TIMEFRAME_SECONDS: Record<Timeframe, number> = { M15: 900, M30: 1800, H1: 3600, H4: 14400 }

export const DEFAULT_PAIR: LivePair = "EURUSD"
export const DEFAULT_TIMEFRAME: Timeframe = "H1"

export const isLivePair = (v: unknown): v is LivePair => typeof v === "string" && (LIVE_PAIRS as readonly string[]).includes(v)
export const isTimeframe = (v: unknown): v is Timeframe => typeof v === "string" && (TIMEFRAMES as readonly string[]).includes(v)

export const CHART = {
  /** Closed candles sent for one chart: the most the player can zoom out to. */
  BARS: 240,
  /** Candles on screen when a chart opens. */
  DEFAULT_VISIBLE: 120,
  /** The closest the player can zoom in, in candles. */
  MIN_VISIBLE: 20,
  /** One wheel notch or button press zooms by this factor. */
  ZOOM_STEP: 1.2,
  /** Empty candle slots kept right of the last candle, room to draw into the future. */
  RIGHT_SLOTS: 14,
  /**
   * Closed candles read before the first one sent, so EMA 50 and RSI 14 have
   * settled by then. Server side only: these candles never reach the browser.
   */
  WARMUP: 300,
  /** Height of the RSI panel under the chart, in pixels. */
  RSI_HEIGHT: 120,
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
 * The drawing tools' tutorial video, one recording per language (public/
 * tutorial/, 1920×1080 H.264, about 9 MB each). A locale missing here, or
 * `src` null, shows the placeholder. `id` is stored in demo_tips_seen once
 * watched.
 */
export const TUTORIAL_VIDEO = {
  id: "tools-video",
  src: {
    id: "/tutorial/tutorial-tryrex-id.mp4",
    en: "/tutorial/tutorial-tryrex-en.mp4",
  } as Partial<Record<Locale, string>> | null,
} as const

/** Seconds in one M15 candle, the engine's unit: every timeframe is built from these. */
export const M15 = 900

/**
 * The live clock. The chart runs on real time: data time = market time −
 * the account's offset (whole weeks, so a real Monday is a Monday in the
 * data). Market time is real UTC plus UTC_OFFSET_HOURS, the data's own
 * clock: its week opens Monday 00:00 and closes Friday about 23:45, which is
 * Monday 05:00 to Saturday about 04:45 WIB.
 */
export const MARKET = {
  UTC_OFFSET_HOURS: 2,
  /**
   * A stretch without candles at least this long closes the market (weekend,
   * holiday): a position still open closes at the last candle before it.
   * Shorter gaps (a few missing candles) only pause the chart.
   */
  CLOSE_GAP_SECONDS: 6 * 3600,
  /** Weekday/hour labels and the countdown are shown in WIB. */
  DISPLAY_UTC_OFFSET_HOURS: 7,
} as const

/**
 * Data ranges an account's clock may run in, clear of extreme news (SNB Jan
 * 2015, Brexit Jun 2016, Covid Feb–Apr 2020, Ukraine Feb–Mar 2022). Complete
 * in all nine pairs apart from holiday closures, where a pair is simply
 * closed: FXCM has no EURAUD for 2018-12-31 to 2019-01-06 and no GBPCAD for
 * 2018-12-28 to 2019-01-02, while the MT4 pairs trade 2 to 4 January.
 * Mondays 00:00 data time, `to` exclusive. A clock
 * reaching the end of one moves on to the next at the weekend; after the last
 * it starts again at the first.
 */
export const CLEAN_RANGES = [
  { from: "2012-11-19", to: "2014-12-29" },
  { from: "2015-02-02", to: "2016-05-30" },
  { from: "2016-07-04", to: "2020-01-27" },
  { from: "2020-05-04", to: "2022-01-31" },
] as const

export const LIVE = {
  /** A clock starts, or lands after a jump, this many weeks into a range, so the chart's history stays inside it. */
  LEAD_WEEKS: 5,
  /** A new clock never starts closer than this to its range's end. */
  MIN_RUN_WEEKS: 4,
  /** Open positions per account. */
  MAX_OPEN: 1,
  /** The screen asks for the current price this often while the tab is visible. */
  POLL_MS: 10_000,
  /**
   * Revenge window in M15 candles: a bigger lot within 12 hours of a loss
   * (the replay's 3 H4 candles, in M15).
   */
  REVENGE_WINDOW_M15: 48,
  /** Candles of M15 behind "now" read for Rex's "SL too close" yardstick. */
  RANGE_AVG_M15: 14,
} as const
