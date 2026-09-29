import type { GameLevel, RawCandle } from "@/lib/game-data"
import type { Candle, Decision, Zone } from "@/lib/mock-data"

/**
 * Ported from Game-data-main/src/utils/* so the app can use the real datasets.
 * Everything here is pure and deterministic — no Math.random(), no clock — which
 * is what lets these run at module load without hydration mismatches. (Their
 * GameChart picked a random start index; we fix it instead.)
 */

/** History window shown as the question, and the future window that scores it. */
export const HISTORY = 30
export const FUTURE = 15

/** Their EXP_TABLE from utils/gameLogic.js. */
const EXP_TABLE: Record<GameLevel, number> = {
  easy: 25,
  medium: 75,
  hard: 150,
}

export const xpForLevel = (level: GameLevel) => EXP_TABLE[level]

export const difficultyForLevel = (level: GameLevel) =>
  level === "easy" ? 2 : level === "medium" ? 3 : 5

/** Their sliceGameData(), with the window sizes named. */
export function sliceGame(candles: RawCandle[], startIndex = HISTORY) {
  return {
    history: candles.slice(startIndex - HISTORY, startIndex),
    future: candles.slice(startIndex, startIndex + FUTURE),
  }
}

/** The SVG chart wants {o,h,l,c}; the datasets carry {t,o,h,l,c,v}. */
export const toChartCandles = (raw: RawCandle[]): Candle[] =>
  raw.map((c) => ({ o: c.o, h: c.h, l: c.l, c: c.c }))

/**
 * Their evaluateDecision(), minus the copy: entry is the first future open, exit
 * the last future close, and a move inside ±0.1% counts as going nowhere.
 */
export const FLAT_THRESHOLD = 0.1

export function outcomeOf(future: RawCandle[]): { answer: Decision; changePercent: number } {
  const entry = future[0].o
  const exit = future[future.length - 1].c
  const changePercent = ((exit - entry) / entry) * 100
  const answer: Decision =
    changePercent > FLAT_THRESHOLD ? "buy" : changePercent < -FLAT_THRESHOLD ? "sell" : "wait"
  return { answer, changePercent }
}

type Level = { price: number; type: "resistance" | "support"; touches: number }

/** Their detectSupportResistance(): swing points, clustered, top 3 by touches. */
export function detectSupportResistance(candles: RawCandle[], sensitivity = 0.0015): Level[] {
  const swingHighs: RawCandle[] = []
  const swingLows: RawCandle[] = []

  for (let i = 2; i < candles.length - 2; i++) {
    const c = candles[i]
    if (c.h > candles[i - 1].h && c.h > candles[i - 2].h && c.h > candles[i + 1].h && c.h > candles[i + 2].h) {
      swingHighs.push(c)
    }
    if (c.l < candles[i - 1].l && c.l < candles[i - 2].l && c.l < candles[i + 1].l && c.l < candles[i + 2].l) {
      swingLows.push(c)
    }
  }

  const allLevels = [
    ...swingHighs.map((c) => ({ price: c.h, type: "resistance" as const })),
    ...swingLows.map((c) => ({ price: c.l, type: "support" as const })),
  ]

  const avgPrice = candles.reduce((s, c) => s + c.c, 0) / candles.length
  const threshold = avgPrice * sensitivity

  const clusters: Level[] = []
  const used = new Set<number>()

  allLevels.forEach((level, i) => {
    if (used.has(i)) return
    const cluster = [level]
    used.add(i)
    allLevels.forEach((other, j) => {
      if (!used.has(j) && Math.abs(level.price - other.price) < threshold) {
        cluster.push(other)
        used.add(j)
      }
    })
    clusters.push({
      price: cluster.reduce((s, l) => s + l.price, 0) / cluster.length,
      type: level.type,
      touches: cluster.length,
    })
  })

  return clusters.sort((a, b) => b.touches - a.touches).slice(0, 3)
}

/**
 * Detected levels become chart zones. A level is a line, so give it a band of
 * ±`padPct` of the window range to stay visible.
 */
export function zonesFromLevels(levels: Level[], candles: RawCandle[]): Zone[] {
  const hi = Math.max(...candles.map((c) => c.h))
  const lo = Math.min(...candles.map((c) => c.l))
  const pad = (hi - lo) * 0.008 || 0.0005

  // Keep the strongest of each side so a chart never shows two stacked bands.
  const strongest = (type: "resistance" | "support") =>
    levels.filter((l) => l.type === type).sort((a, b) => b.touches - a.touches)[0]

  const zones: Zone[] = []
  for (const type of ["resistance", "support"] as const) {
    const level = strongest(type)
    if (!level) continue
    zones.push({
      from: level.price - pad,
      to: level.price + pad,
      variant: type,
      label: type === "resistance" ? "RESISTANCE" : "SUPPORT",
    })
  }
  return zones
}

/** Their linear regression, kept for the trend read. */
function regression(points: { x: number; y: number }[]) {
  const n = points.length
  if (n < 2) return null
  const sumX = points.reduce((s, p) => s + p.x, 0)
  const sumY = points.reduce((s, p) => s + p.y, 0)
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0)
  const sumX2 = points.reduce((s, p) => s + p.x * p.x, 0)
  const denom = n * sumX2 - sumX * sumX
  if (denom === 0) return null
  const slope = (n * sumXY - sumX * sumY) / denom
  return { slope, intercept: (sumY - slope * sumX) / n }
}

/** Slope of closes across the window, in price units per candle. */
export function trendSlope(candles: RawCandle[]) {
  const reg = regression(candles.map((c, x) => ({ x, y: c.c })))
  return reg ? reg.slope : 0
}

/** 1 pip: 0.0001 for 5-decimal pairs, 0.01 for 3-decimal JPY crosses. */
export const pipSize = (digits: number) => Math.pow(10, -(digits - 1))

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"]

/** Fixed UTC formatting — never locale- or timezone-dependent. */
export function labelFor(unixSeconds: number) {
  const d = new Date(unixSeconds * 1000)
  const day = String(d.getUTCDate()).padStart(2, "0")
  const hh = String(d.getUTCHours()).padStart(2, "0")
  return `${day} ${MONTHS[d.getUTCMonth()]} ${hh}:00`
}

/** Five evenly spaced labels across the window, matching the chart's time axis. */
export function timeLabelsFor(candles: RawCandle[], count = 5) {
  if (candles.length === 0) return []
  return Array.from({ length: count }, (_, i) => {
    const idx = Math.round((candles.length - 1) * (i / (count - 1)))
    return labelFor(candles[idx].t)
  })
}
