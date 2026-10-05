import "server-only"
import { ACCOUNT, AKUN_HABIS, COSTS, DISIPLIN } from "@/lib/demo/config"
import { lot, pct, usd } from "@/lib/demo/format"
import {
  LESSON_LOSS_PIPS,
  LESSON_PAIR,
  LESSON_PRICE,
  RISK_QUESTION_SL_PIPS,
  leverageRows,
  lossAtSl,
  maxLotWithin,
  riskBudget,
  riskRows,
  stopOutPoint,
} from "@/lib/demo/lesson-math"
import { normalizeLot, pipValue } from "@/lib/demo/money"

// Akun Latihan lessons. Server-only because each holds its answer key
// (non-negotiable #1): the page sends the question and options, and only the
// route handler knows which option is right.

export type LessonId = "intro" | "risk"

export type LessonTable = { head: string[]; rows: string[][]; caption: string }
export type LessonSection = { title: string; paragraphs: string[]; table?: LessonTable }

/** What the browser receives. */
export type PublicLesson = {
  id: LessonId
  title: string
  summary: string
  sections: LessonSection[]
  question: string
  options: string[]
}

type KeyedLesson = PublicLesson & {
  answer: number
  /** Shown after a right answer. */
  explain: string
  /** Shown after a wrong one: points back to the lesson without giving the answer away. */
  hint: string
}

function introLesson(): KeyedLesson {
  const rows = leverageRows([0.01, 0.05, 0.1])
  const small = rows[0]
  const big = rows[2]
  const out = stopOutPoint(0.1)
  const habis = AKUN_HABIS[1]
  const start = ACCOUNT.STARTING_BALANCE

  return {
    id: "intro",
    title: "Leverage di akunmu",
    summary: `Sebelum trade pertama: berapa yang dipertaruhkan setiap lot di akun ${usd(start)} dengan leverage 1:${ACCOUNT.LEVERAGE}.`,
    sections: [
      {
        title: "Satu pip, berapa dolar?",
        paragraphs: [
          `Di akun ini, 1 lot = ${ACCOUNT.CONTRACT_SIZE.toLocaleString("en-US")} unit mata uang. Di ${LESSON_PAIR}, ${lot(big.lot)} lot membuat setiap pip bernilai ${usd(big.pipValue)}. Dengan ${lot(small.lot)} lot, satu pip hanya ${usd(small.pipValue)}.`,
          `Leverage 1:${ACCOUNT.LEVERAGE} berarti kamu cukup menyetor 1/${ACCOUNT.LEVERAGE} nilai posisi sebagai margin. Posisinya tetap besar, jadi untung dan ruginya juga besar.`,
        ],
        table: {
          head: ["Lot", "Nilai 1 pip", "Margin", `Rugi ${LESSON_LOSS_PIPS} pip`, `% dari ${usd(start)}`],
          rows: rows.map((r) => [lot(r.lot), usd(r.pipValue), usd(r.margin), usd(r.loss), pct(r.lossPct)]),
          caption: `${LESSON_PAIR} di harga ${LESSON_PRICE.toFixed(4)}, saldo awal ${usd(start)}. Batas Disiplin: risiko maksimal ${DISIPLIN.MAX_RISK_PCT}% per trade.`,
        },
      },
      {
        title: "Kenapa lot kecil dulu",
        paragraphs: [
          `Rugi ${LESSON_LOSS_PIPS} pip dengan ${lot(big.lot)} lot menghapus ${pct(big.lossPct)} saldomu dalam satu trade. Dengan ${lot(small.lot)} lot, kerugian yang sama hanya ${pct(small.lossPct)}.`,
          `Margin ${lot(big.lot)} lot (${usd(big.margin)}) sudah lebih dari setengah saldo ${usd(start)}. Itu sebabnya Stage 1 memakai ${lot(small.lot)} lot.`,
        ],
      },
      {
        title: "Stop out",
        paragraphs: [
          `Margin level = equity ÷ margin yang dipakai. Kalau turun ke ${ACCOUNT.STOP_OUT_LEVEL}%, semua trade ditutup otomatis supaya saldo tidak minus. Itu disebut stop out.`,
          `Contoh: satu trade ${lot(0.1)} lot memakai margin ${usd(out.margin)}. Stop out terjadi saat equity tinggal ${usd(out.equity)}, yaitu setelah rugi ${usd(out.loss)} atau sekitar ${out.pips} pip.`,
        ],
      },
      {
        title: "Akun habis",
        paragraphs: [
          `Di Stage 1, kalau tidak ada trade terbuka dan saldo di bawah ${usd(habis)}, akunmu habis dan trading berhenti. Batas ini tetap untuk setiap chart: margin ${lot(ACCOUNT.MIN_LOT)} lot di pair termahal stage-mu, dibulatkan ke atas. Di atasnya, trade terkecil selalu muat. Batasnya juga tertulis di dashboard akunmu.`,
          "Tidak ada tombol tambah saldo. Rex akan meninjau akunmu dari datanya sendiri, kamu belajar satu materi risiko, lalu memulai akun baru dengan saldo awal.",
        ],
      },
    ],
    question: `Kamu membuka ${lot(big.lot)} lot ${LESSON_PAIR} dengan stop loss ${LESSON_LOSS_PIPS} pip. Jika SL kena, berapa persen saldo awal ${usd(start)} yang hilang?`,
    options: [pct(small.lossPct), pct(small.lossPct * 2), pct(big.lossPct), pct(big.lossPct * 2)],
    answer: 2,
    explain: `Tepat. ${LESSON_LOSS_PIPS} pip × ${usd(big.pipValue)} = ${usd(big.loss)}, dan ${usd(big.loss)} ÷ ${usd(start)} = ${pct(big.lossPct)}. Dengan ${lot(small.lot)} lot, kerugiannya hanya ${usd(small.loss)} (${pct(small.lossPct)}).`,
    hint: `Belum tepat. Lihat tabel: berapa nilai 1 pip untuk ${lot(big.lot)} lot? Kalikan dengan ${LESSON_LOSS_PIPS}, lalu bandingkan dengan ${usd(start)}.`,
  }
}

