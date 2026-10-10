import { ACCOUNT, DISIPLIN } from "@/lib/demo/config"

// Rex's tips: each shows once, at the moment it matters, and can be reread
// under "Tips Rex". Which ones a player has seen is stored server-side
// (demo_tips_seen). Pure and client-safe: the text isn't secret. The words
// live in the tips catalogue: tips.<id>.title, .when and .body.p1…pN.

export type TipId = "stop-loss" | "risk-per-trade" | "reward-risk" | "revenge-trading" | "stop-out" | "disiplin-score"

/** Each tip and how many paragraphs its body has. */
export const TIPS: { id: TipId; paragraphs: number }[] = [
  { id: "stop-loss", paragraphs: 3 },
  { id: "risk-per-trade", paragraphs: 3 },
  { id: "reward-risk", paragraphs: 2 },
  { id: "revenge-trading", paragraphs: 2 },
  { id: "stop-out", paragraphs: 2 },
  { id: "disiplin-score", paragraphs: 3 },
]

/** The numbers the tips quote, from config, so the words follow any change there. */
export const TIP_VALUES = {
  max: DISIPLIN.MAX_RISK_PCT,
  minRR: DISIPLIN.MIN_REWARD_RISK,
  window: DISIPLIN.REVENGE_WINDOW_CANDLES,
  stopOut: ACCOUNT.STOP_OUT_LEVEL,
  rolling: DISIPLIN.ROLLING_TRADES,
}

/** Catalogue keys of a tip's paragraphs, in order. */
export const tipParagraphs = (tip: { id: TipId; paragraphs: number }) =>
  Array.from({ length: tip.paragraphs }, (_, i) => `${tip.id}.body.p${i + 1}`)

export const tipById = new Map(TIPS.map((t) => [t.id, t]))
export const isTipId = (v: unknown): v is TipId => typeof v === "string" && tipById.has(v as TipId)
