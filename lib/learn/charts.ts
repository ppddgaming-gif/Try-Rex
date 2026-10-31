import { gameDatasets, type GameDataset, type RawCandle } from "@/lib/game-data"
import { detectSupportResistance, trendSlope, zonesFromLevels } from "@/lib/game-logic"
import type { Candle, Zone } from "@/lib/chart-geometry"
import { ema, rsi } from "@/lib/live/indicators"
import type { ChartPick } from "@/lib/learn/types"

// Lessons illustrate with real historical candles from the game data, chosen
// by what they show (a computed slope or range), never by a hard-coded id,
// so they survive data changes. Everything drawn on them (zones, swings,
// trendlines, EMA, RSI, ATR) is computed from those candles. Deterministic.
// Server side only: the game data never reaches the browser from here.

export type Swing = { index: number; price: number; kind: "high" | "low"; label: "HH" | "HL" | "LH" | "LL" | null }
export type Panel = { label?: string; candles: Candle[]; times: number[] }
export type SubPanel = { kind: "rsi" | "atr"; values: (number | null)[]; min: number; max: number; guides: number[]; decimals: number }

export type LearnChart = {
  pair: string
  timeframe: string
  digits: number
  /** Unix seconds of the first candle shown, for the period label. */
  start: number
  panels: Panel[]
  zones?: Zone[]
  swings?: Swing[]
  /** A line through two candle indexes, extended to the right edge. */
  trendline?: { i1: number; p1: number; i2: number; p2: number }
  lines?: { id: "ema20" | "ema50"; values: (number | null)[] }[]
  sub?: SubPanel
}

const MAJORS = ["EURUSD", "GBPUSD", "AUDUSD", "USDCAD", "USDJPY", "EURJPY"]
const pool = () => [...gameDatasets].filter((d) => MAJORS.includes(d.pair) && d.candles.length >= 55).sort((a, b) => a.id.localeCompare(b.id))

const candlesOf = (raw: RawCandle[]): Candle[] => raw.map((c) => ({ o: c.o, h: c.h, l: c.l, c: c.c }))
const range = (raw: RawCandle[]) => Math.max(...raw.map((c) => c.h)) - Math.min(...raw.map((c) => c.l))
/** Slope over the whole window as a share of its range: + up, − down, near 0 flat. */
const steepness = (raw: RawCandle[]) => (trendSlope(raw) * raw.length) / (range(raw) || 1)

function byTrend(kind: "up" | "down" | "flat"): GameDataset {
  const ds = pool()
  const score = (d: GameDataset) => (kind === "up" ? steepness(d.candles) : kind === "down" ? -steepness(d.candles) : -Math.abs(steepness(d.candles)))
  return ds.reduce((best, d) => (score(d) > score(best) ? d : best), ds[0])
}

/** Fractal swings: a high above the n candles either side (low: below). */
export function swingsOf(raw: readonly { h: number; l: number }[], n = 3): Swing[] {
  const out: Swing[] = []
  for (let i = n; i < raw.length - n; i++) {
    const around = [...raw.slice(i - n, i), ...raw.slice(i + 1, i + n + 1)]
    if (around.every((c) => c.h < raw[i].h)) out.push({ index: i, price: raw[i].h, kind: "high", label: null })
    if (around.every((c) => c.l > raw[i].l)) out.push({ index: i, price: raw[i].l, kind: "low", label: null })
  }
  // Label each swing against the previous swing of the same kind.
  let lastHigh: number | null = null
  let lastLow: number | null = null
  for (const s of out) {
    if (s.kind === "high") {
      s.label = lastHigh === null ? null : s.price > lastHigh ? "HH" : "LH"
      lastHigh = s.price
    } else {
      s.label = lastLow === null ? null : s.price > lastLow ? "HL" : "LL"
      lastLow = s.price
    }
  }
  return out
}

/** Wilder's ATR in pips: the first value is the mean of the first `period` true ranges. */
export function atrPips(raw: readonly RawCandle[], digits: number, period = 14): (number | null)[] {
  const pip = 10 ** -(digits - 1)
  const out: (number | null)[] = []
  let sum = 0
  let value: number | null = null
  raw.forEach((c, i) => {
    const prev = i > 0 ? raw[i - 1].c : null
    const tr = prev === null ? c.h - c.l : Math.max(c.h - c.l, Math.abs(c.h - prev), Math.abs(c.l - prev))
    if (i < period) {
      sum += tr
      if (i === period - 1) value = sum / period
    } else value = ((value as number) * (period - 1) + tr) / period
    out.push(value === null ? null : value / pip)
  })
  return out
}

