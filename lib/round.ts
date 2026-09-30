import type { GameLevel } from "@/lib/game-data"
import { challengesForLevel, type Challenge, type Decision } from "@/lib/mock-data"

/**
 * Small, fast seeded PRNG (mulberry32). The same seed always gives the same
 * sequence, so a round can be rebuilt exactly from its seed.
 */
export function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Fisher–Yates on a copy. */
function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** A fresh seed. Call from event handlers and effects only, never in render. */
export const newSeed = () => Math.floor(Math.random() * 2 ** 32)

export type RoundOptions = {
  level: GameLevel
  size?: number
  seed: number
  /** Question ids the player answered recently; used only when fresh ones run out. */
  seen?: ReadonlySet<string>
  /** Pairs from onboarding. About 60% of the round comes from them when possible. */
  focusPairs?: readonly string[]
  /** Opens the round on this question (the daily challenge). */
  first?: Challenge
}

/**
 * Builds one round from the 188-question pool, randomly but with rules:
 *
 * 1. Never two windows from the same dataset: overlapping charts in one round
 *    would give the answer away. (Never relaxed.)
 * 2. No answer more than 3 times in 5, and never the same answer 3 in a row,
 *    so there is no pattern to learn instead of the chart. Within that, the
 *    real mix of the data comes through, WAIT included.
 * 3. Unseen questions first, so a regular player works through the whole pool
 *    before anything repeats.
 * 4. The onboarding focus pairs fill about 60% of the round; the rest keeps
 *    variety. On `hard` only EURAUD and GBPCAD exist, so a pair can repeat.
 * 5. The same pair back to back only when nothing else fits.
 *
 * Rules relax from the bottom up when the pool can't satisfy them, so a round
 * is always full.
 */
export function buildRound({ level, size = 5, seed, seen, focusPairs = [], first }: RoundOptions): Challenge[] {
  const random = rng(seed)
  const pool = shuffle(challengesForLevel(level), random)
  const focus = new Set(focusPairs)
  const focusable = pool.some((c) => focus.has(c.pair))
  const focusTarget = focusable ? Math.ceil(size * 0.6) : 0
  const answerCap = Math.ceil(size * 0.6)

  const round: Challenge[] = first ? [first] : []
  const used = new Set(round.map((c) => c.datasetId))
  const answers = new Map<Decision, number>()
  for (const c of round) answers.set(c.answer, (answers.get(c.answer) ?? 0) + 1)

  // Strictness 0 applies every rule; each level up drops one, least important
  // first: pair adjacency, then focus, then freshness, and the answer cap last
  // because a predictable round is the thing this function exists to prevent.
  const fits = (c: Challenge, strict: number) => {
    if (used.has(c.datasetId)) return false
    if (strict < 4 && (answers.get(c.answer) ?? 0) >= answerCap) return false
    if (strict < 3 && seen?.has(c.id)) return false
    if (strict < 2 && focusTarget > 0) {
      const focusCount = round.filter((r) => focus.has(r.pair)).length
      const slotsLeft = size - round.length
      const needFocus = focusTarget - focusCount
      if (!focus.has(c.pair) && needFocus >= slotsLeft) return false
    }
    const prev = round[round.length - 1]
    if (strict < 1 && prev && prev.pair === c.pair) return false
    return true
  }

  while (round.length < size) {
    let picked: Challenge | undefined
    for (let strict = 0; strict <= 4 && !picked; strict++) picked = pool.find((c) => fits(c, strict))
    if (!picked) break
    round.push(picked)
    used.add(picked.datasetId)
    answers.set(picked.answer, (answers.get(picked.answer) ?? 0) + 1)
  }

  return arrange(round, random, first ? 1 : 0)
}

/** Every ordering of `items` (5 questions is 120; fine to enumerate). */
function permutations<T>(items: T[]): T[][] {
  if (items.length <= 1) return [items]
  return items.flatMap((item, i) =>
    permutations([...items.slice(0, i), ...items.slice(i + 1)]).map((rest) => [item, ...rest]),
  )
}

/**
 * Picks the order of the chosen questions: never the same answer three times
 * running, and as few same-pair neighbours as possible. Orderings are tried in
 * random order, so among equally good ones the pick is still random. The first
 * `locked` questions (the daily challenge) keep their place.
 */
function arrange(round: Challenge[], random: () => number, locked: number) {
  const head = round.slice(0, locked)
  const orders = shuffle(permutations(round.slice(locked)), random).map((tail) => [...head, ...tail])

  let best = round
  let bestCost = Number.POSITIVE_INFINITY
  for (const order of orders) {
    let cost = 0
    for (let i = 1; i < order.length; i++) {
      if (order[i].pair === order[i - 1].pair) cost += 1
      if (i >= 2 && order[i].answer === order[i - 1].answer && order[i].answer === order[i - 2].answer) cost += 100
    }
    if (cost < bestCost) {
      best = order
      bestCost = cost
      if (cost === 0) break
    }
  }
  return best
}
