import { challenges, type Challenge } from "@/lib/mock-data"
import type { ChartPick } from "@/lib/learn/types"

// Lessons illustrate with real game charts, chosen by what the chart shows
// rather than by a hard-coded id, so they survive changes to the data. Picks
// read the same computed facts the game prints (trend word, detected levels),
// and are deterministic.

const byPick: Record<ChartPick, (c: Challenge) => boolean> = {
  uptrend: (c) => c.facts.trend === "up" && c.answer === "buy",
  downtrend: (c) => c.facts.trend === "down" && c.answer === "sell",
  sideways: (c) => c.facts.trend === "flat",
  levels: (c) => c.zones.some((z) => z.variant === "support") && c.zones.some((z) => z.variant === "resistance"),
}

export function chartFor(pick: ChartPick): Challenge {
  // Easy majors first: clean charts, familiar pairs.
  const pool = [...challenges].sort((a, b) => (a.level === b.level ? 0 : a.level === "easy" ? -1 : 1))
  return pool.find(byPick[pick]) ?? challenges[0]
}
