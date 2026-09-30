import { gameDatasets, type GameDataset, type GameLevel } from "@/lib/game-data"
import {
  detectSupportResistance,
  difficultyForLevel,
  FUTURE,
  HISTORY,
  outcomeOf,
  pipSize,
  sliceGame,
  timeLabelsFor,
  toChartCandles,
  trendSlope,
  xpForLevel,
  zonesFromLevels,
} from "@/lib/game-logic"

// The chart's types and frameOf live in lib/chart-geometry (it carries no
// data, so Akun Latihan's client code can use it without this file's candles).
import type { Candle, Marker, Zone } from "@/lib/chart-geometry"
export { frameOf } from "@/lib/chart-geometry"
export type { Candle, Marker, Zone }

export type Decision = "buy" | "sell" | "wait"

export type AspectKey = "trend" | "entry" | "risk" | "structure"

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
  period: string
  digits: number
  difficulty: number
  xp: number
  /** The 30 candles shown as the question. */
  candles: Candle[]
  /** The 15 candles that decide the answer, revealed after submitting. */
  future: Candle[]
  zones: Zone[]
  currentPrice: number
  timeLabels: string[]
  revealTimeLabels: string[]
  situation: string
  answer: Decision
  changePercent: number
  focus: AspectKey
  reasons: string[]
  suggestion: string
  feedback: Record<Decision, string>
}

const pct = (v: number) => `${v > 0 ? "+" : ""}${v.toFixed(2)}%`

