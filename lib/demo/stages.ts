import { DISIPLIN, GRADUATION, STAGE_UNLOCK, type StageNumber } from "@/lib/demo/config"
import { rollingDisiplin } from "@/lib/demo/disiplin"
import type { T } from "@/lib/i18n/translator"

// Stages belong to the player, not the account. Each one opens after enough
// counted trades in the stage before, at a high enough Disiplin; Stage 3
// leads to graduation the same way. Pure.

/** A counted trade (held at least one candle), oldest first. */
export type ScoredTrade = { stage: StageNumber; score: number }

export type StageProgress = {
  stage: StageNumber
  /** The stage this progress leads to; null in Stage 3, which leads to graduation. */
  next: StageNumber | null
  /** Counted trades in the current stage. */
  trades: number
  /** Trades the next stage (or graduation) needs. */
  needed: number
  /** Average Disiplin of the stage's most recent trades; null before the first. */
  disiplin: number | null
  minDisiplin: number
  /** Both conditions met: the next stage opens now, or in Stage 3 the player graduates. */
  ready: boolean
}

/** What leaving each stage takes: trades, the Disiplin bar, and how many recent trades that average spans. */
const GOALS: Record<StageNumber, { trades: number; min: number; window: number }> = {
  1: { trades: STAGE_UNLOCK.TO_2_TRADES, min: STAGE_UNLOCK.MIN_DISIPLIN, window: DISIPLIN.ROLLING_TRADES },
  2: { trades: STAGE_UNLOCK.TO_3_TRADES, min: STAGE_UNLOCK.MIN_DISIPLIN, window: DISIPLIN.ROLLING_TRADES },
  3: { trades: GRADUATION.TRADES, min: GRADUATION.MIN_DISIPLIN, window: GRADUATION.TRADES },
}

export function stageProgress(stage: StageNumber, trades: ScoredTrade[]): StageProgress {
  const goal = GOALS[stage]
  const inStage = trades.filter((t) => t.stage === stage)
  const disiplin = rollingDisiplin(inStage.map((t) => t.score), goal.window)
  return {
    stage,
    next: stage < 3 ? ((stage + 1) as StageNumber) : null,
    trades: inStage.length,
    needed: goal.trades,
    disiplin,
    minDisiplin: goal.min,
    ready: inStage.length >= goal.trades && disiplin !== null && disiplin >= goal.min,
  }
}

/** The player's stage after these trades. Stages only go up. */
export function stageAfter(stage: StageNumber, trades: ScoredTrade[]): StageNumber {
  const p = stageProgress(stage, trades)
  return p.ready && p.next ? p.next : stage
}

/** Stage 3 with GRADUATION.TRADES counted trades at GRADUATION.MIN_DISIPLIN or better. */
export const graduationReached = (stage: StageNumber, trades: ScoredTrade[]) =>
  stage === 3 && stageProgress(3, trades).ready

/** "7/10 trade · Disiplin 76% (butuh 80%)". `t` is the root translator (demo.stageProgress). */
export function progressLabel(p: StageProgress, t: T) {
  return t("demo.stageProgress", {
    done: Math.min(p.trades, p.needed),
    needed: p.needed,
    disiplin: p.disiplin === null ? "—" : `${p.disiplin}%`,
    min: p.minDisiplin,
  })
}
