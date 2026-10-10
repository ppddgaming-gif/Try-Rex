import { gameDatasets, type GameDataset, type GameLevel } from "@/lib/game-data"
import {
  detectSupportResistance,
  difficultyForLevel,
  FUTURE,
  HISTORY,
  outcomeOf,
  pipSize,
  sliceGame,
  toChartCandles,
  trendSlope,
  xpForLevel,
  zonesFromLevels,
} from "@/lib/game-logic"

// The chart's types and frameOf live in lib/chart-geometry (it carries no
// data, so Akun Latihan's client code can use it without this file's candles).
import type { Candle, Marker, Zone } from "@/lib/chart-geometry"
import type { T } from "@/lib/i18n/translator"
export { frameOf } from "@/lib/chart-geometry"
export type { Candle, Marker, Zone }

export type Decision = "buy" | "sell" | "wait"

export type AspectKey = "trend" | "entry" | "risk" | "structure"

export type Trend = "up" | "down" | "flat"

/** A detected level near the last close: its price, distance in pips and touch count. */
export type NearLevel = { price: number; pips: number; touches: number }

/**
 * What the candles say about a question, as numbers. lib/challenge-text.ts
 * turns these into sentences in the player's language.
 */
export type ChallengeFacts = {
  trend: Trend
  /** Regression slope of the closes, in pips per candle. */
  slopePips: number
  /** Where the last close sits in the 30-candle range, 0–100. */
  rangePos: number
  lo: number
  hi: number
  resistance: NearLevel | null
  support: NearLevel | null
  /** What price did over the 15 hidden candles, in percent. */
  changePercent: number
  /** Unix seconds of the window's first candle (its period). */
  startTime: number
}

export type Challenge = {
  /**
   * "eurusd-1" for a dataset's first window (the original question, so older
   * attempts and links still resolve), "eurusd-1@35" for later windows.
   */
  id: string
  /** The dataset this window was cut from. A round never uses one twice. */
  datasetId: string
  pair: string
  level: GameLevel
  timeframe: string
  digits: number
  difficulty: number
  xp: number
  /** The 30 candles shown as the question. */
  candles: Candle[]
  /** The 15 candles that decide the answer, revealed after submitting. */
  future: Candle[]
  zones: Zone[]
  currentPrice: number
  /** Unix seconds of the five time-axis labels: question, and question + reveal. */
  times: number[]
  revealTimes: number[]
  answer: Decision
  changePercent: number
  focus: AspectKey
  facts: ChallengeFacts
}

/** Five evenly spaced candle times across the window, matching the chart's time axis. */
function axisTimes(candles: { t: number }[], count = 5) {
  if (candles.length === 0) return []
  return Array.from({ length: count }, (_, i) => candles[Math.round((candles.length - 1) * (i / (count - 1)))].t)
}

/**
 * Everything a challenge says about a setup is computed from its candles — the
 * trend slope, the detected levels, and what price actually did next. Nothing
 * here is hand-written per dataset, so the prose can never contradict the chart.
 * The sentences themselves are assembled per language in lib/challenge-text.ts.
 */
function buildChallenge(dataset: GameDataset, start: number): Challenge {
  const { history, future } = sliceGame(dataset.candles, start)
  const { answer, changePercent } = outcomeOf(future)

  const levels = detectSupportResistance(history)
  const zones = zonesFromLevels(levels, history)
  const chartCandles = toChartCandles(history)
  const last = history[history.length - 1].c
  const digits = dataset.digits
  const pip = pipSize(digits)

  const hi = Math.max(...history.map((c) => c.h))
  const lo = Math.min(...history.map((c) => c.l))
  const rangePos = hi === lo ? 50 : Math.round(((last - lo) / (hi - lo)) * 100)

  const slopePips = trendSlope(history) / pip
  const trend: Trend = slopePips > 0.5 ? "up" : slopePips < -0.5 ? "down" : "flat"

  const resistance = levels
    .filter((l) => l.type === "resistance" && l.price > last)
    .sort((a, b) => a.price - b.price)[0]
  const support = levels
    .filter((l) => l.type === "support" && l.price < last)
    .sort((a, b) => b.price - a.price)[0]

  const toResistance = resistance ? Math.round((resistance.price - last) / pip) : null
  const toSupport = support ? Math.round((last - support.price) / pip) : null

  // Which aspect the challenge leans on, from the shape of the setup.
  const focus: AspectKey =
    answer === "wait"
      ? "risk"
      : rangePos >= 80 || rangePos <= 20
        ? "structure"
        : trend === "flat"
          ? "entry"
          : "trend"

  const facts: ChallengeFacts = {
    trend,
    slopePips,
    rangePos,
    lo,
    hi,
    resistance: resistance && toResistance !== null ? { price: resistance.price, pips: toResistance, touches: resistance.touches } : null,
    support: support && toSupport !== null ? { price: support.price, pips: toSupport, touches: support.touches } : null,
    changePercent,
    // The window's own month, not the dataset's: later windows can cross
    // into the next month.
    startTime: history[0].t,
  }

  return {
    id: start === HISTORY ? dataset.id : `${dataset.id}@${start}`,
    datasetId: dataset.id,
    pair: dataset.pair,
    level: dataset.level,
    timeframe: dataset.timeframe,
    digits,
    difficulty: difficultyForLevel(dataset.level),
    xp: xpForLevel(dataset.level),
    candles: chartCandles,
    future: toChartCandles(future),
    zones,
    currentPrice: last,
    times: axisTimes(history),
    revealTimes: axisTimes([...history, ...future]),
    answer,
    changePercent,
    focus,
    facts,
  }
}

