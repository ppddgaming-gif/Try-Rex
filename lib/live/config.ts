// The trading screen's data: which pairs and timeframes exist, how much of
// each the chart shows, and the limits on drawings. Pure and client-safe.

/**
 * The pairs on the live chart, in the order the picker lists them. Only pairs
 * with real historical data: EURAUD, GBPCAD and GBPNZD were left out because
 * their "DATA FOR LIVE" files are computed or synthetic (the owner's call).
 * Add a pair back here, in ALL_PAIRS (lib/demo/config.ts), in
 * scripts/build-live-data.mjs and in the demo_accounts / demo_drawings checks
 * once real data for it exists.
 */
export const LIVE_PAIRS = ["EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCAD", "EURJPY"] as const
export type LivePair = (typeof LIVE_PAIRS)[number]

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
 * Data ranges an account's clock may run in, complete in all nine pairs and
 * clear of extreme news (SNB Jan 2015, Brexit Jun 2016, Covid Feb–Apr 2020,
 * Ukraine Feb–Mar 2022). Mondays 00:00 data time, `to` exclusive. A clock
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