/** Group H4 candles into D1 by UTC day. */
function toDaily(raw: readonly RawCandle[]): RawCandle[] {
  const out: RawCandle[] = []
  for (const c of raw) {
    const day = c.t - (c.t % 86_400)
    const cur = out[out.length - 1]
    if (cur && cur.t === day) {
      cur.h = Math.max(cur.h, c.h)
      cur.l = Math.min(cur.l, c.l)
      cur.c = c.c
      cur.v += c.v
    } else out.push({ ...c, t: day })
  }
  return out
}

const axis = (raw: readonly RawCandle[], count = 5) =>
  Array.from({ length: count }, (_, k) => raw[Math.round((k * (raw.length - 1)) / (count - 1))].t)

function base(d: GameDataset, raw: RawCandle[], label?: string): LearnChart {
  return { pair: d.pair, timeframe: d.timeframe, digits: d.digits, start: raw[0].t, panels: [{ label, candles: candlesOf(raw), times: axis(raw) }] }
}

export function chartFor(pick: ChartPick): LearnChart {
  switch (pick) {
    case "uptrend":
    case "downtrend":
    case "sideways": {
      const d = byTrend(pick === "uptrend" ? "up" : pick === "downtrend" ? "down" : "flat")
      return base(d, d.candles.slice(-45))
    }
    case "levels": {
      // The window whose detected zones include both a support and a resistance, flattest first.
      const ds = pool().sort((a, b) => Math.abs(steepness(a.candles)) - Math.abs(steepness(b.candles)))
      for (const d of ds) {
        const raw = d.candles.slice(-45)
        const zones = zonesFromLevels(detectSupportResistance(raw), raw)
        if (zones.some((z) => z.variant === "support") && zones.some((z) => z.variant === "resistance")) return { ...base(d, raw), zones }
      }
      const d = ds[0]
      return base(d, d.candles.slice(-45))
    }
    case "candles": {
      const d = byTrend("flat")
      return base(d, d.candles.slice(-16))
    }
    case "timeframes": {
      const d = byTrend("up")
      const daily = toDaily(d.candles)
      return {
        pair: d.pair,
        timeframe: d.timeframe,
        digits: d.digits,
        start: d.candles[0].t,
        panels: [
          { label: "H4", candles: candlesOf(d.candles), times: axis(d.candles) },
          { label: "D1", candles: candlesOf(daily), times: axis(daily) },
        ],
      }
    }
    case "swings": {
      const d = byTrend("up")
      return { ...base(d, d.candles), swings: swingsOf(d.candles) }
    }
    case "trendline": {
      const d = byTrend("up")
      const lows = swingsOf(d.candles).filter((s) => s.kind === "low")
      // The first rising pair of swing lows whose line no later close cuts through.
      for (let a = 0; a < lows.length; a++) {
        for (let b = a + 1; b < lows.length; b++) {
          const s1 = lows[a]
          const s2 = lows[b]
          if (s2.price <= s1.price) continue
          const slope = (s2.price - s1.price) / (s2.index - s1.index)
          const clean = d.candles.slice(s1.index, s2.index + 1).every((c, k) => Math.min(c.o, c.c) >= s1.price + slope * k - 1e-9)
          if (clean) return { ...base(d, d.candles), trendline: { i1: s1.index, p1: s1.price, i2: s2.index, p2: s2.price } }
        }
      }
      return base(d, d.candles)
    }
    case "ema": {
      const d = byTrend("up")
      const closes = d.candles.map((c) => c.c)
      return { ...base(d, d.candles), lines: [{ id: "ema50", values: ema(closes, 50) }, { id: "ema20", values: ema(closes, 20) }] }
    }
    case "rsi": {
      const d = byTrend("up")
      return { ...base(d, d.candles), sub: { kind: "rsi", values: rsi(d.candles.map((c) => c.c), 14), min: 0, max: 100, guides: [30, 50, 70], decimals: 0 } }
    }
    case "atr": {
      const d = byTrend("flat")
      const values = atrPips(d.candles, d.digits)
      const top = Math.max(...values.filter((v): v is number => v !== null))
      return { ...base(d, d.candles), sub: { kind: "atr", values, min: 0, max: Math.ceil((top * 1.2) / 10) * 10, guides: [], decimals: 0 } }
    }
  }
}
