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
import type { T } from "@/lib/i18n/translator"

// Akun Latihan lessons. Server-only because each holds its answer key
// (non-negotiable #1): the page sends the question and options, and only the
// route handler knows which option is right. The numbers come from
// lib/demo/lesson-math; the words from the demo.lessons catalogue, in the
// player's language (`t` is scoped to demo.lessons).

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

function introLesson(tt: T): KeyedLesson {
  const t = (key: string, values?: Record<string, string | number>) => tt(`intro.${key}`, values)
  const rows = leverageRows([0.01, 0.05, 0.1])
  const small = rows[0]
  const big = rows[2]
  const out = stopOutPoint(0.1)
  const habis = AKUN_HABIS[1]
  const start = usd(ACCOUNT.STARTING_BALANCE)
  const v = {
    start,
    leverage: ACCOUNT.LEVERAGE,
    contract: ACCOUNT.CONTRACT_SIZE.toLocaleString("en-US"),
    pair: LESSON_PAIR,
    bigLot: lot(big.lot),
    bigPip: usd(big.pipValue),
    smallLot: lot(small.lot),
    smallPip: usd(small.pipValue),
    lossPips: LESSON_LOSS_PIPS,
    bigLossPct: pct(big.lossPct),
    smallLossPct: pct(small.lossPct),
    bigMargin: usd(big.margin),
    bigLoss: usd(big.loss),
    smallLoss: usd(small.loss),
    price: LESSON_PRICE.toFixed(4),
    maxRisk: DISIPLIN.MAX_RISK_PCT,
    stopOut: ACCOUNT.STOP_OUT_LEVEL,
    outLot: lot(0.1),
    outMargin: usd(out.margin),
    outEquity: usd(out.equity),
    outLoss: usd(out.loss),
    outPips: out.pips,
    habis: usd(habis),
    minLot: lot(ACCOUNT.MIN_LOT),
  }

  return {
    id: "intro",
    title: t("title"),
    summary: t("summary", v),
    sections: [
      {
        title: t("s1.title"),
        paragraphs: [t("s1.p1", v), t("s1.p2", v)],
        table: {
          head: [t("s1.head.lot"), t("s1.head.pip"), t("s1.head.margin"), t("s1.head.loss", v), t("s1.head.pct", v)],
          rows: rows.map((r) => [lot(r.lot), usd(r.pipValue), usd(r.margin), usd(r.loss), pct(r.lossPct)]),
          caption: t("s1.caption", v),
        },
      },
      { title: t("s2.title"), paragraphs: [t("s2.p1", v), t("s2.p2", v)] },
      { title: t("s3.title"), paragraphs: [t("s3.p1", v), t("s3.p2", v)] },
      { title: t("s4.title"), paragraphs: [t("s4.p1", v), t("s4.p2")] },
    ],
    question: t("question", v),
    options: [pct(small.lossPct), pct(small.lossPct * 2), pct(big.lossPct), pct(big.lossPct * 2)],
    answer: 2,
    explain: t("explain", v),
    hint: t("hint", v),
  }
}

/** After an account runs out (required) or is reset (optional): sizing a trade from its SL. */
function riskLesson(tt: T): KeyedLesson {
  const t = (key: string, values?: Record<string, string | number>) => tt(`risk.${key}`, values)
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
  const v = {
    start: usd(ACCOUNT.STARTING_BALANCE),
    maxRisk: DISIPLIN.MAX_RISK_PCT,
    budget: usd(budget),
    pair: LESSON_PAIR,
    minLot: lot(minLot),
    perPip: usd(perPip),
    spread,
    price: LESSON_PRICE.toFixed(4),
    window: DISIPLIN.REVENGE_WINDOW_CANDLES,
    q,
    answerLot: lot(answerLot),
    atLoss: usd(at.loss),
    atPct: pct(at.lossPct),
    overLot: lot(over),
    overLoss: usd(atOver.loss),
    overPct: pct(atOver.lossPct),
  }

  return {
    id: "risk",
    title: t("title"),
    summary: t("summary", v),
    sections: [
      { title: t("s1.title"), paragraphs: [t("s1.p1", v), t("s1.p2")] },
      {
        title: t("s2.title"),
        paragraphs: [t("s2.p1", v), t("s2.p2")],
        table: {
          head: [t("s2.head.sl"), t("s2.head.perMin", v), t("s2.head.maxLot"), t("s2.head.loss"), t("s2.head.pct", v)],
          rows: rows.map((r) => [
            t("s2.pips", { n: r.slPips }),
            usd(r.perMinLot),
            r.maxLot === null ? t("s2.none") : lot(r.maxLot),
            usd(r.loss),
            pct(r.lossPct),
          ]),
          caption: t("s2.caption", v),
        },
      },
      {
        title: t("s3.title"),
        paragraphs: [
          tooFar
            ? t("s3.p1Far", { ...v, sl: tooFar.slPips, loss: usd(tooFar.loss), lossPct: pct(tooFar.lossPct) })
            : t("s3.p1", v),
          t("s3.p2"),
        ],
      },
      { title: t("s4.title"), paragraphs: [t("s4.p1", v), t("s4.p2")] },
    ],
    question: t("question", v),
    options,
    answer: 1,
    explain: t("explain", v),
    hint: t("hint", v),
  }
}

const LESSONS: Record<LessonId, (t: T) => KeyedLesson> = { intro: introLesson, risk: riskLesson }

export const isLessonId = (v: unknown): v is LessonId => typeof v === "string" && v in LESSONS

/**
 * The lesson without its answer key, for the page. Fields are listed one by
 * one, so a key added to KeyedLesson later can't slip through by accident.
 */
export function publicLesson(id: LessonId, t: T): PublicLesson {
  const l = LESSONS[id](t)
  return { id: l.id, title: l.title, summary: l.summary, sections: l.sections, question: l.question, options: l.options }
}

/** Checks an answer. Only route handlers call this. */
export function checkLessonAnswer(id: LessonId, answer: number, t: T) {
  const lesson = LESSONS[id](t)
  const correct = Number.isInteger(answer) && answer === lesson.answer
  return { correct, message: correct ? lesson.explain : lesson.hint }
}
