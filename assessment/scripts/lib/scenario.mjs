// A scenario's rubric numbers and its per-aspect feedback, from the context
// computed before "Mulai" (lib/features.mjs). Used by build.mjs; validate.mjs
// checks the numbers make sense.

import { pipSize } from "./data.mjs"

const round = (x, d) => Number(x.toFixed(d))
const money = (x) => Math.round(x * 100) / 100
const lotDown = (x) => Math.floor(x * 100 + 1e-9) / 100

/** Everything a scenario's rubric needs from the candles before "Mulai". */
export function scenarioNumbers(s, ctx) {
  const pip = pipSize(s.pair)
  const digits = pip === 0.01 ? 3 : 5
  const atr = ctx.atr_pips
  const side = s.decision.ideal
  let pending = null
  if (s.decision.entry === "pending") {
    if (side === "buy") {
      const top = Math.min(ctx.ema20, ctx.price - 0.2 * atr * pip)
      const bottom = (ctx.last_swing_low ?? ctx.price - 2 * atr * pip) + 0.2 * atr * pip
      pending =
        top > bottom
          ? { type: "buy_limit", from: round(bottom, digits), to: round(top, digits) }
          : { type: "buy_limit", from: round(ctx.price - 1.5 * atr * pip, digits), to: round(ctx.price - 0.3 * atr * pip, digits) }
    } else {
      const bottom = Math.max(ctx.ema20, ctx.price + 0.2 * atr * pip)
      const top = (ctx.last_swing_high ?? ctx.price + 2 * atr * pip) - 0.2 * atr * pip
      pending =
        top > bottom
          ? { type: "sell_limit", from: round(bottom, digits), to: round(top, digits) }
          : { type: "sell_limit", from: round(ctx.price + 0.3 * atr * pip, digits), to: round(ctx.price + 1.5 * atr * pip, digits) }
    }
  }
  // Distances are measured from where the order would fill: the price at Start, or the middle of the pending zone.
  const entryRef = pending ? (pending.from + pending.to) / 2 : ctx.price
  let structure = null
  let slPips = null
  if (side === "buy" && ctx.last_swing_low !== null && ctx.last_swing_low < entryRef) {
    structure = round(ctx.last_swing_low - 0.5 * atr * pip, digits)
    slPips = round((entryRef - structure) / pip, 1)
  } else if (side === "sell" && ctx.last_swing_high !== null && ctx.last_swing_high > entryRef) {
    structure = round(ctx.last_swing_high + 0.5 * atr * pip, digits)
    slPips = round((structure - entryRef) / pip, 1)
  }
  // The SL the rubric expects: beyond the structure, and never tighter than 1× ATR.
  const slTarget = slPips === null ? round(1.5 * atr, 1) : round(Math.max(slPips, atr), 1)
  const pv = ctx.pip_value_usd_per_lot
  const risk1 = money(s.balance * 0.01)
  const risk2 = money(s.balance * 0.02)
  return {
    reference_price: ctx.price,
    entry_reference: round(entryRef, digits),
    atr14_pips: atr,
    invalidation_level: structure,
    structure_sl_pips: slPips,
    expected_sl_pips: slTarget,
    expected_sl_atr: round(slTarget / atr, 2),
    sl_band_pips: [round(atr, 1), round(3 * atr, 1)],
    pip_value_usd_per_lot: pv,
    risk_usd_1pct: risk1,
    risk_usd_2pct: risk2,
    lot_at_1pct: lotDown(risk1 / (slTarget * pv)),
    lot_at_2pct: lotDown(risk2 / (slTarget * pv)),
    risk_pct_at_min_lot: round(((0.01 * slTarget * pv) / s.balance) * 100, 2),
    min_lot_fits: lotDown(risk2 / (slTarget * pv)) >= 0.01,
    min_tp_pips: round(1.5 * slTarget, 1),
    pending_zone: pending,
  }
}

/** Numbers in each language's own style: 10.000 and 82,5 in Indonesian, 10,000 and 82.5 in English. */
const num = (x, lang, d = null) =>
  x.toLocaleString(lang === "id" ? "id-ID" : "en-US", d === null ? { maximumFractionDigits: 2 } : { minimumFractionDigits: d, maximumFractionDigits: d })
const usd = (x, lang) => "$" + num(x, lang)
const price = (x, pair, lang) => num(x, lang, pipSize(pair) === 0.01 ? 3 : 5)
const both = (fn) => ({ id: fn("id"), en: fn("en") })

