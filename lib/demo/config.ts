// Akun Latihan: every number in one place. Change a value here and the
// calculator, the server checks and the copy all follow. Pure and
// client-safe; nothing secret lives here.

/** The account currency. Every money value in lib/demo is in this unit. */
export const ACCOUNT_CURRENCY = "USD"

export const ACCOUNT = {
  /** New accounts start here. There is no way to add money. */
  STARTING_BALANCE: 200,
  /** 1:100. Margin needed = position value / LEVERAGE. */
  LEVERAGE: 100,
  /** Units in 1.00 lot. */
  CONTRACT_SIZE: 100_000,
  MIN_LOT: 0.01,
  LOT_STEP: 0.01,
  MAX_LOT: 1,
  /** Margin level (equity / margin used, %) where the warning shows. */
  MARGIN_CALL_LEVEL: 100,
  /** Margin level where every open trade is closed at once. */
  STOP_OUT_LEVEL: 50,
} as const

/**
 * Trading costs, shown as "perkiraan" (estimates). A standard account:
 * spread only, no commission; the calculator still shows the commission row.
 */
export const COSTS = {
  /**
   * Spread in pips, fixed when a trade opens: the trade starts this far behind
   * (Open P/L shows it at once) and it is booked with the trade's result.
   */
  SPREAD_PIPS: {
    EURUSD: 1.0,
    GBPUSD: 1.5,
    AUDUSD: 1.2,
    USDJPY: 1.2,
    USDCAD: 1.8,
    EURJPY: 2.0,
    EURAUD: 2.5,
    GBPCAD: 3.0,
    // GBPNZD: an estimate the owner approved (crosses with NZD usually trade wider than GBPCAD).
    GBPNZD: 3.5,
  } as Record<string, number>,
  /** Per 1.00 lot, per trade. */
  COMMISSION_PER_LOT: 0,
  /** Per 1.00 lot, per night held (charged when a candle crosses 00:00 UTC). Negative = a cost. */
  SWAP_PER_LOT_PER_NIGHT: -5,
} as const

/** The replay. Longer history can drop in later by changing these alone. */
export const REPLAY = {
  /** Candles on screen when a segment starts. */
  HISTORY_CANDLES: 30,
  /** Most candles a segment can play forward (the data allows about 35). */
  MAX_FORWARD_CANDLES: 35,
  /** A window with fewer candles than this to play forward isn't offered as a segment. */
  MIN_FORWARD_CANDLES: 10,
  /** Opening a trade with fewer candles left than this shows a warning. */
  LOW_CANDLES_WARNING: 10,
  /** Milliseconds per candle at 1×; 2× and 4× divide it. */
  MS_PER_CANDLE: 1500,
  SPEEDS: [1, 2, 4] as const,
} as const

export const DISIPLIN = {
  /** Risk at entry, as % of balance, above which the risk check fails. */
  MAX_RISK_PCT: 2,
  /** The order panel's strong warning. */
  DANGER_RISK_PCT: 10,
  /** Reward must be at least this many times the risk. */
  MIN_REWARD_RISK: 1.5,
  /** A trade opened this many candles or fewer after a loss, with a bigger lot, is a revenge trade. */
  REVENGE_WINDOW_CANDLES: 3,
  /** Rex's "SL too close": nearer than the average (high − low) of this many recent candles. */
  SL_CLOSE_RANGE_CANDLES: 14,
  /** The account's Disiplin score averages this many most recent counted trades. */
  ROLLING_TRADES: 20,
} as const

/** The plan before every trade. */
export const PLAN = {
  /** Reasons picked from the shared list (lib/reasons.ts). */
  MIN_REASONS: 1,
  MAX_REASONS: 3,
  /** Largest SL or TP distance the order panel accepts, in pips. */
  MAX_DISTANCE_PIPS: 1000,
} as const

/** The horizontal-line tool. Lines are saved per segment and never scored. */
export const LINES = { MAX_PER_SEGMENT: 10 } as const

/** "Apakah kamu mengikuti rencanamu?" Self-reported, never scored. */
export const REVIEW = { NOTE_MAX_CHARS: 120 } as const

