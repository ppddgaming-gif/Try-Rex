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
  /** Spread in pips, charged when a trade opens. */
  SPREAD_PIPS: {
    EURUSD: 1.0,
    GBPUSD: 1.5,
    AUDUSD: 1.2,
    USDJPY: 1.2,
    USDCAD: 1.8,
    EURJPY: 2.0,
    EURAUD: 2.5,
    GBPCAD: 3.0,
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

/** Stages belong to the player and survive a new account. */
export const STAGES = {
  1: {
    pairs: ["EURUSD", "GBPUSD", "AUDUSD", "USDJPY", "USDCAD"],
    fixedLot: 0.01 as number | null,
    maxOpenTrades: 1,
    slTpRequired: true,
  },
  2: {
    pairs: ["EURUSD", "GBPUSD", "AUDUSD", "USDJPY", "USDCAD", "EURJPY", "EURAUD", "GBPCAD"],
    fixedLot: null as number | null,
    maxOpenTrades: 1,
    slTpRequired: false,
  },
  3: {
    pairs: ["EURUSD", "GBPUSD", "AUDUSD", "USDJPY", "USDCAD", "EURJPY", "EURAUD", "GBPCAD"],
    fixedLot: null as number | null,
    maxOpenTrades: 3,
    slTpRequired: false,
  },
} as const

export type StageNumber = keyof typeof STAGES

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
  /** …with this average Disiplin, in %. */
  MIN_DISIPLIN: 80,
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
}

/** The screen line every Akun Latihan page carries. */
export const DISCLAIMER = "Saldo virtual · data historis. Hasil simulasi tidak memprediksi hasil trading nyata."
