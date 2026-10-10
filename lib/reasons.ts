// Why a player takes a trade: one shared list for Akun Latihan's order panel
// and, later, the Trading Game. "Ikut feeling" stays on purpose: it's an
// honest answer, and Rex comments on it. Pure and client-safe. Labels:
// common.reasons.<id> in the message catalogues.

export const TRADE_REASONS = [
  { id: "trend-naik" },
  { id: "trend-turun" },
  { id: "pantulan-support" },
  { id: "penolakan-resistance" },
  { id: "breakout" },
  { id: "menunggu-konfirmasi" },
  { id: "risk-reward-bagus" },
  { id: "ikut-feeling" },
] as const

export type ReasonId = (typeof TRADE_REASONS)[number]["id"]

const ids = new Set<string>(TRADE_REASONS.map((r) => r.id))

export const isReasonId = (v: unknown): v is ReasonId => typeof v === "string" && ids.has(v)
