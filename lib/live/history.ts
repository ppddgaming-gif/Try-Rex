import { INDICATORS, type IndicatorId, type Series } from "@/lib/live/indicators"

// Older candles on the trading screen. Every poll sends the latest
// CHART.BARS candles; the browser keeps the ones that have scrolled out of
// that window, and fetches older ones in batches when the player pans back
// (POST /api/akun-latihan/chart/history). They are kept at their real time
// (the chart's anchor + their relative time), which never changes for a
// candle while the account's clock stays put, so they merge with every later
// poll. If the clock jumps (the data range changes at a weekend), the same
// real times hold different candles: the browser sees the mismatch and
// starts over. Pure and client-safe.

/** A closed candle the browser keeps: its real open time `T`, and its indicator values. */
export type PastBar = { T: number; o: number; h: number; l: number; c: number } & Record<IndicatorId, number | null>

export type Past = {
  /** "pair|timeframe": a kept candle only belongs to its own chart. */
  key: string
  /** Oldest first, all older than the poll's window. */
  bars: PastBar[]
  /** Candles added at the front by history fetches: the chart shifts its view by this. */
  lead: number
  /** No older candles to fetch (the start of the data the account may see). */
  done: boolean
  /** Counts the times this chart started over, so the screen resets its view with it. */
  gen: number
}

export const emptyPast = (key: string, gen = 0): Past => ({ key, bars: [], lead: 0, done: false, gen })

/** The same chart starting over: nothing kept, a new generation. */
const restart = (past: Past): Past => emptyPast(past.key, past.gen + 1)

type Rel = { t: number; o: number; h: number; l: number; c: number }

/** What a poll or a history fetch carries: candles relative to `anchor`, one indicator value per candle. */
export type ChartPart = {
  anchor: number
  candles: Rel[]
  forming?: Rel | null
  indicators: Record<IndicatorId, Series>
}

/** The closed candles of a chart, kept form. */
function closedBars(part: ChartPart): PastBar[] {
  return part.candles.map((c, i) => {
    const bar = { T: part.anchor + c.t, o: c.o, h: c.h, l: c.l, c: c.c } as PastBar
    for (const id of INDICATORS) bar[id] = part.indicators[id]?.[i] ?? null
    return bar
  })
}

const sameCandle = (a: PastBar, b: PastBar) => a.o === b.o && a.h === b.h && a.l === b.l && a.c === b.c

/**
 * After a poll: the candles of the previous window that the new one has left
 * behind join the kept ones. The two windows must agree wherever they
 * overlap, and must overlap at all (a tab asleep long enough leaves a hole);
 * otherwise everything kept is dropped.
 */
export function rollPast(past: Past, key: string, prev: ChartPart | null, next: ChartPart | null): Past {
  if (key !== past.key) return emptyPast(key)
  if (!prev || !next) return past
  const a = closedBars(prev)
  const b = closedBars(next)
  if (a.length === 0 || b.length === 0) return past
  const first = b[0].T
  if (a[a.length - 1].T < first) return restart(past)
  const byTime = new Map(b.map((x) => [x.T, x]))
  for (const x of a) {
    if (x.T < first) continue
    const y = byTime.get(x.T)
    if (!y || !sameCandle(x, y)) return restart(past)
  }
  // The kept candles end right before the previous window began (each roll and
  // each history batch ends there), so what that window left behind follows on.
  const last = past.bars.length ? past.bars[past.bars.length - 1].T : -Infinity
  const left = a.filter((x) => x.T < first && x.T > last)
  return left.length ? { ...past, bars: [...past.bars, ...left] } : past
}

/** The real time of the oldest candle on the chart: where the next history batch ends. */
export const oldestTime = (past: Past, part: ChartPart) => (past.bars.length ? past.bars[0].T : part.anchor + (part.candles[0]?.t ?? 0))

/**
 * A history batch asked for with `before` (the real time of the oldest
 * candle then), added at the front of the chart now showing `part`. A batch
 * for another chart, or whose front has moved since, is ignored.
 */
export function prependPast(past: Past, key: string, part: ChartPart, before: number, got: ChartPart & { done: boolean }): Past {
  if (key !== past.key || oldestTime(past, part) !== before) return past
  const older = closedBars(got).filter((b) => b.T < before)
  return { ...past, bars: [...older, ...past.bars], lead: past.lead + older.length, done: got.done || older.length === 0 }
}

/** The chart as drawn: kept candles, then the poll's closed candles and the forming one, all relative to the poll's anchor. */
export function mergeChart(past: Past, part: ChartPart): { candles: Rel[]; indicators: Record<IndicatorId, Series> } {
  const first = part.candles.length ? part.anchor + part.candles[0].t : Infinity
  const kept = past.bars.filter((b) => b.T < first)
  const candles = [
    ...kept.map((b) => ({ t: b.T - part.anchor, o: b.o, h: b.h, l: b.l, c: b.c })),
    ...part.candles,
    ...(part.forming ? [part.forming] : []),
  ]
  const indicators = {} as Record<IndicatorId, Series>
  for (const id of INDICATORS) indicators[id] = [...kept.map((b) => b[id]), ...(part.indicators[id] ?? [])]
  return { candles, indicators }
}
