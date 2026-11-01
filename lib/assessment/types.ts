// Shapes of the assessment packages (assessment/packages, sent to the browser),
// their keys (assessment/keys, server only) and a player's run. Pure.

export type Text = { id: string; en: string }

export type Side = "buy" | "sell"
export type Action = Side | "no_trade"
export type EntryType = "market" | "pending"

export const PACKAGE_IDS = ["P-01", "P-02", "P-03", "P-04", "P-05"] as const
export type PackageId = (typeof PACKAGE_IDS)[number]
export const isPackageId = (v: unknown): v is PackageId => typeof v === "string" && (PACKAGE_IDS as readonly string[]).includes(v)

// --- What the browser gets ------------------------------------------------

export type PublicScenario = {
  id: string
  type: "scenario"
  title: Text
  pair: string
  timeframe: string
  balance: number
  briefing: Text
  reasonOptions: string[]
  /** Price decimals: 5, or 3 for JPY pairs. */
  digits: number
  pipSize: number
  /** USD per pip for 1 lot at the start price: a fact of the pair, not a hint. */
  pipValue: number
  playCandles: number
}

export type PublicMcq = {
  id: string
  type: "mcq_complex" | "mcq_basic"
  level: number
  question: Text
  options: { id: string; text: Text }[]
}

export type PublicItem = PublicScenario | PublicMcq

export type PublicPackage = {
  id: PackageId
  title: Text
  showRisk: boolean
  reasons: Record<string, Text>
  closeReasons: Record<string, Text>
  note: Text
  items: PublicItem[]
}

// --- Keys (server only) ---------------------------------------------------

export type ScenarioKey = {
  id: string
  type: "scenario"
  kind: string
  event: { name: Text; utc: string } | null
  decision: { ideal: Action; entry: EntryType | null; acceptable: Action[]; valid_reasons: string[] }
  numbers: {
    reference_price: number
    atr14_pips: number
    invalidation_level: number | null
    pip_value_usd_per_lot: number
    lot_at_1pct: number
    lot_at_2pct: number
    expected_sl_pips: number
    min_tp_pips: number
  }
  feedback: Record<"decision" | "risk" | "sl" | "tp" | "management", Text>
}

export type McqComplexKey = { id: string; type: "mcq_complex"; level: number; source: string; correct: string[]; explanations: Record<string, Text> }
export type McqBasicKey = { id: string; type: "mcq_basic"; level: number; source: string; correct: string; explanation: Text }
export type ItemKey = ScenarioKey | McqComplexKey | McqBasicKey

/** One scenario's window: `context` candles shown before Start, then the play part. */
export type WindowCandles = { digits: number; context: number; t: number[]; o: number[]; h: number[]; l: number[]; c: number[] }

export type Bar = { t: number; o: number; h: number; l: number; c: number }

// --- A run ----------------------------------------------------------------

/** What the player commits to before Start. Prices are absolute; `price` only for pending. */
export type Decision = {
  action: Action
  entry?: EntryType
  price?: number
  lot?: number
  sl?: number
  tp?: number
  reasons: string[]
}

export type ExitReason = "sl" | "tp" | "auto" | "manual"

/** A scenario as it plays: candles revealed, fill and exit (play-part indices, -1 = at Start). */
export type ScenarioRun = {
  d: Decision
  n: number
  f: { i: number; p: number } | null
  x: { i: number; p: number; why: ExitReason; cr?: string } | null
  end: boolean
}

export type Answer = { s: string[] } | ScenarioRun

export type RunState = { v: 1; p: PackageId; iat: number; i: number; a: Answer[] }
