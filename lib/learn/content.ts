import type { Locale } from "@/lib/i18n/locale"
import type { Lesson, LevelId, Text } from "@/lib/learn/types"
import { baseQuote, bidAsk, currencyPairs, pipLot, sessions, whatIsForex } from "@/lib/learn/lessons/l1-basics"
import { bullishBearish, candlestick } from "@/lib/learn/lessons/l2-candlestick"
import { marketStructure } from "@/lib/learn/lessons/l2-market-structure"
import { supportResistance } from "@/lib/learn/lessons/l2-support-resistance"
import { timeframe } from "@/lib/learn/lessons/l2-timeframe"
import { trend } from "@/lib/learn/lessons/l2-trend"
import { leverageMargin } from "@/lib/learn/lessons/l3-leverage-margin"
import { drawdown, riskAndLoss } from "@/lib/learn/lessons/l3-risk-drawdown"
import { positionSizing, riskReward, stopLossTakeProfit } from "@/lib/learn/lessons/l3-sl-tp-rrr"
import { atr } from "@/lib/learn/lessons/l4-atr"
import { breakout } from "@/lib/learn/lessons/l4-breakout"
import { confirmation } from "@/lib/learn/lessons/l4-confirmation"
import { movingAverage } from "@/lib/learn/lessons/l4-moving-average"
import { patterns } from "@/lib/learn/lessons/l4-patterns"
import { pullback } from "@/lib/learn/lessons/l4-pullback"
import { rsiLesson } from "@/lib/learn/lessons/l4-rsi"
import { trendline } from "@/lib/learn/lessons/l4-trendline"
import { calendar } from "@/lib/learn/lessons/l5-calendar"
import { economyCurrency } from "@/lib/learn/lessons/l5-economy-currency"
import { fed } from "@/lib/learn/lessons/l5-fed"
import { inflationJobs } from "@/lib/learn/lessons/l5-inflation-jobs"
import { interestRates } from "@/lib/learn/lessons/l5-interest-rates"
import { news } from "@/lib/learn/lessons/l5-news"
import { consistency } from "@/lib/learn/lessons/l6-consistency"
import { discipline } from "@/lib/learn/lessons/l6-discipline"
import { fomo } from "@/lib/learn/lessons/l6-fomo"
import { impulsive } from "@/lib/learn/lessons/l6-impulsive"
import { journal } from "@/lib/learn/lessons/l6-journal"
import { mistakes } from "@/lib/learn/lessons/l6-mistakes"

// Belajar 101: six levels, taken from the TRY-REX "Materi Basic" handouts.
// Each level's lessons follow the order of the curriculum list; moving to the
// next level takes that level's exam (lib/learn/exam). Titles, summaries and
// bodies are in both languages in the lesson files.

export type Level = { id: LevelId; title: Text; description: Text; lessons: Lesson[] }

export const LEVELS: Level[] = [
  {
    id: 1,
    title: { id: "Dasar-dasar forex", en: "Forex basics" },
    description: {
      id: "Apa itu forex, cara membaca pair, bid dan ask, pip dan lot, dan kapan pasar buka.",
      en: "What forex is, how to read a pair, bid and ask, pips and lots, and when the market is open.",
    },
    lessons: [whatIsForex, currencyPairs, baseQuote, bidAsk, pipLot, sessions],
  },
  {
    id: 2,
    title: { id: "Membaca grafik harga", en: "Reading price charts" },
    description: {
      id: "Candlestick, timeframe, tren, support dan resistance, dan struktur pasar.",
      en: "Candlesticks, timeframes, trends, support and resistance, and market structure.",
    },
    lessons: [candlestick, bullishBearish, timeframe, trend, supportResistance, marketStructure],
  },
  {
    id: 3,
    title: { id: "Manajemen risiko", en: "Risk management" },
    description: {
      id: "Risiko, leverage dan margin, stop loss dan take profit, RRR, ukuran posisi, dan drawdown.",
      en: "Risk, leverage and margin, stop loss and take profit, RRR, position size and drawdown.",
    },
    lessons: [riskAndLoss, leverageMargin, stopLossTakeProfit, riskReward, positionSizing, drawdown],
  },
  {
    id: 4,
    title: { id: "Analisis teknikal", en: "Technical analysis" },
    description: {
      id: "Trendline, breakout, pullback, pola harga, Moving Average, RSI, ATR, dan konfirmasi.",
      en: "Trendlines, breakouts, pullbacks, price patterns, Moving Averages, RSI, ATR and confirmation.",
    },
    lessons: [trendline, breakout, pullback, patterns, movingAverage, rsiLesson, atr, confirmation],
  },
  {
    id: 5,
    title: { id: "Analisis fundamental", en: "Fundamental analysis" },
    description: {
      id: "Suku bunga, inflasi dan tenaga kerja, The Fed, kalender ekonomi, dan berita berdampak tinggi.",
      en: "Interest rates, inflation and jobs, the Fed, the economic calendar and high-impact news.",
    },
    lessons: [interestRates, inflationJobs, fed, calendar, news, economyCurrency],
  },
  {
    id: 6,
    title: { id: "Psikologi dan evaluasi", en: "Psychology and review" },
    description: {
      id: "Disiplin, keputusan impulsif, FOMO, jurnal, evaluasi kesalahan, dan konsistensi.",
      en: "Discipline, impulsive decisions, FOMO, the journal, reviewing mistakes and consistency.",
    },
    lessons: [discipline, impulsive, fomo, journal, mistakes, consistency],
  },
]

export const LESSONS: Lesson[] = LEVELS.flatMap((l) => l.lessons)
export const lessonBySlug = new Map(LESSONS.map((l) => [l.slug, l]))
export const levelById = new Map(LEVELS.map((l) => [l.id, l]))

/** Lessons in reading order across all levels. */
export const ORDERED_LESSONS = LESSONS

export function neighbours(slug: string) {
  const i = ORDERED_LESSONS.findIndex((l) => l.slug === slug)
  return { prev: i > 0 ? ORDERED_LESSONS[i - 1] : null, next: i >= 0 && i < ORDERED_LESSONS.length - 1 ? ORDERED_LESSONS[i + 1] : null }
}

/** The text in the page's language. Both are always written. */
export const pick = (text: Text, locale: Locale) => text[locale]
