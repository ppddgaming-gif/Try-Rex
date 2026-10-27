import { DRAWINGS } from "@/lib/live/config"

// The drawing tools' data. Every point is (time, price): time in seconds,
// relative to "now" in the browser and absolute on the server
// (lib/live/time.ts), never a pixel or a candle index, so a drawing stays put
// when the timeframe changes. Drawings are a thinking aid only: nothing reads
// them to score, warn or suggest. Pure and client-safe.

export type Point = { t: number; p: number }

export type Drawing =
  | { id: string; kind: "trendline"; a: Point; b: Point }
  | { id: string; kind: "rectangle"; a: Point; b: Point }
  | { id: string; kind: "hline"; p: number }
  | { id: string; kind: "path"; points: Point[] }
  /** Entry at `a` (time, price) running to `b.t`; SL and TP are prices. */
  | { id: string; kind: "position"; side: "buy" | "sell"; a: Point; b: Point; sl: number; tp: number }

export type DrawingKind = Drawing["kind"]
export const DRAWING_KINDS: DrawingKind[] = ["position", "trendline", "rectangle", "hline", "path"]

const ID = /^[a-z0-9-]{1,40}$/
const num = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v)
const point = (v: unknown): Point | null => {
  if (!v || typeof v !== "object") return null
  const { t, p } = v as Record<string, unknown>
  return num(t) && num(p) && p > 0 ? { t: Math.round(t), p } : null
}

/** One drawing from outside (a request body, a stored row); null when malformed. */
export function parseDrawing(v: unknown): Drawing | null {
  if (!v || typeof v !== "object") return null
  const d = v as Record<string, unknown>
  if (typeof d.id !== "string" || !ID.test(d.id)) return null
  const id = d.id
  switch (d.kind) {
    case "trendline":
    case "rectangle": {
      const a = point(d.a)
      const b = point(d.b)
      return a && b ? { id, kind: d.kind, a, b } : null
    }
    case "hline":
      return num(d.p) && d.p > 0 ? { id, kind: "hline", p: d.p } : null
    case "path": {
      if (!Array.isArray(d.points) || d.points.length < 2 || d.points.length > DRAWINGS.MAX_PATH_POINTS) return null
      const points = d.points.map(point)
      return points.every((x): x is Point => x !== null) ? { id, kind: "path", points } : null
    }
    case "position": {
      const a = point(d.a)
      const b = point(d.b)
      if (!a || !b || (d.side !== "buy" && d.side !== "sell") || !num(d.sl) || !num(d.tp)) return null
      // SL on the losing side of entry, TP on the winning side.
      const ok = d.side === "buy" ? d.sl < a.p && d.tp > a.p : d.sl > a.p && d.tp < a.p
      return ok ? { id, kind: "position", side: d.side, a, b, sl: d.sl, tp: d.tp } : null
    }
  }
  return null
}

/** A list from outside: malformed entries dropped, capped at DRAWINGS.MAX, ids unique. */
export function parseDrawings(v: unknown): Drawing[] {
  if (!Array.isArray(v)) return []
  const seen = new Set<string>()
  const out: Drawing[] = []
  for (const item of v) {
    const d = parseDrawing(item)
    if (!d || seen.has(d.id)) continue
    seen.add(d.id)
    out.push(d)
    if (out.length >= DRAWINGS.MAX) break
  }
  return out
}

/** Every time in a drawing moved by `delta` seconds: relative ↔ absolute. */
export function shiftDrawing(d: Drawing, delta: number): Drawing {
  const sp = (x: Point): Point => ({ t: x.t + delta, p: x.p })
  switch (d.kind) {
    case "hline":
      return d
    case "path":
      return { ...d, points: d.points.map(sp) }
    default:
      return { ...d, a: sp(d.a), b: sp(d.b) }
  }
}

/** Risk, reward and their ratio for a position drawing, in price units. */
export function positionStats(d: Extract<Drawing, { kind: "position" }>) {
  const risk = Math.abs(d.a.p - d.sl)
  const reward = Math.abs(d.tp - d.a.p)
  return { risk, reward, rr: risk > 0 ? reward / risk : null }
}
