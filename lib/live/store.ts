import "server-only"
import { createHmac } from "node:crypto"
import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { gunzipSync } from "node:zlib"
import { closedBefore, decodeChunk, provisionalNow, yearsFor, type LiveBar, type Manifest, type RawChunk } from "@/lib/live/chunk"
import { CHART, TIMEFRAME_SECONDS, type LivePair, type Timeframe } from "@/lib/live/config"
import { toRelative, weekPosition } from "@/lib/live/time"
import { createAdminClient } from "@/lib/supabase/admin"

// The only module that reads the candle data. Chunks live in the private
// Storage bucket `live-data` (scripts/upload-live-data.mjs); with
// LIVE_DATA_DIR set (local development) they are read from that folder
// instead. Whole chunks never leave the server: chartSlice() returns the
// closed candles before the account's "now", with relative times only.

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

// Recently used chunks. A year of M15 is about 25,000 candles.
const chunks = new Map<string, Promise<LiveBar[] | null>>()
const MAX_CHUNKS = 48

function loadChunk(pair: string, tf: string, year: number): Promise<LiveBar[] | null> {
  const key = `${pair}/${tf}/${year}`
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

/** 0..1 from the account id, keyed with a server secret, so the moment can't be worked out from the id. */
function seedFor(accountId: string) {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "dev"
  const h = createHmac("sha256", secret).update(`live-now:${accountId}`).digest()
  return h.readUInt32BE(0) / 2 ** 32
}

/**
 * The account's "now": a provisional fixed moment until the live engine keeps
 * a real clock. Server side only; the browser gets its week position.
 */
export async function accountNow(accountId: string) {
  const m = await loadManifest()
  const history = CHART.BARS * TIMEFRAME_SECONDS.H4 * 2
  return provisionalNow(m, seedFor(accountId), history)
}

export type RelBar = { t: number; o: number; h: number; l: number; c: number }

export type ChartSlice = {
  pair: LivePair
  timeframe: Timeframe
  digits: number
  step: number
  /** Where "now" falls in its week (seconds since Monday 00:00), for day/hour labels. */
  nowWeek: number
  /** Closed candles, oldest first; `t` is seconds relative to now (negative). */
  candles: RelBar[]
}

/** The chart for one pair and timeframe, or null when the data for it is missing. */
export async function chartSlice(now: number, pair: LivePair, timeframe: Timeframe): Promise<ChartSlice | null> {
  const m = await loadManifest()
  const info = m.pairs[pair]?.timeframes[timeframe]
  if (!info) return null
  const step = TIMEFRAME_SECONDS[timeframe]
  const years = yearsFor(now, step, CHART.BARS).filter((y) => info.years.includes(y)).reverse()
  const loaded = await Promise.all(years.map((y) => loadChunk(pair, timeframe, y)))
  const bars = loaded.flatMap((b) => b ?? [])
  const slice = closedBefore(bars, now, step, CHART.BARS)
  if (slice.length === 0) return null
  return {
    pair,
    timeframe,
    digits: m.pairs[pair].digits,
    step,
    nowWeek: weekPosition(now),
    candles: slice.map((b) => ({ t: toRelative(b.t, now), o: b.o, h: b.h, l: b.l, c: b.c })),
  }
}

/** Pairs whose data covers every timeframe, for the picker. */
export async function availablePairs(): Promise<string[]> {
  const m = await loadManifest().catch(() => null)
  if (!m) return []
  return Object.entries(m.pairs)
    .filter(([, p]) => Object.keys(p.timeframes).length === Object.keys(TIMEFRAME_SECONDS).length)
    .map(([pair]) => pair)
}
