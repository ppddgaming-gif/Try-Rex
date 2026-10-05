// Why a player takes a trade: one shared list for Akun Latihan's order panel
// and, later, the Trading Game. "Ikut feeling" stays on purpose: it's an
// honest answer, and Rex comments on it. Pure and client-safe.

export const TRADE_REASONS = [
  { id: "trend-naik", label: "Trend naik" },
  { id: "trend-turun", label: "Trend turun" },
  { id: "pantulan-support", label: "Pantulan di support" },
  { id: "penolakan-resistance", label: "Penolakan di resistance" },
  { id: "breakout", label: "Breakout" },
  { id: "menunggu-konfirmasi", label: "Menunggu konfirmasi" },
  { id: "risk-reward-bagus", label: "Risk:reward bagus" },
  { id: "ikut-feeling", label: "Ikut feeling" },
] as const

export type ReasonId = (typeof TRADE_REASONS)[number]["id"]

const byId = new Map<string, string>(TRADE_REASONS.map((r) => [r.id, r.label]))

export const isReasonId = (v: unknown): v is ReasonId => typeof v === "string" && byId.has(v)

export const reasonLabel = (id: ReasonId) => byId.get(id) ?? id
