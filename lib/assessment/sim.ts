import type { Bar, Decision, ScenarioRun, Side } from "@/lib/assessment/types"

// One assessment scenario, candle by candle: the order checks, the fill of a
// pending order, SL before TP, the close at the window's last candle. Pure;
// the route runs it and the browser only sees its results.

export const LOT = { MIN: 0.01, STEP: 0.01, MAX: 100 }
export const REASONS_PER_DECISION = { MIN: 1, MAX: 3 }

/** Why a decision is refused, as a key in the assessment catalogue's errors. */
export type DecisionProblem = "reasons" | "lot" | "levels" | "entry"

export type DecisionContext = { ref: number; pipSize: number; reasonOptions: string[] }

const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v)

/** The decision's entry price: the last close for market, the order price for pending. */
export const entryOf = (d: Decision, ref: number) => (d.entry === "pending" && isNum(d.price) ? d.price : ref)

/** The first thing wrong with a decision, or null. */
export function decisionProblem(d: Decision, ctx: DecisionContext): DecisionProblem | null {
  const reasons = new Set(d.reasons)
  if (
    reasons.size !== d.reasons.length ||
    reasons.size < REASONS_PER_DECISION.MIN ||
    reasons.size > REASONS_PER_DECISION.MAX ||
    d.reasons.some((r) => !ctx.reasonOptions.includes(r))
  )
    return "reasons"
  if (d.action === "no_trade") return null

  if (d.entry !== "market" && d.entry !== "pending") return "entry"
  if (d.entry === "pending") {
    // Away from the current price, and not absurdly far (a typo, not a plan).
    if (!isNum(d.price) || d.price <= 0) return "entry"
    if (Math.abs(d.price - ctx.ref) < ctx.pipSize / 2 || Math.abs(d.price - ctx.ref) > ctx.ref * 0.2) return "entry"
  }
  const lot = d.lot
  if (!isNum(lot) || lot < LOT.MIN || lot > LOT.MAX || Math.abs(Math.round(lot / LOT.STEP) * LOT.STEP - lot) > 1e-9) return "lot"

  const entry = entryOf(d, ctx.ref)
  if (!isNum(d.sl) || !isNum(d.tp)) return "levels"
  const below = (a: number, b: number) => b - a >= ctx.pipSize - 1e-12
  const ok = d.action === "buy" ? below(d.sl, entry) && below(entry, d.tp) : below(d.tp, entry) && below(entry, d.sl)
  return ok ? null : "levels"
}

/** Pips between two prices. */
export const pipsBetween = (a: number, b: number, pipSize: number) => Math.abs(a - b) / pipSize

/** Profit or loss in USD of `side` from `entry` to `exit`. */
export function pnlUsd(side: Side, entry: number, exit: number, lot: number, pipSize: number, pipValue: number) {
  const pips = (side === "buy" ? exit - entry : entry - exit) / pipSize
  return Math.round(pips * pipValue * lot * 100) / 100
}

/** A new run for a committed decision: a market order fills at Start (index -1). */
export function startRun(d: Decision, ref: number): ScenarioRun {
  const filled = d.action !== "no_trade" && d.entry === "market"
  return { d, n: 0, f: filled ? { i: -1, p: ref } : null, x: null, end: false }
}

/**
 * The run after play candle `i` (= run.n) closes. A pending order below the
 * Start price fills when the low reaches it (at the open if the candle gaps
 * through), one above when the high does. Once filled, the SL is checked
 * before the TP; a gap past either fills at the open. The last candle closes
 * whatever is still open at its close.
 */
export function stepRun(run: ScenarioRun, bar: Bar, ref: number, last: boolean): ScenarioRun {
  if (run.end) return run
  const i = run.n
  const d = run.d
  let f = run.f
  let x = run.x

  if (d.action !== "no_trade" && !x) {
    if (!f && d.entry === "pending" && isNum(d.price)) {
      const p = d.price
      if (p < ref && bar.l <= p) f = { i, p: Math.min(bar.o, p) }
      else if (p > ref && bar.h >= p) f = { i, p: Math.max(bar.o, p) }
    }
    if (f && isNum(d.sl) && isNum(d.tp)) {
      // On the fill candle the price was at the entry, so there's no gap to take.
      const gap = f.i < i
      const buy = d.action === "buy"
      const slHit = buy ? bar.l <= d.sl : bar.h >= d.sl
      const tpHit = buy ? bar.h >= d.tp : bar.l <= d.tp
      if (slHit) x = { i, p: gap && (buy ? bar.o <= d.sl : bar.o >= d.sl) ? bar.o : d.sl, why: "sl" }
      else if (tpHit) x = { i, p: gap && (buy ? bar.o >= d.tp : bar.o <= d.tp) ? bar.o : d.tp, why: "tp" }
      else if (last) x = { i, p: bar.c, why: "auto" }
    }
  }
  return { ...run, n: i + 1, f, x, end: last || !!x }
}

/** The run after the player closes by hand at the last revealed close (or at Start). */
export function closeRun(run: ScenarioRun, lastClose: number, reason: string): ScenarioRun | null {
  if (run.end || !run.f || run.x) return null
  return { ...run, x: { i: run.n - 1, p: lastClose, why: "manual", cr: reason }, end: true }
}

/** Plays the rest of the window without showing it: what "skip" does. */
export function finishRun(run: ScenarioRun, bars: Bar[], ref: number): ScenarioRun {
  let r = run
  while (!r.end && r.n < bars.length) r = stepRun(r, bars[r.n], ref, r.n === bars.length - 1)
  return r.end ? r : { ...r, end: true }
}
