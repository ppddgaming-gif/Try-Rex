import "server-only"
import { ACCOUNT, DISIPLIN } from "@/lib/demo/config"
import { lot, pct, usd } from "@/lib/demo/format"
import { LESSON_LOSS_PIPS, LESSON_PAIR, LESSON_PRICE, leverageRows, stopOutPoint } from "@/lib/demo/lesson-math"
import { bustLevel } from "@/lib/demo/money"

// Akun Latihan lessons. Server-only because each holds its answer key
// (non-negotiable #1): the page sends the question and options, and only the
// route handler knows which option is right.

export type LessonId = "intro"

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
  const habis = bustLevel(LESSON_PAIR, LESSON_PRICE)
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
          `Kalau equity tidak cukup lagi untuk margin trade terkecil (${lot(ACCOUNT.MIN_LOT)} lot, sekitar ${usd(habis)} di ${LESSON_PAIR}), akunmu habis dan trading berhenti. Dengan lot ${lot(small.lot)}, batas ini tercapai lebih dulu daripada stop out.`,
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

const LESSONS: Record<LessonId, () => KeyedLesson> = { intro: introLesson }

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
