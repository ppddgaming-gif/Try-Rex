import { M15, MARKET } from "@/lib/live/config"
import { extremes, priceAt, type PathBar } from "@/lib/live/path"

// The market at one moment of the data, built from M15 candles alone: every
// other timeframe is M15 grouped (verified identical to the exported M30/H1/H4
// files for all nine pairs), the forming candle, and whether the market is
// open. Pure. Nothing here returns a candle, or part of one, after `now`.

export type Bar = PathBar

/** Index of the last bar with t <= `t`, or -1. `bars` ascending. */
export function lastAtOrBefore(bars: readonly Bar[], t: number) {
  let lo = 0
  let hi = bars.length - 1
  let found = -1
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    if (bars[mid].t <= t) {
      found = mid
      lo = mid + 1
    } else hi = mid - 1
  }
  return found
}

/** Group M15 bars into `step`-second candles (bucket = t − t mod step), as the data's own files do. */
export function aggregate(m15: readonly Bar[], step: number): Bar[] {
  if (step === M15) return m15.map((b) => ({ ...b }))
  const out: Bar[] = []
  for (const b of m15) {
    const t = b.t - (((b.t % step) + step) % step)
    const cur = out[out.length - 1]
    if (cur && cur.t === t) {
      cur.h = Math.max(cur.h, b.h)
      cur.l = Math.min(cur.l, b.l)
      cur.c = b.c
    } else out.push({ t, o: b.o, h: b.h, l: b.l, c: b.c })
  }
  return out
}

/** The M15 candle forming at `now` (t <= now < t + 900), or null when the market has no candle then. */
export function formingBar(m15: readonly Bar[], now: number) {
  const i = lastAtOrBefore(m15, now)
  return i >= 0 && now < m15[i].t + M15 ? m15[i] : null
}

/** The forming M15 candle as far as `now`: open, current price, high and low so far. Never its close. */
export function soFar(pair: string, bar: Bar, now: number, digits: number) {
  const s = now - bar.t
  const { h, l } = extremes(pair, bar, 0, s, digits)
  return { t: bar.t, o: bar.o, h, l, c: priceAt(pair, bar, s, digits) }
}

/** The bid at `now`: the forming candle's path, or the last close while the market is closed. */
export function bidAt(pair: string, m15: readonly Bar[], now: number, digits: number) {
  const bar = formingBar(m15, now)
  if (bar) return priceAt(pair, bar, now - bar.t, digits)
  const i = lastAtOrBefore(m15, now)
  return i >= 0 ? m15[i].c : null
}

export type ChartCandles = {
  /** Candles of `step` that have fully closed by `now`, oldest first, the last `count`. */
  closed: Bar[]
  /** The candle of `step` still forming at `now`, built only from what has happened by `now`; null if none. */
  forming: Bar | null
}

/**
 * The chart for one timeframe at `now`. A candle of `step` is closed once its
 * time is up; the one still forming merges the M15 candles closed so far with
 * the M15 candle forming now (only as far as now).
 */
export function chartAt(pair: string, m15: readonly Bar[], now: number, step: number, count: number, digits: number): ChartCandles {
  const end = lastAtOrBefore(m15, now)
  const past = m15.slice(0, end + 1).filter((b) => b.t + M15 <= now)
  const live = formingBar(m15, now)
  const bucket = now - (((now % step) + step) % step)
  const grouped = aggregate(past, step)
  const closed = grouped.filter((b) => b.t + step <= now).slice(-count)

  let forming: Bar | null = grouped.find((b) => b.t === bucket) ?? null
  if (live) {
    const part = soFar(pair, live, now, digits)
    forming = forming
      ? { t: forming.t, o: forming.o, h: Math.max(forming.h, part.h), l: Math.min(forming.l, part.l), c: part.c }
      : { ...part, t: bucket }
  }
  return { closed, forming }
}

/** The market at `now`: open while an M15 candle is forming; otherwise closed, with the seconds until the next candle. */
export function marketStatus(m15: readonly Bar[], now: number) {
  if (formingBar(m15, now)) return { open: true as const, opensIn: 0 }
  const i = lastAtOrBefore(m15, now)
  const next = m15[i + 1]
  return { open: false as const, opensIn: next ? next.t - now : null }
}

/**
 * True when `bars[i]` is the last candle before the market closes: the next
 * candle is at least CLOSE_GAP_SECONDS after it ends, at or past `stopAt`
 * (the end of the account's data range), or missing.
 */
export function closesAfter(bars: readonly Bar[], i: number, stopAt = Infinity) {
  const next = bars[i + 1]
  if (!next) return true
  return next.t >= stopAt || next.t - (bars[i].t + M15) >= MARKET.CLOSE_GAP_SECONDS
}

/** Average (high − low) of the last `n` M15 candles closed by `now`. */
export function averageRangeAt(m15: readonly Bar[], now: number, n: number) {
  const end = lastAtOrBefore(m15, now)
  const recent = m15.slice(0, end + 1).filter((b) => b.t + M15 <= now).slice(-n)
  if (recent.length === 0) return 0
  return recent.reduce((s, b) => s + (b.h - b.l), 0) / recent.length
}
