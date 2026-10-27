import { M15 } from "@/lib/live/config"

// How price moves inside one M15 candle while it is still forming. The data
// only has open, high, low and close, so the path between them is drawn:
// open → first extreme → second extreme → close, with a small wobble that
// never leaves the stretch it is on. The path stays inside [low, high],
// touches both before the close and ends exactly on the close. It is seeded
// by the pair and the candle's time, so every refresh (and the server's
// SL/TP checks) sees the same path. Pure; seconds are 0..900 into the candle.

export type PathBar = { t: number; o: number; h: number; l: number; c: number }

/** 32-bit FNV-1a: a stable seed from text. */
function hash(text: string) {
  let h = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

/** mulberry32: small, fast, good enough for a drawn path. */
function prng(seed: number) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

type Point = { s: number; p: number }
type Plan = { points: Point[]; wobble: { amp: number; freq: number; phase: number }[] }

const plans = new Map<string, Plan>()

function planFor(pair: string, bar: PathBar): Plan {
  const key = `${pair}:${bar.t}:${bar.o}:${bar.h}:${bar.l}:${bar.c}`
  const hit = plans.get(key)
  if (hit) return hit
  const rnd = prng(hash(`${pair}:${bar.t}`))
  // A rising candle usually dips first and a falling one usually rallies
  // first, but not always.
  const lowFirst = bar.c >= bar.o ? rnd() < 0.65 : rnd() >= 0.65
  const t1 = Math.round(M15 * (0.12 + rnd() * 0.3))
  const t2 = Math.round(M15 * (0.55 + rnd() * 0.33))
  const [e1, e2] = lowFirst ? [bar.l, bar.h] : [bar.h, bar.l]
  const points = [
    { s: 0, p: bar.o },
    { s: t1, p: e1 },
    { s: t2, p: e2 },
    { s: M15, p: bar.c },
  ]
  const wobble = points.slice(1).map(() => ({ amp: 0.15 + rnd() * 0.25, freq: 1 + Math.floor(rnd() * 3), phase: rnd() * Math.PI * 2 }))
  const plan = { points, wobble }
  plans.set(key, plan)
  if (plans.size > 4096) plans.delete(plans.keys().next().value!)
  return plan
}

/**
 * Price at second `s` (clamped to 0..900) of `bar`, rounded to `digits`.
 * p(0) = open, p(900) = close; each stretch stays between its two ends, so
 * the whole path stays inside [low, high].
 */
export function priceAt(pair: string, bar: PathBar, s: number, digits: number) {
  const sec = Math.min(M15, Math.max(0, Math.round(s)))
  const { points, wobble } = planFor(pair, bar)
  let k = 1
  while (k < points.length - 1 && sec > points[k].s) k++
  const a = points[k - 1]
  const b = points[k]
  const span = b.s - a.s
  const u = span > 0 ? (sec - a.s) / span : 1
  const lo = Math.min(a.p, b.p)
  const hi = Math.max(a.p, b.p)
  const w = wobble[k - 1]
  // The wobble fades out at both ends, so each waypoint is hit exactly.
  const wiggle = (hi - lo) * w.amp * Math.sin(Math.PI * u) * Math.sin(2 * Math.PI * w.freq * u + w.phase)
  const p = Math.min(hi, Math.max(lo, a.p + (b.p - a.p) * u + wiggle))
  return Number(p.toFixed(digits))
}

/** Highest and lowest price of the path over seconds [from, to], both ends included. */
export function extremes(pair: string, bar: PathBar, from: number, to: number, digits: number) {
  let h = -Infinity
  let l = Infinity
  const a = Math.max(0, Math.round(from))
  const b = Math.min(M15, Math.round(to))
  for (let s = a; s <= b; s++) {
    const p = priceAt(pair, bar, s, digits)
    if (p > h) h = p
    if (p < l) l = p
  }
  return { h, l }
}

/**
 * First second in [from, to] where `reached(price)` holds, or null. With
 * `shift` added to every price (a SELL position watches the ask: bid + spread).
 */
export function firstTouch(
  pair: string,
  bar: PathBar,
  from: number,
  to: number,
  digits: number,
  reached: (price: number) => boolean,
  shift = 0,
) {
  const a = Math.max(0, Math.round(from))
  const b = Math.min(M15, Math.round(to))
  for (let s = a; s <= b; s++) {
    if (reached(Number((priceAt(pair, bar, s, digits) + shift).toFixed(digits)))) return s
  }
  return null
}
