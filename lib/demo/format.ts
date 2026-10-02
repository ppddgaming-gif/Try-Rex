import { instrument } from "@/lib/demo/instruments"

// Display formatting for Akun Latihan. Dots for decimals, like the prices
// elsewhere in the app. Pure.

/** "$200.00", "−$3.50"; `signed` adds "+" to gains. */
export function usd(value: number, { signed = false } = {}) {
  const abs = Math.abs(value).toFixed(2)
  if (value < 0) return `−$${abs}`
  return `${signed && value > 0 ? "+" : ""}$${abs}`
}

/** "15%" or "1.5%": no trailing ".0". */
export function pct(value: number, { signed = false } = {}) {
  const text = Number.isInteger(value) ? String(Math.abs(value)) : Math.abs(value).toFixed(1)
  if (value < 0) return `−${text}%`
  return `${signed && value > 0 ? "+" : ""}${text}%`
}

export const lot = (value: number) => value.toFixed(2)

export const price = (pair: string, value: number) => value.toFixed(instrument(pair).digits)

/** An account's status, as the journal and Riwayat akun name it. */
export const ACCOUNT_STATUS: Record<"active" | "habis" | "reset", string> = { active: "aktif", habis: "habis", reset: "direset" }