function lotLine(n, L) {
  if (n.lot_at_1pct >= 0.01)
    return L === "id"
      ? `lot yang sesuai sekitar ${num(n.lot_at_1pct, L, 2)}–${num(n.lot_at_2pct, L, 2)} (1 pip per lot ≈ ${usd(n.pip_value_usd_per_lot, L)}).`
      : `a fitting lot is about ${num(n.lot_at_1pct, L, 2)}–${num(n.lot_at_2pct, L, 2)} (1 pip per lot ≈ ${usd(n.pip_value_usd_per_lot, L)}).`
  if (n.lot_at_2pct >= 0.01)
    return L === "id"
      ? `lot terkecil 0,01 sudah memakai sekitar ${num(n.risk_pct_at_min_lot, L)}% saldo, jadi 0,01 lot adalah batas atasnya.`
      : `the smallest lot, 0.01, already uses about ${num(n.risk_pct_at_min_lot, L)}% of the balance, so 0.01 lot is the ceiling.`
  return L === "id"
    ? `bahkan 0,01 lot sudah memakai sekitar ${num(n.risk_pct_at_min_lot, L)}% saldo; cari SL struktur yang lebih dekat atau lewati.`
    : `even 0.01 lot already uses about ${num(n.risk_pct_at_min_lot, L)}% of the balance; find a closer structure SL or skip.`
}

/** The per-aspect feedback for a scenario, in both languages, from its numbers plus the author's notes. */
export function feedbackFor(s, n) {
  if (s.decision.ideal === "no_trade") {
    const skip = { id: "Tidak dinilai: jawaban yang diharapkan adalah NO TRADE.", en: "Not scored: the expected answer is NO TRADE." }
    return { decision: s.decision.why, risk: skip, sl: skip, tp: skip, management: skip }
  }
  const from = (L) =>
    n.pending_zone
      ? (L === "id" ? " dari area pending " : " from the pending area ") + price(n.pending_zone.from, s.pair, L) + "–" + price(n.pending_zone.to, s.pair, L)
      : ""
  return {
    decision: s.decision.why,
    risk: both((L) =>
      L === "id"
        ? `Saldo ${usd(s.balance, L)}: risiko 1–2% = ${usd(n.risk_usd_1pct, L)}–${usd(n.risk_usd_2pct, L)}. Dengan SL sekitar ${num(n.expected_sl_pips, L)} pip, ${lotLine(n, L)}`
        : `Balance ${usd(s.balance, L)}: 1–2% risk = ${usd(n.risk_usd_1pct, L)}–${usd(n.risk_usd_2pct, L)}. With an SL of about ${num(n.expected_sl_pips, L)} pips, ${lotLine(n, L)}`,
    ),
    sl: both((L) => {
      const atr = num(n.atr14_pips, L)
      const hi = num(n.sl_band_pips[1], L)
      if (n.invalidation_level === null)
        return L === "id"
          ? `ATR(14) saat Mulai ≈ ${atr} pip. SL yang wajar sekitar 1–3× ATR (${num(n.sl_band_pips[0], L)}–${hi} pip), di balik level yang membatalkan idemu.`
          : `ATR(14) at Start ≈ ${atr} pips. A sensible SL is about 1–3× ATR (${num(n.sl_band_pips[0], L)}–${hi} pips), beyond the level that cancels your idea.`
      return L === "id"
        ? `ATR(14) saat Mulai ≈ ${atr} pip. Level yang membatalkan ide ada di balik swing terakhir, sekitar ${price(n.invalidation_level, s.pair, L)} (termasuk buffer ½ ATR), jadi SL sekitar ${num(n.expected_sl_pips, L)} pip${from(L)}. SL di bawah ~1× ATR mudah tersapu noise; di atas ~3× ATR (${hi} pip) lot jadi sangat kecil atau risikonya melewati batas.`
        : `ATR(14) at Start ≈ ${atr} pips. The level that cancels the idea sits beyond the last swing, around ${price(n.invalidation_level, s.pair, L)} (with a ½ ATR buffer), so the SL is about ${num(n.expected_sl_pips, L)} pips${from(L)}. An SL under ~1× ATR gets swept by noise; beyond ~3× ATR (${hi} pips) the lot gets very small or the risk breaks the limit.`
    }),
    tp: both((L) =>
      (L === "id"
        ? `Target minimal 1 : 1,5 berarti TP sekitar ${num(n.min_tp_pips, L)} pip atau lebih dari entry. ${s.tp_hint?.id ?? ""}`
        : `A 1 : 1.5 minimum means a TP about ${num(n.min_tp_pips, L)} pips or more from entry. ${s.tp_hint?.en ?? ""}`
      ).trim(),
    ),
    management: both((L) =>
      (L === "id"
        ? `Biarkan posisi berjalan sampai SL atau TP, atau tutup manual dengan alasan yang jelas (struktur rusak, rilis besar mendekat). Menutup karena panik dekat SL tanpa sinyal baru, atau mengambil untung kecil jauh sebelum target, mengurangi nilai. ${s.management?.id ?? ""}`
        : `Let the position run to the SL or TP, or close it by hand for a clear reason (structure broken, a big release coming). Closing in panic near the SL with no new signal, or banking a small profit long before the target, lowers the score. ${s.management?.en ?? ""}`
      ).trim(),
    ),
  }
}
