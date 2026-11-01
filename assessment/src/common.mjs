// Shared by every pilot package. MECHANICS, REASONS and CLOSE_REASONS go into
// the question files (the player sees them); RUBRIC goes into the key files only.

const t = (id, en) => ({ id, en })

export const MECHANICS = {
  trades_per_scenario: 1,
  actions: ["buy", "sell", "no_trade"],
  order_types: ["market", "pending"],
  sl_tp: "set_by_position_tool_required_fixed_after_entry",
  close: "manual_full_only_no_trailing_no_partial",
  analysis_tools_scored: false,
  autoplay: { fixed_speed: true, starts_on: "start_button", analysis_paused_before_start: true },
  auto_close: "last_candle_of_window",
  pending_unfilled: "scored_on_decision_only",
  lot: { min: 0.01, step: 0.01 },
  account_currency: "USD",
  reasons_per_decision: { min: 1, max: 3 },
  note: t(
    "Garis, trend line, rectangle, path, dan indikator hanya alat bantu analisis dan tidak dinilai. SL dan TP dari alat posisi Buy/Sell dinilai dan tidak bisa digeser setelah entry.",
    "Lines, trend lines, rectangles, paths and indicators are analysis aids and are not scored. The SL and TP set with the Buy/Sell position tool are scored and can't be moved after entry.",
  ),
}

/** Reasons the player picks (1–3) with every decision, including NO TRADE. */
export const REASONS = {
  trend: t("Searah tren di timeframe ini (puncak dan lembah naik, atau turun)", "In line with the trend on this timeframe (rising or falling highs and lows)"),
  level: t("Harga berada di area pullback, support, atau resistance yang jelas", "Price is at a clear pullback, support or resistance area"),
  structure_sl: t("Ada level struktur yang jelas untuk menaruh stop loss", "There is a clear structure level to place the stop loss"),
  rr: t("Target yang masuk akal memberi R:R minimal 1 : 1,5", "A sensible target gives at least 1 : 1.5 R:R"),
  fundamental: t("Kondisi fundamental mendukung arah ini", "The fundamental backdrop supports this direction"),
  news: t("Ada rilis atau event berdampak tinggi yang terlalu dekat", "A high-impact release or event is too close"),
  extreme_vol: t("Volatilitas ekstrem: candle dan ATR jauh di atas normal", "Extreme volatility: candles and ATR far above normal"),
  sideways: t("Pasar sideways dan sepi, tidak ada keunggulan arah", "The market is sideways and quiet, with no directional edge"),
  daily_limit: t("Batas rugi harian sudah tercapai", "The daily loss limit has been reached"),
  feeling: t("Feeling saja: harganya terlihat akan berbalik", "Just a feeling: price looks like it will turn"),
  recover: t("Ingin segera menutup kerugian sebelumnya", "I want to win back the earlier losses quickly"),
  cheap: t("Harganya sudah terlalu murah atau terlalu mahal", "The price is already too cheap or too expensive"),
}

/** Why a position was closed by hand; asked when the player closes manually. */
export const CLOSE_REASONS = {
  structure_broken: t("Struktur berbalik: candle close menembus level yang membatalkan ide", "Structure turned: a candle closed through the level that cancels the idea"),
  news_ahead: t("Rilis atau event berdampak tinggi akan segera terjadi", "A high-impact release or event is about to happen"),
  target_area: t("Harga sudah di area target yang direncanakan", "Price is at the planned target area"),
  fear: t("Takut rugi bertambah", "Afraid the loss will grow"),
  small_profit: t("Ambil untung kecil yang sudah ada", "Take the small profit that's there"),
  bored: t("Bosan menunggu", "Tired of waiting"),
}

export const RUBRIC = {
  principle: t(
    "Nilai menilai proses, bukan untung atau rugi. Proses yang benar tetap bernilai baik walaupun kena SL; proses yang salah tidak mendapat nilai tambahan karena kebetulan untung.",
    "The score judges the process, never the profit or loss. A sound process still scores well when it hits the SL; a poor one earns nothing extra for a lucky profit.",
  ),
  scenario_trade: {
    total: 100,
    risk: {
      max: 25,
      measure: "risk_pct = |entry − SL| in pips × pip value per lot (USD) × lot ÷ balance × 100",
      bands: [
        { from: 0, to: 0.5, points: 20 },
        { from: 0.5, to: 1, points: 23 },
        { from: 1, to: 2, points: 25 },
        { from: 2, to: 3, points: 18 },
        { from: 3, to: 5, points: 10 },
        { from: 5, to: 10, points: 4 },
        { from: 10, to: null, points: 0 },
      ],
    },
    sl: {
      max: 25,
      risk_part: { max: 12.5, rule: "risk band points × 0.5" },
      volatility_part: {
        max: 12.5,
        measure: "sl_atr = |entry − SL| ÷ ATR(14) at Start (key: numbers.atr14_pips)",
        bands: [
          { from: 0, to: 0.75, points: 3 },
          { from: 0.75, to: 1, points: 7 },
          { from: 1, to: 3, points: 10, bonus: { points: 2.5, when: "SL beyond numbers.invalidation_level (or no level given)" } },
          { from: 3, to: 4, points: 7 },
          { from: 4, to: null, points: 4 },
        ],
      },
    },
    tp: {
      max: 15,
      measure: "rr = |TP − entry| ÷ |entry − SL|",
      bands: [
        { from: 1.5, to: null, points: 15 },
        { from: 1.2, to: 1.5, points: 10 },
        { from: 1, to: 1.2, points: 7 },
        { from: 0.5, to: 1, points: 3 },
        { from: 0, to: 0.5, points: 0 },
      ],
    },
    decision: {
      max: 20,
      choice: { max: 14, ideal_side_ideal_entry: 14, ideal_side_other_entry: 11, acceptable: 8, wrong: 0 },
      reasons: { max: 6, rule: "6 × (valid reasons chosen ÷ reasons chosen); 0 with no reason" },
    },
    management: {
      max: 15,
      cases: [
        { case: "ran to SL, TP or the window's auto-close", points: 15 },
        { case: "manual close with a valid close reason (structure_broken, news_ahead, target_area)", points: 15 },
        { case: "manual close before the target without a valid reason (small_profit, bored)", points: 7 },
        { case: "panic close near the SL without a new signal (fear)", points: 5 },
      ],
    },
  },
  scenario_no_trade: {
    total: 100,
    rule: "When decision.ideal is no_trade the whole score is decision and reasons.",
    decision: { max: 70, no_trade: 70, any_trade: 0 },
    reasons: { max: 30, rule: "30 × (valid reasons chosen ÷ reasons chosen)" },
  },
  pending_unfilled: { rule: "A pending order that never fills is scored on the decision only: decision points × 5 (out of 100); lot, SL and TP aren't scored." },
  mcq_complex: { rule: "Per option: +1 ÷ k for each right option chosen, −1 ÷ k for each wrong option chosen (k = number of right options); floor 0, max 1." },
  mcq_basic: { rule: "1 for the right option, 0 otherwise." },
  report: t(
    "Hasil akhir berupa umpan balik per aspek (risiko, SL, TP/R:R, keputusan, manajemen posisi) dan level Learn 101 yang perlu diulang, dihitung dari soal PG yang salah per level. Tanpa peringkat dan tanpa perbandingan antar pengguna.",
    "The result is feedback per aspect (risk, SL, TP/R:R, decision, position management) and the Learn 101 levels to revisit, from the wrong answers per level. No ranking and no comparison between users.",
  ),
}
