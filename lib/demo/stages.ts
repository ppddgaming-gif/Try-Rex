import { STAGE_UNLOCK, type StageNumber } from "@/lib/demo/config"
import { rollingDisiplin } from "@/lib/demo/disiplin"

// Stages belong to the player, not the account. Each one opens after enough
// counted trades in the stage before, at a high enough Disiplin. Pure.

/** A counted trade (held at least one candle), oldest first. */
export type ScoredTrade = { stage: StageNumber; score: number }

export type StageProgress = {
  stage: StageNumber
  /** The stage this progress leads to; null at the top. */
  next: StageNumber | null
  /** Counted trades in the current stage. */
  trades: number
  /** Trades the next stage needs; null at the top. */
  needed: number | null
  /** Rolling Disiplin of the current stage's trades; null before the first. */
  disiplin: number | null
  minDisiplin: number
  /** Both conditions met: the next stage opens now. */
  ready: boolean
}

const tradesToLeave = (stage: StageNumber) =>
  stage === 1 ? STAGE_UNLOCK.TO_2_TRADES : stage === 2 ? STAGE_UNLOCK.TO_3_TRADES : null

export function stageProgress(stage: StageNumber, trades: ScoredTrade[]): StageProgress {
  const inStage = trades.filter((t) => t.stage === stage)
  const needed = tradesToLeave(stage)
  const disiplin = rollingDisiplin(inStage.map((t) => t.score))
  const next = stage < 3 ? ((stage + 1) as StageNumber) : null
  return {
    stage,
    next,
    trades: inStage.length,
    needed,
    disiplin,
    minDisiplin: STAGE_UNLOCK.MIN_DISIPLIN,
    ready:
      next !== null &&
      needed !== null &&
      inStage.length >= needed &&
      disiplin !== null &&
      disiplin >= STAGE_UNLOCK.MIN_DISIPLIN,
  }
}

/** The player's stage after these trades. Stages only go up. */
export function stageAfter(stage: StageNumber, trades: ScoredTrade[]): StageNumber {
  const p = stageProgress(stage, trades)
  return p.ready && p.next ? p.next : stage
}

/** "7/10 trade · Disiplin 76% (butuh 80%)". */
export function progressLabel(p: StageProgress) {
  const disiplin = `Disiplin ${p.disiplin === null ? "—" : `${p.disiplin}%`}`
  if (p.needed === null) return `Stage tertinggi · ${p.trades} trade · ${disiplin}`
  return `${Math.min(p.trades, p.needed)}/${p.needed} trade · ${disiplin} (butuh ${p.minDisiplin}%)`
}
