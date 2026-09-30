import "server-only"
import type { StageNumber } from "@/lib/demo/config"
import type { Bar } from "@/lib/demo/fills"
import { segmentPool, segmentsOf, type Segment } from "@/lib/demo/segments"
import type { SegmentInfo } from "@/lib/demo/state"
import { gameDatasets } from "@/lib/game-data"

// The only Akun Latihan module that touches the historical candles. It is
// server-only, so a whole segment, and so what price does next, can never be
// bundled into the browser (non-negotiable #1). lib/demo/view.ts cuts what
// the player may see at the cursor.

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"]

const sources = gameDatasets.map((d) => ({ id: d.id, pair: d.pair, length: d.candles.length }))
const byId = new Map(sources.flatMap((s) => segmentsOf(s)).map((s) => [s.id, s]))
const datasets = new Map(gameDatasets.map((d) => [d.id, d]))

export const poolFor = (stage: StageNumber) => segmentPool(stage, sources)

export function segmentById(id: string): Segment | null {
  return byId.get(id) ?? null
}

/** The segment's candles and labels, or null if the data no longer has it. */
export function loadSegment(id: string): { info: SegmentInfo; candles: Bar[] } | null {
  const segment = byId.get(id)
  const dataset = segment && datasets.get(segment.datasetId)
  if (!segment || !dataset) return null
  const candles = dataset.candles
    .slice(segment.offset, segment.offset + segment.length)
    .map(({ t, o, h, l, c }) => ({ t, o, h, l, c }))
  const first = new Date(candles[0].t * 1000)
  return {
    info: {
      pair: dataset.pair,
      digits: dataset.digits,
      timeframe: dataset.timeframe,
      period: `${MONTHS[first.getUTCMonth()]} ${first.getUTCFullYear()}`,
    },
    candles,
  }
}
