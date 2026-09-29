import { gameDatasets, type GameDataset, type GameLevel } from "@/lib/game-data"
import {
  detectSupportResistance,
  difficultyForLevel,
  outcomeOf,
  pipSize,
  sliceGame,
  timeLabelsFor,
  toChartCandles,
  trendSlope,
  xpForLevel,
  zonesFromLevels,
} from "@/lib/game-logic"

export type Candle = {
  o: number
  h: number
  l: number
  c: number
}

export type Zone = {
  from: number
  to: number
  variant: "resistance" | "support"
  label?: string
}

export type Marker = {
  price: number
  label: string
  variant: "neutral" | "danger" | "success"
  align?: "left" | "right"
}

export type Decision = "buy" | "sell" | "wait"

export type AspectKey = "trend" | "entry" | "risk" | "structure"

const round = (v: number, digits: number) => Number(v.toFixed(digits))

/**
 * CandlestickChart does no autoscaling, so derive a frame guaranteed to contain
 * the data instead of hand-tuning min / max / priceTicks at every call site.
 * Step selection is scale-free, so it works for both 1.08 majors and 105 JPY.
 */
export function frameOf(candles: Candle[]): { min: number; max: number; priceTicks: number[] } {
  const lo = Math.min(...candles.map((c) => c.l))
  const hi = Math.max(...candles.map((c) => c.h))
  const pad = (hi - lo) * 0.12 || Math.abs(hi) * 0.001 || 0.001
  const span = hi - lo + pad * 2

  const rough = span / 8
  const magnitude = Math.pow(10, Math.floor(Math.log10(rough)))
  const step =
    [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => span / s <= 10) ?? 10 * magnitude

  // Enough decimals to describe the step exactly, so ticks never drift.
  const dp = Math.max(0, Math.min(8, Math.ceil(-Math.log10(step)) + 1))
  const min = round(Math.floor((lo - pad) / step) * step, dp)
  const max = round(Math.ceil((hi + pad) / step) * step, dp)

  const priceTicks: number[] = []
  const steps = Math.round((max - min) / step)
  for (let i = 0; i <= steps; i++) priceTicks.push(round(min + i * step, dp))

  return { min, max, priceTicks }
}

export type Challenge = {
  /** Dataset id, e.g. "eurusd-1". */
  id: string
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
function buildChallenge(dataset: GameDataset): Challenge {
  const { history, future } = sliceGame(dataset.candles)
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

  const situation =
    `${dataset.pair} ${dataset.timeframe}, ${dataset.period}. Trend cenderung ${trendWord} dan harga kini di ${rangePos}% dari rentang 30 candle terakhir. ` +
    (toResistance !== null && toSupport !== null
      ? `Resistance ${toResistance} pip di atas, support ${toSupport} pip di bawah.`
      : toResistance !== null
        ? `Resistance ${toResistance} pip di atas harga sekarang.`
        : toSupport !== null
          ? `Support ${toSupport} pip di bawah harga sekarang.`
          : "Tidak ada level kuat di dekat harga sekarang.")

  return {
    id: dataset.id,
    pair: dataset.pair,
    level: dataset.level,
    timeframe: dataset.timeframe,
    period: dataset.period,
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

export const challenges: Challenge[] = gameDatasets.map(buildChallenge)

export const challengeById = (id: string | undefined) =>
  id ? challenges.find((c) => c.id === id) : undefined

export const challengesForPair = (symbol: string) => challenges.filter((c) => c.pair === symbol)

export const challengesForLevel = (level: GameLevel) => challenges.filter((c) => c.level === level)

const ANSWER_ORDER: Decision[] = ["buy", "sell", "wait"]

/**
 * The source data leans heavily bullish (27 buy / 9 sell / 3 wait across all 39
 * datasets), so drawing a round in file order would hand you five BUYs in a row
 * and the game would reduce to always pressing BUY. Rotate through answers
 * first, then prefer a pair different from the previous question.
 *
 * Answer variety is guaranteed; pair variety is best effort. On `hard` a pair can
 * repeat, because the empty gbpnzd_*.js files leave only two usable hard pairs and
 * GBPCAD is buy in all five of its datasets — so sell and wait can only come from
 * EURAUD. Deterministic: the same level always yields the same round.
 */
export function roundFor(level: GameLevel, size = 5): Challenge[] {
  const queues = new Map<Decision, Challenge[]>(ANSWER_ORDER.map((a) => [a, []]))
  for (const c of challengesForLevel(level)) queues.get(c.answer)?.push(c)

  const round: Challenge[] = []
  for (let turn = 0; round.length < size; turn++) {
    let picked: Challenge | undefined
    for (let k = 0; k < ANSWER_ORDER.length && !picked; k++) {
      const answer = ANSWER_ORDER[(turn + k) % ANSWER_ORDER.length]
      const queue = queues.get(answer)
      if (!queue || queue.length === 0) continue

      // How many still-unplayed questions of the *other* answers each pair owns.
      // Spending an in-demand pair now can strand a scarce answer later, so rank
      // it lower — that is what keeps `hard` from stacking three EURAUDs.
      const demand = new Map<string, number>()
      for (const [a, q] of queues) {
        if (a === answer) continue
        for (const c of q) demand.set(c.pair, (demand.get(c.pair) ?? 0) + 1)
      }

      const prev = round[round.length - 1]
      let bestIndex = 0
      let bestCost = Number.POSITIVE_INFINITY
      queue.forEach((c, i) => {
        const cost = (prev && c.pair === prev.pair ? 100 : 0) + (demand.get(c.pair) ?? 0)
        if (cost < bestCost) {
          bestCost = cost
          bestIndex = i
        }
      })
      picked = queue.splice(bestIndex, 1)[0]
    }
    if (!picked) break
    round.push(picked)
  }
  return round
}

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
