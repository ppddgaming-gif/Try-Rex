import "server-only"
import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { gunzipSync } from "node:zlib"
import { decodeChunk, monthsBetween, type LiveBar, type Manifest, type RawChunk } from "@/lib/live/chunk"
import { CHART, M15, MARKET, PAIR_CONFIG, TIMEFRAME_SECONDS, isLivePair, type LivePair, type Timeframe } from "@/lib/live/config"
import { chartIndicators, type ChartIndicators } from "@/lib/live/indicators"
import { chartAt, marketStatus } from "@/lib/live/market"
import { toRelative, weekPosition } from "@/lib/live/time"
import { createAdminClient } from "@/lib/supabase/admin"

// The only module that reads the candle data: M15 chunks, one per pair and
// month, in the private Storage bucket `live-data`
// (scripts/upload-live-data.mjs). With LIVE_DATA_DIR set (local development)
// they are read from that folder instead. Whole chunks never leave the
// server: chartSlice() returns candles up to the account's "now" only, with
// relative times.

const BUCKET = "live-data"

async function readObject(path: string): Promise<Buffer> {
  const dir = process.env.LIVE_DATA_DIR
  if (dir) return readFile(join(dir, path))
  const { data, error } = await createAdminClient().storage.from(BUCKET).download(path)
  if (error || !data) throw new Error(`live-data: cannot read ${path}`)
  return Buffer.from(await data.arrayBuffer())
}

let manifest: Promise<Manifest> | null = null
export function loadManifest(): Promise<Manifest> {
  manifest ??= readObject("manifest.json").then((b) => JSON.parse(b.toString("utf8")) as Manifest)
  manifest.catch(() => (manifest = null))
  return manifest
}

// Recently used months. A month of M15 is about 2,000 candles.
const chunks = new Map<string, Promise<LiveBar[] | null>>()
const MAX_CHUNKS = 96

function loadMonth(pair: string, month: string): Promise<LiveBar[] | null> {
  const key = `${pair}/M15/${month}`
  const hit = chunks.get(key)
  if (hit) {
    chunks.delete(key)
    chunks.set(key, hit)
    return hit
  }
  const p = readObject(`${key}.json.gz`)
    .then((buf) => decodeChunk(JSON.parse(gunzipSync(buf).toString("utf8")) as RawChunk))
    .catch(() => null)
  chunks.set(key, p)
  if (chunks.size > MAX_CHUNKS) chunks.delete(chunks.keys().next().value!)
  return p
}

/** M15 candles of `pair` with from <= t <= to (data time), ascending. Server side only. */
export async function m15Between(pair: string, from: number, to: number): Promise<LiveBar[]> {
  const m = await loadManifest()
  const info = m.pairs[pair]
  if (!info) return []
  const months = monthsBetween(from, to).filter((mo) => info.months.includes(mo))
  const loaded = await Promise.all(months.map((mo) => loadMonth(pair, mo)))
  return loaded.flatMap((b) => b ?? []).filter((b) => b.t >= from && b.t <= to)
}

export const digitsOf = (pair: string) => (isLivePair(pair) ? PAIR_CONFIG[pair].digits : pair.endsWith("JPY") ? 3 : 5)

/** Closed candles a chart reads: the ones sent plus the indicators' warm-up. */
const READ_BARS = CHART.BARS + CHART.WARMUP

/** How far back a chart of `step` reads: its candles plus weekends and holidays. */
const lookback = (step: number) => Math.ceil(READ_BARS * step * 1.6) + 6 * 86_400

export type RelBar = { t: number; o: number; h: number; l: number; c: number }

export type ChartSlice = {
  pair: LivePair
  timeframe: Timeframe
  digits: number
  step: number
  /** Where "now" falls in its week on the display clock (WIB), for day/hour labels. */
  nowWeek: number
  /**
   * Real unix seconds of this "now". Relative times are relative to it; the
   * browser shifts its drawings by the difference between two anchors. It is
   * the real clock, so it says nothing about the data's period.
   */
  anchor: number
  /** Closed candles, oldest first; `t` is seconds relative to now (negative). */
  candles: RelBar[]
  /** The candle still forming: open, high and low so far, and the current price as its close. */
  forming: RelBar | null
  /** Seconds until the forming M15 candle closes (the countdown); null while the market is closed. */
  closesIn: number | null
  market: { open: boolean; opensIn: number | null }
  /**
   * EMA 20, EMA 50 and RSI 14, one value per candle sent (closed, then the
   * forming one), computed from closes up to now with CHART.WARMUP more closed
   * candles before the first one sent.
   */
  indicators: ChartIndicators
}

/**
 * The chart for one pair and timeframe at data time `now` (real time `real`),
 * or null when the data for it is missing. Nothing after `now` is included:
 * closed candles end before it and the forming one only goes as far as it.
 */
export async function chartSlice(now: number, real: number, pair: LivePair, timeframe: Timeframe): Promise<ChartSlice | null> {
  const step = TIMEFRAME_SECONDS[timeframe]
  const digits = digitsOf(pair)
  // Look one gap ahead too, only to tell when the market opens again; those candles are never returned.
  const bars = await m15Between(pair, now - lookback(step), now + MARKET.CLOSE_GAP_SECONDS + 4 * 86_400)
  const past = bars.filter((b) => b.t <= now)
  if (past.length === 0) return null
  const { closed: read, forming } = chartAt(pair, past, now, step, READ_BARS, digits)
  const closed = read.slice(-CHART.BARS)
  const status = marketStatus(bars, now)
  const rel = (b: LiveBar): RelBar => ({ t: toRelative(b.t, now), o: b.o, h: b.h, l: b.l, c: b.c })
  return {
    indicators: chartIndicators(
      read.map((b) => b.c),
      forming ? forming.c : null,
      CHART.BARS,
    ),
    pair,
    timeframe,
    digits,
    step,
    nowWeek: weekPosition(real + MARKET.DISPLAY_UTC_OFFSET_HOURS * 3600),
    anchor: real,
    candles: closed.map(rel),
    forming: forming ? rel(forming) : null,
    closesIn: status.open ? M15 - (((now % M15) + M15) % M15) : null,
    market: status,
  }
}

/** Pairs whose data exists, for the picker. */
export async function availablePairs(): Promise<string[]> {
  const m = await loadManifest().catch(() => null)
  if (!m) return []
  return Object.entries(m.pairs)
    .filter(([, p]) => p.months.length > 0)
    .map(([pair]) => pair)
}
