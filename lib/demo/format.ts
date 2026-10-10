import { instrument } from "@/lib/demo/instruments"
import type { T } from "@/lib/i18n/translator"

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

/** An account's status, as the journal and Riwayat akun name it. `t` is the root translator. */
export const accountStatus = (status: "active" | "habis" | "reset", t: T) => t(`demo.status.${status}`)

/**
 * A ledger row's label in the reader's language. The database keeps the label
 * written when the row was booked (in Indonesian); the words are rebuilt here
 * from its kind and the trade number in it. Trade rows ("Trade #1 · BUY
 * EURUSD") need no words and stay as stored, as does anything unknown.
 */
export function ledgerLabel(row: { kind: string; label: string }, t: T) {
  const n = /#(\d+)/.exec(row.label)?.[1]
  switch (row.kind) {
    case "deposit":
      return t("demo.ledger.deposit")
    case "adjustment":
      return t("demo.ledger.adjustment")
    case "commission":
    case "swap":
      return n ? t(`demo.ledger.${row.kind}`, { n }) : row.label
    default:
      return row.label
  }
}