/** After an account runs out (required) or is reset (optional): sizing a trade from its SL. */
function riskLesson(): KeyedLesson {
  const start = ACCOUNT.STARTING_BALANCE
  const budget = riskBudget()
  const spread = COSTS.SPREAD_PIPS[LESSON_PAIR]
  const minLot = ACCOUNT.MIN_LOT
  const perPip = pipValue(LESSON_PAIR, minLot, LESSON_PRICE)
  const rows = riskRows()
  const tooFar = rows.find((r) => r.maxLot === null)
  const q = RISK_QUESTION_SL_PIPS
  const answerLot = maxLotWithin(q)!
  const over = normalizeLot(answerLot + ACCOUNT.LOT_STEP)
  const at = lossAtSl(answerLot, q)
  const atOver = lossAtSl(over, q)
  // The trap: the lot that fits the budget if the spread is forgotten.
  const naive = normalizeLot(Math.floor(budget / (q * perPip) + 1e-9) * minLot)
  const options = [minLot, answerLot, naive, 0.1].map(lot)

  return {
    id: "risk",
    title: "Ukuran posisi dimulai dari risiko",
    summary: `Sebelum akun berikutnya: cara memilih lot dari stop loss, supaya satu trade tidak pernah memakan lebih dari ${DISIPLIN.MAX_RISK_PCT}% saldo.`,
    sections: [
      {
        title: "Mulai dari anggaran risiko",
        paragraphs: [
          `Lot bukan langkah pertama. Tentukan dulu berapa yang rela kamu hilangkan kalau idemu salah. Batas Disiplin di sini ${DISIPLIN.MAX_RISK_PCT}% saldo: dengan saldo ${usd(start)}, itu ${usd(budget)} per trade.`,
          "Angka itu tetap sama, seyakin apa pun kamu pada setup-nya. Yang berubah hanya lot, mengikuti jarak stop loss.",
        ],
      },
      {
        title: "Dari stop loss ke lot",
        paragraphs: [
          `Kerugian di SL = (jarak SL + spread) × nilai pip. Di ${LESSON_PAIR}, ${lot(minLot)} lot bernilai ${usd(perPip)} per pip dan spread-nya sekitar ${spread} pip, yang sudah dibayar sejak trade dibuka.`,
          "Taruh SL di tempat idemu terbukti salah, lalu cari lot terbesar yang kerugiannya masih di bawah anggaran. SL lebih jauh berarti lot lebih kecil.",
        ],
        table: {
          head: ["Jarak SL", `Rugi per ${lot(minLot)} lot`, "Lot terbesar", "Rugi di SL", `% dari ${usd(start)}`],
          rows: rows.map((r) => [
            `${r.slPips} pip`,
            usd(r.perMinLot),
            r.maxLot === null ? "Tidak ada" : lot(r.maxLot),
            usd(r.loss),
            pct(r.lossPct),
          ]),
          caption: `${LESSON_PAIR} di harga ${LESSON_PRICE.toFixed(4)}, spread ${spread} pip, saldo ${usd(start)}, anggaran ${usd(budget)} (${DISIPLIN.MAX_RISK_PCT}%). Baris "Tidak ada": angka rugi memakai ${lot(minLot)} lot.`,
        },
      },
      {
        title: "Kalau lot terkecil pun terlalu besar",
        paragraphs: [
          tooFar
            ? `Dengan SL ${tooFar.slPips} pip, ${lot(minLot)} lot saja sudah kehilangan ${usd(tooFar.loss)} (${pct(tooFar.lossPct)}). Jangan mendekatkan SL hanya supaya lolos batas: SL yang terlalu dekat kena oleh gerakan biasa.`
            : `Kalau ${lot(minLot)} lot pun melewati batas, jangan mendekatkan SL hanya supaya lolos: SL yang terlalu dekat kena oleh gerakan biasa.`,
          "Lewati setup itu dan tunggu yang lebih rapi. Tidak trade juga keputusan yang disiplin.",
        ],
      },
      {
        title: "Kerugian tidak perlu dibalas",
        paragraphs: [
          `Setelah rugi, lot tetap mengikuti anggaran, bukan keinginan menutup kerugian. Lot lebih besar dalam ${DISIPLIN.REVENGE_WINDOW_CANDLES} candle setelah rugi dihitung revenge trade.`,
          "Akun berikutnya mulai dari saldo awal lagi. Stage-mu tetap, begitu juga jurnal akun lama di Riwayat akun.",
        ],
      },
    ],
    question: `Saldo ${usd(start)}, batas risiko ${DISIPLIN.MAX_RISK_PCT}%, SL ${q} pip di ${LESSON_PAIR} (spread ${spread} pip). Lot terbesar yang masih lolos pemeriksaan risiko?`,
    options,
    answer: 1,
    explain: `Tepat. Anggaranmu ${usd(budget)}. Dengan SL ${q} pip plus spread ${spread} pip, ${lot(answerLot)} lot rugi ${usd(at.loss)} (${pct(at.lossPct)}) di SL. ${lot(over)} lot sudah ${usd(atOver.loss)} (${pct(atOver.lossPct)}), lewat batas.`,
    hint: `Belum tepat. Hitung anggaranmu dulu (${DISIPLIN.MAX_RISK_PCT}% dari ${usd(start)}), lalu kerugian per ${lot(minLot)} lot: (SL + spread) × ${usd(perPip)}. Jangan lupa spread-nya.`,
  }
}

const LESSONS: Record<LessonId, () => KeyedLesson> = { intro: introLesson, risk: riskLesson }

export const isLessonId = (v: unknown): v is LessonId => typeof v === "string" && v in LESSONS

/**
 * The lesson without its answer key, for the page. Fields are listed one by
 * one, so a key added to KeyedLesson later can't slip through by accident.
 */
export function publicLesson(id: LessonId): PublicLesson {
  const l = LESSONS[id]()
  return { id: l.id, title: l.title, summary: l.summary, sections: l.sections, question: l.question, options: l.options }
}

/** Checks an answer. Only route handlers call this. */
export function checkLessonAnswer(id: LessonId, answer: number) {
  const lesson = LESSONS[id]()
  const correct = Number.isInteger(answer) && answer === lesson.answer
  return { correct, message: correct ? lesson.explain : lesson.hint }
}
