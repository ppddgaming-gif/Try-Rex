import { ACCOUNT, DISIPLIN } from "@/lib/demo/config"

// Rex's tips: each shows once, at the moment it matters, and can be reread
// under "Tips Rex". Which ones a player has seen is stored server-side
// (demo_tips_seen). Pure and client-safe: the text isn't secret.

export type TipId = "stop-loss" | "risk-per-trade" | "reward-risk" | "revenge-trading" | "stop-out" | "disiplin-score"

export type Tip = {
  id: TipId
  title: string
  /** When it appears, shown in the list before it has been seen. */
  when: string
  body: string[]
}

export const TIPS: Tip[] = [
  {
    id: "stop-loss",
    title: "Apa itu stop loss?",
    when: "Saat pertama kali membuka panel order",
    body: [
      "Stop loss adalah harga tempat trade-mu otomatis ditutup kalau ternyata salah. Kamu memilihnya sebelum masuk, saat kepala masih dingin.",
      "Taruh SL di tempat idemu terbukti salah, misalnya sedikit di luar support atau resistance, bukan di angka yang terasa nyaman.",
      `Di Stage 1, setiap trade wajib punya SL dan TP. Setelah itu tetap boleh tanpa, tapi Disiplin tetap memeriksanya.`,
    ],
  },
  {
    id: "risk-per-trade",
    title: "Kenapa risiko per trade penting",
    when: `Saat pertama kali risikomu melewati ${DISIPLIN.MAX_RISK_PCT}% saldo`,
    body: [
      `Risiko per trade adalah berapa persen saldo yang hilang kalau SL kena. Batas di sini ${DISIPLIN.MAX_RISK_PCT}%.`,
      `Dengan risiko ${DISIPLIN.MAX_RISK_PCT}%, sepuluh kekalahan beruntun masih menyisakan sekitar 80% saldo. Dengan risiko 10%, lima kekalahan sudah menghabiskan hampir setengahnya.`,
      "Perkecil lot atau pindahkan SL ke tempat yang masuk akal. Jangan melebarkan risiko demi satu trade yang terasa pasti.",
    ],
  },
  {
    id: "reward-risk",
    title: "Reward : risk",
    when: "Saat trade pertamamu tanpa take profit (Stage 2 ke atas)",
    body: [
      `Reward:risk membandingkan jarak ke TP dengan jarak ke SL. Minimal ${DISIPLIN.MIN_REWARD_RISK} berarti targetmu setidaknya ${DISIPLIN.MIN_REWARD_RISK}× risikonya.`,
      "Tanpa TP, kamu tidak tahu apakah trade ini sepadan. Rasio yang baik membuatmu tetap bertahan walau benar kurang dari separuh waktu.",
    ],
  },
  {
    id: "revenge-trading",
    title: "Revenge trading",
    when: "Saat pertama kali sebuah trade ditandai revenge",
    body: [
      `Revenge trading adalah masuk lagi dengan lot lebih besar tak lama setelah rugi, di sini dalam ${DISIPLIN.REVENGE_WINDOW_CANDLES} candle, untuk “membalas” kerugian.`,
      "Keputusan itu datang dari emosi, bukan dari chart. Setelah rugi, jeda satu-dua candle, lalu tanya: apakah setup-nya benar-benar ada?",
    ],
  },
  {
    id: "stop-out",
    title: "Apa yang barusan terjadi: stop out",
    when: "Saat pertama kali akunmu kena stop out",
    body: [
      `Equity-mu turun sampai ${ACCOUNT.STOP_OUT_LEVEL}% dari margin yang dipakai, jadi semua trade ditutup otomatis agar saldo tidak minus.`,
      "Ini tanda posisi terlalu besar dibanding saldo. Lot lebih kecil memberi ruang untuk salah tanpa kehilangan kendali.",
    ],
  },
  {
    id: "disiplin-score",
    title: "Cara kerja skor Disiplin",
    when: "Saat hasil Disiplin pertamamu keluar",
    body: [
      "Setiap trade yang ditutup diperiksa: SL dipasang saat masuk, risiko di bawah batas, TP dengan reward cukup, SL tidak dijauhkan, dan bukan revenge trade.",
      `Skor trade = pemeriksaan yang lolos dibagi jumlah pemeriksaan. Disiplin akunmu adalah rata-rata ${DISIPLIN.ROLLING_TRADES} trade terakhir.`,
      "XP hanya datang dari Disiplin. Untung atau rugi tidak menambah XP: trade yang rugi tapi terencana tetap dihargai.",
    ],
  },
]

export const tipById = new Map(TIPS.map((t) => [t.id, t]))
export const isTipId = (v: unknown): v is TipId => typeof v === "string" && tipById.has(v as TipId)
