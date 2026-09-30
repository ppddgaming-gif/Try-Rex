import { REPLAY, STAGES, type StageNumber } from "@/lib/demo/config"

// Replay segments: the historical H4 data cut into windows of
// HISTORY_CANDLES shown plus up to MAX_FORWARD_CANDLES to play forward.
// Pure: the server passes in what the datasets hold (lib/demo/candles.ts), so
// longer history drops in without code changes here.

export type SegmentSource = { id: string; pair: string; length: number }

export type Segment = {
  /** "eurusd-3" for a dataset's first window, "eurusd-3@65" for a later one. */
  id: string
  datasetId: string
  pair: string
  /** First candle of the window within its dataset. */
  offset: number
  /** Candles in the window. */
  length: number
  /** Index (within the window) of the last candle shown at the start. */
  startCursor: number
  /** Index of the window's last candle: the replay stops here ("segmen habis"). */
  lastIndex: number
}

/** Consecutive, non-overlapping windows; a short tail still counts if it can play MIN_FORWARD_CANDLES. */
export function segmentsOf(source: SegmentSource): Segment[] {
  const span = REPLAY.HISTORY_CANDLES + REPLAY.MAX_FORWARD_CANDLES
  const out: Segment[] = []
  for (let offset = 0; offset + REPLAY.HISTORY_CANDLES + REPLAY.MIN_FORWARD_CANDLES <= source.length; offset += span) {
    const length = Math.min(span, source.length - offset)
    out.push({
      id: offset === 0 ? source.id : `${source.id}@${offset}`,
      datasetId: source.id,
      pair: source.pair,
      offset,
      length,
      startCursor: REPLAY.HISTORY_CANDLES - 1,
      lastIndex: length - 1,
    })
  }
  return out
}

/** Every segment of the pairs open at `stage`. */
export function segmentPool(stage: StageNumber, sources: SegmentSource[]): Segment[] {
  const pairs: readonly string[] = STAGES[stage].pairs
  return sources.filter((s) => pairs.includes(s.pair)).flatMap(segmentsOf)
}

/**
 * The next chart: one the player has loaded least often, so nothing repeats
 * until every segment at their stage has been seen. `current` is skipped when
 * there is any other choice, so "Ganti chart" always changes the chart.
 * `random` returns [0, 1); the server passes Math.random.
 */
export function pickSegment(
  pool: Segment[],
  seen: ReadonlyMap<string, number>,
  random: () => number,
  current?: string,
): Segment | null {
  const candidates = current && pool.length > 1 ? pool.filter((s) => s.id !== current) : pool
  if (candidates.length === 0) return null
  const times = (s: Segment) => seen.get(s.id) ?? 0
  const least = Math.min(...candidates.map(times))
  const fresh = candidates.filter((s) => times(s) === least)
  return fresh[Math.min(fresh.length - 1, Math.floor(random() * fresh.length))]
}
