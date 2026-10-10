// The stored candle chunks (scripts/build-live-data.mjs writes them to the
// `live-data` bucket) and the slice a chart receives. Pure: the server-only
// loader (lib/live/store.ts) fetches and gunzips, these functions only shape.

/** One candle, absolute unix seconds (server side only). */
export type LiveBar = { t: number; o: number; h: number; l: number; c: number }

export type RawChunk = {
  pair: string
  tf: string
  digits: number
  /** First time, then deltas in seconds. */
  t: number[]
  o: number[]
  h: number[]
  l: number[]
  c: number[]
}

export type Manifest = {
  version: number
  pairs: Record<
    string,
    { digits: number; timeframes: Record<string, { seconds: number; first: number; last: number; bars: number; years: number[] }> }
  >
}

export function decodeChunk(raw: RawChunk): LiveBar[] {
  const scale = 10 ** raw.digits
  const out: LiveBar[] = []
  let t = 0
  for (let i = 0; i < raw.t.length; i++) {
    t = i === 0 ? raw.t[0] : t + raw.t[i]
    out.push({ t, o: raw.o[i] / scale, h: raw.h[i] / scale, l: raw.l[i] / scale, c: raw.c[i] / scale })
  }
  return out
}

/**
 * The last `count` candles that have closed by `now` (a candle closes
 * `step` seconds after it opens). `bars` is ascending and may span chunks.
 * Nothing after `now` is ever included: the future stays on the server.
 */
export function closedBefore(bars: readonly LiveBar[], now: number, step: number, count: number): LiveBar[] {
  let end = bars.length
  while (end > 0 && bars[end - 1].t + step > now) end--
  return bars.slice(Math.max(0, end - count), end)
}

/** Calendar years whose chunks a slice ending at `now` can need, newest first. */
export function yearsFor(now: number, step: number, count: number) {
  const from = new Date((now - step * count * 3) * 1000).getUTCFullYear()
  const to = new Date(now * 1000).getUTCFullYear()
  const years: number[] = []
  for (let y = to; y >= from; y--) years.push(y)
  return years
}

/**
 * The "now" an account sees until the live engine runs a real clock: a fixed
 * moment picked from `seed` (0..1) inside the span every pair and timeframe
 * covers, leaving `history` seconds before it. Rounded to the hour, and moved
 * off the weekend to the previous Friday 20:00.
 */
export function provisionalNow(manifest: Manifest, seed: number, history: number) {
  let first = -Infinity
  let last = Infinity
  for (const p of Object.values(manifest.pairs)) {
    for (const tf of Object.values(p.timeframes)) {
      first = Math.max(first, tf.first)
      last = Math.min(last, tf.last)
    }
  }
  const lo = first + history
  if (!(last > lo)) throw new Error("Live data too short for the chart's history")
  let now = Math.floor((lo + (last - lo) * Math.min(Math.max(seed, 0), 0.999999)) / 3600) * 3600
  const pos = (((now + 3 * 86_400) % (7 * 86_400)) + 7 * 86_400) % (7 * 86_400)
  const friday20 = 4 * 86_400 + 20 * 3600
  if (pos >= friday20) now -= pos - friday20
  return now
}