/**
 * Everything a challenge says about a setup is computed from its candles — the
 * trend slope, the detected levels, and what price actually did next. Nothing
 * here is hand-written per dataset, so the prose can never contradict the chart.
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
  const trendWord = slopePips > 0.5 ? "naik" : slopePips < -0.5 ? "turun" : "menyamping"

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
        : trendWord === "menyamping"
          ? "entry"
          : "trend"

  const reasons = [
    `Trend 30 candle terakhir cenderung ${trendWord} (kemiringan ${slopePips > 0 ? "+" : ""}${slopePips.toFixed(1)} pip per candle).`,
    resistance && toResistance !== null
      ? `Resistance terdekat di ${resistance.price.toFixed(digits)}, sekitar ${toResistance} pip di atas harga sekarang (${resistance.touches}x tersentuh).`
      : "Tidak ada resistance jelas di atas harga sekarang dalam 30 candle terakhir.",
    support && toSupport !== null
      ? `Support terdekat di ${support.price.toFixed(digits)}, sekitar ${toSupport} pip di bawah harga sekarang (${support.touches}x tersentuh).`
      : "Tidak ada support jelas di bawah harga sekarang dalam 30 candle terakhir.",
    `Harga berada di ${rangePos}% dari rentang 30 candle terakhir (${lo.toFixed(digits)} – ${hi.toFixed(digits)}).`,
    `Hasilnya: 15 candle berikutnya bergerak ${pct(changePercent)} dari harga entry.`,
  ]

  const suggestionByAnswer: Record<Decision, string> = {
    buy: `Harga naik ${pct(changePercent)} setelah titik ini, jadi BUY adalah jawabannya. Cari konfirmasi searah trend lebih dulu, dan taruh stop loss di bawah support terdekat${toSupport !== null ? ` (sekitar ${toSupport} pip)` : ""}.`,
    sell: `Harga turun ${pct(changePercent)} setelah titik ini, jadi SELL adalah jawabannya. Tunggu penolakan di area resistance, dan taruh stop loss di atas resistance terdekat${toResistance !== null ? ` (sekitar ${toResistance} pip)` : ""}.`,
    wait: `Harga hanya bergerak ${pct(changePercent)} — di bawah ambang ±0,1% — jadi WAIT adalah jawabannya. Saat market tidak memberi keunggulan arah, tidak mengambil posisi juga sebuah keputusan.`,
  }

  const moved = Math.abs(changePercent).toFixed(2)
  const feedback: Record<Decision, string> = {
    buy:
      answer === "buy"
        ? `Tepat. Harga naik ${moved}% dalam 15 candle berikutnya.`
        : answer === "sell"
          ? `Kurang tepat. Harga justru turun ${moved}% setelah titik ini.`
          : `Kurang tepat. Harga hampir tidak bergerak (${pct(changePercent)}), jadi posisi beli tidak menghasilkan apa-apa.`,
    sell:
      answer === "sell"
        ? `Tepat. Harga turun ${moved}% dalam 15 candle berikutnya.`
        : answer === "buy"
          ? `Kurang tepat. Harga justru naik ${moved}% setelah titik ini.`
          : `Kurang tepat. Harga hampir tidak bergerak (${pct(changePercent)}), jadi posisi jual tidak menghasilkan apa-apa.`,
    wait:
      answer === "wait"
        ? `Tepat. Harga hanya bergerak ${pct(changePercent)}, masih di dalam ambang ±0,1%.`
        : `Kurang tepat. Harga bergerak ${pct(changePercent)} — cukup besar untuk diambil, bukan dilewatkan.`,
  }

  // The window's own month, not the dataset's: later windows can cross into
  // the next month. UTC, so server and browser print the same thing.
  const period = periodFmt.format(new Date(history[0].t * 1000))

  const situation =
    `${dataset.pair} ${dataset.timeframe}, ${period}. Trend cenderung ${trendWord} dan harga kini di ${rangePos}% dari rentang 30 candle terakhir. ` +
    (toResistance !== null && toSupport !== null
      ? `Resistance ${toResistance} pip di atas, support ${toSupport} pip di bawah.`
      : toResistance !== null
        ? `Resistance ${toResistance} pip di atas harga sekarang.`
        : toSupport !== null
          ? `Support ${toSupport} pip di bawah harga sekarang.`
          : "Tidak ada level kuat di dekat harga sekarang.")

  return {
    id: start === HISTORY ? dataset.id : `${dataset.id}@${start}`,
    datasetId: dataset.id,
    pair: dataset.pair,
    level: dataset.level,
    timeframe: dataset.timeframe,
    period,
    digits,
    difficulty: difficultyForLevel(dataset.level),
    xp: xpForLevel(dataset.level),
    candles: chartCandles,
    future: toChartCandles(future),
    zones,
    currentPrice: last,
    timeLabels: timeLabelsFor(history),
    revealTimeLabels: timeLabelsFor([...history, ...future]),
    situation,
    answer,
    changePercent,
    focus,
    reasons,
    suggestion: suggestionByAnswer[answer],
    feedback,
  }
}

const periodFmt = new Intl.DateTimeFormat("id-ID", { month: "short", year: "numeric", timeZone: "UTC" })

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

export const gameLevels: { id: GameLevel; label: string; xp: number }[] = [
  { id: "easy", label: "Mudah", xp: xpForLevel("easy") },
  { id: "medium", label: "Menengah", xp: xpForLevel("medium") },
  { id: "hard", label: "Sulit", xp: xpForLevel("hard") },
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

/** Entry / stop / target lines implied by a decision on a given setup. */
export function tradePlanFor(challenge: Challenge, decision: Decision): Marker[] {
  const resistance = challenge.zones.find((z) => z.variant === "resistance")
  const support = challenge.zones.find((z) => z.variant === "support")
  const entry: Marker = {
    price: challenge.currentPrice,
    label: decision === "wait" ? "Harga Sekarang" : "Entry-mu",
    variant: "neutral",
    align: "left",
  }
  if (decision === "wait" || !resistance || !support) return [entry]
  const buying = decision === "buy"
  return [
    {
      price: resistance.to,
      label: buying ? "Take Profit" : "Stop Loss",
      variant: buying ? "success" : "danger",
    },
    entry,
    {
      price: support.from,
      label: buying ? "Stop Loss" : "Take Profit",
      variant: buying ? "danger" : "success",
    },
  ]
}