/**
 * Every live-chart pair is open from the first stage (the owner's choice);
 * stages limit lot size, open trades and SL/TP rules instead. The same nine as
 * LIVE_PAIRS in lib/live/config.ts.
 */
const ALL_PAIRS = ["EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCAD", "EURJPY", "GBPCAD", "EURAUD", "GBPNZD"]

/** Stages belong to the player and survive a new account. */
export const STAGES = {
  1: {
    pairs: ALL_PAIRS,
    fixedLot: 0.01 as number | null,
    maxOpenTrades: 1,
    slTpRequired: true,
  },
  2: {
    pairs: ALL_PAIRS,
    fixedLot: null as number | null,
    maxOpenTrades: 1,
    slTpRequired: false,
  },
  3: {
    pairs: ALL_PAIRS,
    fixedLot: null as number | null,
    maxOpenTrades: 3,
    slTpRequired: false,
  },
} as const

export type StageNumber = keyof typeof STAGES

/**
 * "Akun habis": with no trade open, a balance below this line ends the
 * account. One fixed line per stage, shown on the dashboard in advance: the
 * 0.01-lot margin of the stage's most expensive pair at its highest price in
 * the data (GBPUSD at 1.62122 = $16.21), rounded up to a whole dollar. Above
 * it the smallest trade always fits on any chart of the stage.
 * lib/demo/money.test.ts recomputes it from the data, so it can't drift.
 */
export const AKUN_HABIS: Record<StageNumber, number> = { 1: 17, 2: 17, 3: 17 }

/** What it takes to move up. Counted trades only (see COUNTING). */
export const STAGE_UNLOCK = {
  /** Stage 1 → 2: this many trades in Stage 1… */
  TO_2_TRADES: 10,
  /** …Stage 2 → 3: this many more, in Stage 2. */
  TO_3_TRADES: 20,
  /** Average Disiplin of those trades, in %. */
  MIN_DISIPLIN: 80,
} as const

export const GRADUATION = {
  /** Counted trades in Stage 3… */
  TRADES: 30,
  /** …with this average Disiplin over the last TRADES of them, in %. */
  MIN_DISIPLIN: 80,
} as const

/** Rex's review when an account runs out or is reset. */
export const ACCOUNT_REVIEW = {
  /** How many of the most often failed Disiplin checks it names. */
  TOP_FAILED_CHECKS: 2,
} as const

/**
 * The standalone Kalkulator Profit page. Example prices only, never a current
 * one: other pairs start from APPROX_USD_RATE.
 */
export const CALCULATOR = {
  PAIR: "EURUSD",
  LOT: 0.1,
  /** The design's example: 0.10 lot, 1.1700 → 1.1750 = $50.00, margin $117. */
  ENTRY: 1.17,
  MOVE_PIPS: 50,
} as const

export const COUNTING = {
  /**
   * A trade closed in the same candle it opened earns no XP and doesn't count
   * toward stages or graduation: it can't show a plan being followed.
   */
  MIN_CANDLES_HELD: 1,
} as const

export const UNLOCK = {
  /** Trading Game rounds needed to open Akun Latihan. */
  GAME_SESSIONS: 3,
  /** Answers per round; sessions = answers ÷ this, counted on the server. */
  ANSWERS_PER_SESSION: 5,
} as const

export const XP = {
  /** Full Disiplin score earns this; the trade earns this × its score. Profit never adds XP. */
  PER_TRADE: 20,
} as const

/**
 * Conversion to USD for currencies whose rate isn't in the same candles
 * (crosses). Fixed and approximate, labelled "perkiraan" in the UI. Pairs
 * quoted in USD, or with USD as base, never use these.
 */
export const APPROX_USD_RATE: Record<string, number> = {
  EUR: 1.3,
  GBP: 1.55,
  AUD: 0.9,
  CAD: 0.97,
  JPY: 1 / 85,
  // The median of GBPUSD ÷ GBPNZD over the live data's daily closes (0.7035), rounded.
  NZD: 0.7,
}

// The screen line every Akun Latihan page carries: demo.disclaimer in the
// message catalogues.