/** Candles between the starts of two windows cut from the same dataset. */
export const WINDOW_STRIDE = 5

/**
 * Every question the real data can honestly produce. Each dataset holds about
 * 65 candles; a question needs 45 (30 shown, 15 hidden), so the window slides
 * along in steps of WINDOW_STRIDE: starts 30, 35, 40, 45, 50. That turns 39
 * datasets into 188 questions, every one real price action with a real answer.
 * Overlapping windows from one dataset never share a round (see lib/round.ts).
 */
export const challenges: Challenge[] = gameDatasets.flatMap((dataset) => {
  const out: Challenge[] = []
  for (let start = HISTORY; start + FUTURE <= dataset.candles.length; start += WINDOW_STRIDE) {
    out.push(buildChallenge(dataset, start))
  }
  return out
})

export const challengeById = (id: string | undefined) =>
  id ? challenges.find((c) => c.id === id) : undefined

export const challengesForPair = (symbol: string) => challenges.filter((c) => c.pair === symbol)

export const challengesForLevel = (level: GameLevel) => challenges.filter((c) => c.level === level)

/** Labels: common.levels.<id>. */
export const gameLevels: { id: GameLevel; xp: number }[] = [
  { id: "easy", xp: xpForLevel("easy") },
  { id: "medium", xp: xpForLevel("medium") },
  { id: "hard", xp: xpForLevel("hard") },
]

export const decisionLabels: Record<Decision, string> = {
  buy: "BUY",
  sell: "SELL",
  wait: "WAIT",
}

export function isDecision(value: unknown): value is Decision {
  return value === "buy" || value === "sell" || value === "wait"
}

export function isGameLevel(value: unknown): value is GameLevel {
  return value === "easy" || value === "medium" || value === "hard"
}

/** Outcome of one answer. XP comes from the dataset's level (their EXP_TABLE). */
export function scoreFor(challenge: Challenge, decision: Decision) {
  const correct = decision === challenge.answer
  return {
    correct,
    xp: correct ? challenge.xp : 0,
    /** How decisively the move favoured the right call, as a 0–100 read. */
    accuracy: correct
      ? Math.min(100, 70 + Math.round(Math.abs(challenge.changePercent) * 8))
      : Math.max(10, 50 - Math.round(Math.abs(challenge.changePercent) * 8)),
  }
}

/** Entry / stop / target lines implied by a decision on a given setup. `t` is scoped to game.plan. */
export function tradePlanFor(challenge: Challenge, decision: Decision, t: T): Marker[] {
  const resistance = challenge.zones.find((z) => z.variant === "resistance")
  const support = challenge.zones.find((z) => z.variant === "support")
  const entry: Marker = {
    price: challenge.currentPrice,
    label: decision === "wait" ? t("current") : t("entry"),
    variant: "neutral",
    align: "left",
  }
  if (decision === "wait" || !resistance || !support) return [entry]
  const buying = decision === "buy"
  return [
    {
      price: resistance.to,
      label: buying ? t("tp") : t("sl"),
      variant: buying ? "success" : "danger",
    },
    entry,
    {
      price: support.from,
      label: buying ? t("sl") : t("tp"),
      variant: buying ? "danger" : "success",
    },
  ]
}
