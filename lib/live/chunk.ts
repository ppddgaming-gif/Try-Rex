// The stored candle chunks (scripts/build-live-data.mjs writes them to the
// `live-data` bucket): M15 only, one per pair and month. Pure: the server-only
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
  /** Per pair: M15 only, one chunk per calendar month ("2019-03"). */
  pairs: Record<string, { digits: number; first: number; last: number; bars: number; months: string[] }>
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

/** Calendar months ("2019-03") from `from` to `to` (unix seconds), oldest first. */
export function monthsBetween(from: number, to: number) {
  const out: string[] = []
  const d = new Date(Date.UTC(new Date(from * 1000).getUTCFullYear(), new Date(from * 1000).getUTCMonth(), 1))
  const last = new Date(to * 1000)
  while (d.getUTCFullYear() < last.getUTCFullYear() || (d.getUTCFullYear() === last.getUTCFullYear() && d.getUTCMonth() <= last.getUTCMonth())) {
    out.push(d.toISOString().slice(0, 7))
    d.setUTCMonth(d.getUTCMonth() + 1)
  }
  return out
}
