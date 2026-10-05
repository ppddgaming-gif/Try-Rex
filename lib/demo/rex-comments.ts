import { DISIPLIN } from "@/lib/demo/config"
import { CHECK_LABELS, type CheckId, type Checks } from "@/lib/demo/disiplin"
import { pct } from "@/lib/demo/format"
import { instrument } from "@/lib/demo/instruments"
import type { Side } from "@/lib/demo/money"
import { reasonLabel, type ReasonId } from "@/lib/reasons"

// Everything Rex says about a closed trade or a finished account. Rule-based
// and all in this file. Each rule looks at the plan and how it was handled,
// never at the result (non-negotiable #3): a losing trade that followed its
// plan is praised, a winning one that didn't is not. Pure; the server attaches
// the comments to each closed trade.

export type CommentId =
  | "revenge"
  | "sl-widened"
  | "no-sl"
  | "risk-above"
  | "reason-contradicts"
  | "sl-too-close"
  | "feeling"
  | "good"

export type RexComment = { id: CommentId; tone: "warn" | "good"; text: string }

export type CommentInput = {
  pair: string
  side: Side
  reasons: readonly ReasonId[]
  entry: number
  /** SL when the order was placed. */
  slInitial: number | null
  /** Average candle range (high − low) of the recent candles at entry, in price. */
  rangeAvg: number
  riskPct: number | null
  rewardRisk: number | null
  checks: Checks
}

/** Reasons that point the other way: a BUY "because the trend is down". */
export const CONTRADICTS: Record<Side, readonly ReasonId[]> = {
  buy: ["trend-turun", "penolakan-resistance"],
  sell: ["trend-naik", "pantulan-support"],
}

/** "a", "a dan b", "a, b, dan c". */
export function listId(items: string[]) {
  if (items.length <= 1) return items.join("")
  if (items.length === 2) return `${items[0]} dan ${items[1]}`
  return `${items.slice(0, -1).join(", ")}, dan ${items[items.length - 1]}`
}

const quoted = (ids: readonly ReasonId[]) => listId(ids.map((r) => `“${reasonLabel(r)}”`))
const pips = (distance: number, pair: string) => (distance / instrument(pair).pipSize).toFixed(1)

/** Rex's comments on a closed trade, the most serious first. With nothing to flag, one that says what went well. */
export function rexComments(t: CommentInput): RexComment[] {
  const out: RexComment[] = []
  const warn = (id: CommentId, text: string) => out.push({ id, tone: "warn", text })
  const side = t.side.toUpperCase()

  if (!t.checks.notRevenge) {
    warn(
      "revenge",
      `Trade ini dibuka dalam ${DISIPLIN.REVENGE_WINDOW_CANDLES} candle setelah rugi, dengan lot lebih besar. Itu pola revenge trading: jeda dulu, lalu tanya apakah setup-nya benar-benar ada.`,
    )
  }
  if (!t.checks.slNotWidened) {
    warn(
      "sl-widened",
      "SL kamu jauhkan atau hapus saat trade berjalan. Rencana awal sudah menentukan kapan idemu salah; menggeser SL menjauh menambah risiko setelah masuk.",
    )
  }
  if (t.slInitial === null) {
    warn("no-sl", "Trade ini dibuka tanpa SL, jadi kerugiannya tidak punya batas sampai stop out. Tentukan titik salahmu sebelum masuk.")
  } else if (t.riskPct !== null && t.riskPct > DISIPLIN.MAX_RISK_PCT) {
    warn(
      "risk-above",
      `Risiko ${pct(t.riskPct)} saldo, di atas batas ${DISIPLIN.MAX_RISK_PCT}%. Perkecil lot sampai kerugian di SL paling banyak ${DISIPLIN.MAX_RISK_PCT}% saldo.`,
    )
  }
  const against = t.reasons.filter((r) => CONTRADICTS[t.side].includes(r))
  if (against.length > 0) {
    warn(
      "reason-contradicts",
      `Kamu ${side} dengan alasan ${quoted(against)}, padahal alasan itu menunjuk ke arah sebaliknya. Cek lagi apa yang sebenarnya kamu lihat di chart.`,
    )
  }
  if (t.slInitial !== null && t.rangeAvg > 0 && Math.abs(t.entry - t.slInitial) < t.rangeAvg) {
    warn(
      "sl-too-close",
      `SL hanya ${pips(Math.abs(t.entry - t.slInitial), t.pair)} pip dari entry, lebih dekat dari rata-rata panjang candle (${pips(t.rangeAvg, t.pair)} pip) dalam ${DISIPLIN.SL_CLOSE_RANGE_CANDLES} candle terakhir. Gerakan biasa saja sudah bisa menyentuhnya.`,
    )
  }
  if (t.reasons.includes("ikut-feeling")) {
    warn(
      "feeling",
      "Salah satu alasanmu “Ikut feeling”. Jujur itu bagus. Sebelum masuk, cari satu hal di chart yang mendukung feeling itu.",
    )
  }
  if (out.length > 0) return out

  // Nothing flagged: SL was set and kept, risk within the limit, reasons in
  // line with the side. Say so, plus the one check no rule above covers.
  const good = ["SL dipasang sejak awal dan tidak dijauhkan", `risiko ${pct(t.riskPct ?? 0)} saldo`]
  if (t.checks.rewardRisk && t.rewardRisk !== null) good.push(`target ${t.rewardRisk.toFixed(1)}× risiko`)
  good.push(`alasan sejalan dengan arah ${side}`)
  let text = `Yang sudah baik: ${listId(good)}. Rencana seperti ini yang dinilai, apa pun hasilnya.`
  if (!t.checks.rewardRisk) {
    text +=
      t.rewardRisk === null
        ? ` Satu lagi: pasang TP, minimal ${DISIPLIN.MIN_REWARD_RISK}× jarak SL.`
        : ` Satu lagi: target baru ${t.rewardRisk.toFixed(1)}× risiko, Disiplin meminta minimal ${DISIPLIN.MIN_REWARD_RISK}×.`
  }
  return [{ id: "good", tone: "good", text }]
}

/** Rex's advice in an account review, for the Disiplin check failed most often. */
const ADVICE: Record<CheckId, string> = {
  slAtEntry: "Pasang SL sebelum masuk. Tanpa SL, satu trade bisa menghabiskan akun.",
  riskWithinLimit: `Mulai dari risiko: tentukan SL dulu, lalu pilih lot yang membuat kerugian di SL paling banyak ${DISIPLIN.MAX_RISK_PCT}% saldo.`,
  rewardRisk: `Pasang TP setidaknya ${DISIPLIN.MIN_REWARD_RISK}× jarak SL, supaya satu trade yang benar menutup lebih dari satu yang salah.`,
  slNotWidened: "Biarkan SL di tempatnya. Menjauhkannya mengubah rencana di tengah jalan, tepat saat kepala sedang panas.",
  notRevenge: "Setelah rugi, jeda dulu. Lot lebih besar untuk membalas kerugian adalah keputusan emosi, bukan keputusan chart.",
}

/** One line for the review: what to work on first, or that the plan held when nothing failed. */
export function reviewAdvice(mostFailed: CheckId | null) {
  if (mostFailed === null) {
    return "Rencanamu sudah mengikuti aturan Disiplin. Kerugian beruntun tetap bisa terjadi walau rencananya benar; itu bagian dari trading."
  }
  return `${CHECK_LABELS[mostFailed]} paling sering tidak lolos. ${ADVICE[mostFailed]}`
}
