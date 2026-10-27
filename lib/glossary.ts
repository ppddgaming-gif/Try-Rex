import type { Locale } from "@/lib/i18n/locale"

// The trading glossary. One list feeds two places: the dotted-underline terms
// inside game and lesson text (components/glossary) and the Kamus page
// (/belajar/kamus). The words live in the glossary catalogue
// (messages/<locale>/glossary.json: entries.<slug>.term / .short / .example);
// this file holds what isn't copy: categories, lessons, and the spellings
// matched in text, per language.
//
// DRAFT: written as placeholder teaching copy while reputable sources are
// gathered. Nothing here is investment advice; keep claims definitional and
// never add statistics without a source.

export type GlossaryCategory = "dasar" | "chart" | "risiko" | "forex" | "psikologi"

export const CATEGORIES: GlossaryCategory[] = ["dasar", "chart", "risiko", "forex", "psikologi"]

export type GlossaryEntry = {
  slug: string
  category: GlossaryCategory
  /** Every spelling that should be underlined in text of that language, case-insensitive. */
  aliases: Record<Locale, string[]>
  /** The catalogue has entries.<slug>.example. */
  example?: true
  /** A Belajar 101 lesson that covers it in depth. */
  lesson?: string
}

export const GLOSSARY: GlossaryEntry[] = [
  // Dasar
  { slug: "pair", category: "dasar", aliases: { id: ["pair", "pasangan mata uang"], en: ["pair", "pairs", "currency pair"] }, example: true, lesson: "pasar-dan-instrumen" },
  { slug: "buy", category: "dasar", aliases: { id: ["buy", "long", "posisi beli"], en: ["buy", "long", "buy position"] }, lesson: "buy-sell-wait" },
  { slug: "sell", category: "dasar", aliases: { id: ["sell", "short", "posisi jual"], en: ["sell", "short", "sell position"] }, lesson: "buy-sell-wait" },
  { slug: "wait", category: "dasar", aliases: { id: ["wait", "no-trade", "tidak mengambil posisi"], en: ["wait", "no-trade", "staying out"] }, lesson: "buy-sell-wait" },
  { slug: "entry", category: "dasar", aliases: { id: ["entry", "harga entry", "titik masuk"], en: ["entry", "entry price"] } },
  { slug: "pip", category: "dasar", aliases: { id: ["pip", "pips"], en: ["pip", "pips"] }, example: true },
  { slug: "posisi", category: "dasar", aliases: { id: ["posisi"], en: ["position", "positions"] } },
  { slug: "spread", category: "dasar", aliases: { id: ["spread"], en: ["spread"] } },
  { slug: "volatilitas", category: "dasar", aliases: { id: ["volatilitas", "volatil"], en: ["volatility", "volatile"] } },
  { slug: "likuiditas", category: "dasar", aliases: { id: ["likuiditas", "likuid"], en: ["liquidity", "liquid"] } },
  // Membaca chart
  { slug: "candlestick", category: "chart", aliases: { id: ["candlestick", "candle", "lilin"], en: ["candlestick", "candlesticks", "candle", "candles"] }, example: true, lesson: "anatomi-candlestick" },
  { slug: "body", category: "chart", aliases: { id: ["body"], en: ["body"] }, lesson: "anatomi-candlestick" },
  { slug: "sumbu", category: "chart", aliases: { id: ["sumbu", "wick", "shadow", "ekor"], en: ["wick", "wicks", "shadow"] }, lesson: "anatomi-candlestick" },
  { slug: "timeframe", category: "chart", aliases: { id: ["timeframe", "time frame", "kerangka waktu"], en: ["timeframe", "time frame"] }, lesson: "timeframe" },
  { slug: "h4", category: "chart", aliases: { id: ["h4"], en: ["h4"] }, lesson: "timeframe" },
  { slug: "trend", category: "chart", aliases: { id: ["trend", "tren", "uptrend", "downtrend"], en: ["trend", "uptrend", "downtrend"] }, lesson: "trend" },
  { slug: "menyamping", category: "chart", aliases: { id: ["menyamping", "sideways", "ranging"], en: ["sideways", "ranging"] }, lesson: "trend" },
  { slug: "kemiringan", category: "chart", aliases: { id: ["kemiringan"], en: ["slope"] }, lesson: "trend" },
  { slug: "support", category: "chart", aliases: { id: ["support", "level support"], en: ["support", "support level"] }, example: true, lesson: "support-resistance" },
  { slug: "resistance", category: "chart", aliases: { id: ["resistance", "level resistance"], en: ["resistance", "resistance level"] }, example: true, lesson: "support-resistance" },
  { slug: "rentang", category: "chart", aliases: { id: ["rentang", "range"], en: ["range"] }, lesson: "support-resistance" },
  { slug: "breakout", category: "chart", aliases: { id: ["breakout", "menembus"], en: ["breakout", "breaks out"] }, lesson: "support-resistance" },
  { slug: "konfirmasi", category: "chart", aliases: { id: ["konfirmasi"], en: ["confirmation"] } },
  { slug: "pin-bar", category: "chart", aliases: { id: ["pin bar", "pinbar"], en: ["pin bar", "pinbar"] }, lesson: "anatomi-candlestick" },
  { slug: "penolakan", category: "chart", aliases: { id: ["penolakan", "rejection"], en: ["rejection"] } },
  { slug: "bullish", category: "chart", aliases: { id: ["bullish"], en: ["bullish"] } },
  { slug: "bearish", category: "chart", aliases: { id: ["bearish"], en: ["bearish"] } },
  // Manajemen risiko
  { slug: "stop-loss", category: "risiko", aliases: { id: ["stop loss", "sl"], en: ["stop loss", "sl"] }, lesson: "stop-loss-take-profit" },
  { slug: "take-profit", category: "risiko", aliases: { id: ["take profit", "tp"], en: ["take profit", "tp"] }, lesson: "stop-loss-take-profit" },
  { slug: "risk-reward", category: "risiko", aliases: { id: ["risk-reward", "risk reward", "rasio risiko"], en: ["risk-reward", "risk reward", "reward:risk"] }, lesson: "risk-reward" },
  { slug: "leverage", category: "risiko", aliases: { id: ["leverage", "daya ungkit"], en: ["leverage"] }, lesson: "leverage" },
  { slug: "margin", category: "risiko", aliases: { id: ["margin"], en: ["margin"] }, lesson: "margin-dan-margin-call" },
  { slug: "diversifikasi", category: "risiko", aliases: { id: ["diversifikasi"], en: ["diversification"] } },
  // Forex
  { slug: "base-currency", category: "forex", aliases: { id: ["base currency", "mata uang base"], en: ["base currency"] }, lesson: "apa-itu-forex" },
  { slug: "quote-currency", category: "forex", aliases: { id: ["quote currency", "mata uang quote"], en: ["quote currency"] }, lesson: "apa-itu-forex" },
  { slug: "major-pair", category: "forex", aliases: { id: ["major pair", "pair major"], en: ["major pair", "major pairs"] }, lesson: "major-minor-cross" },
  { slug: "cross-pair", category: "forex", aliases: { id: ["cross pair", "pair cross"], en: ["cross pair", "cross pairs"] }, lesson: "major-minor-cross" },
  { slug: "lot", category: "forex", aliases: { id: ["lot"], en: ["lot size", "standard lot", "mini lot", "micro lot"] }, example: true, lesson: "pip-lot-nilai-pip" },
  { slug: "pipette", category: "forex", aliases: { id: ["pipette"], en: ["pipette", "pipettes"] }, lesson: "pip-lot-nilai-pip" },
  { slug: "bid", category: "forex", aliases: { id: ["bid", "harga bid"], en: ["bid price"] }, lesson: "bid-ask-spread-swap" },
  { slug: "ask", category: "forex", aliases: { id: ["ask", "harga ask"], en: ["ask price"] }, lesson: "bid-ask-spread-swap" },
  { slug: "swap", category: "forex", aliases: { id: ["swap", "rollover"], en: ["swap", "rollover"] }, lesson: "bid-ask-spread-swap" },
  { slug: "pending-order", category: "forex", aliases: { id: ["pending order", "buy limit", "sell limit", "buy stop", "sell stop"], en: ["pending order", "buy limit", "sell limit", "buy stop", "sell stop"] }, lesson: "jenis-order" },
  { slug: "slippage", category: "forex", aliases: { id: ["slippage"], en: ["slippage"] }, lesson: "jenis-order" },
  { slug: "sesi-pasar", category: "forex", aliases: { id: ["sesi pasar", "sesi trading"], en: ["trading session", "market session"] }, lesson: "sesi-pasar-forex" },
  { slug: "margin-call", category: "forex", aliases: { id: ["margin call"], en: ["margin call"] }, lesson: "margin-dan-margin-call" },
  { slug: "stop-out", category: "forex", aliases: { id: ["stop out"], en: ["stop out"] }, lesson: "margin-dan-margin-call" },
  { slug: "kalender-ekonomi", category: "forex", aliases: { id: ["kalender ekonomi"], en: ["economic calendar"] }, lesson: "berita-dan-fundamental" },
  // Psikologi
  { slug: "fomo", category: "psikologi", aliases: { id: ["fomo"], en: ["fomo"] }, lesson: "fomo-overtrading" },
  { slug: "overtrading", category: "psikologi", aliases: { id: ["overtrading"], en: ["overtrading"] }, lesson: "fomo-overtrading" },
  { slug: "jurnal-trading", category: "psikologi", aliases: { id: ["jurnal trading", "jurnal"], en: ["trading journal", "journal"] }, lesson: "jurnal-trading" },
]

export const glossaryBySlug = new Map(GLOSSARY.map((e) => [e.slug, e]))

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

/** Longest alias first, so "stop loss" wins over "loss" and "pin bar" over "bar". */
function matcher(locale: Locale) {
  const index = GLOSSARY.flatMap((e) => e.aliases[locale].map((a) => ({ alias: a.toLowerCase(), slug: e.slug }))).sort(
    (a, b) => b.alias.length - a.alias.length,
  )
  return {
    toSlug: new Map(index.map((a) => [a.alias, a.slug])),
    /** Matches any alias as a whole word (letters and digits on neither side). */
    re: new RegExp(`(?<![\\p{L}\\p{N}])(${index.map((a) => escape(a.alias)).join("|")})(?![\\p{L}\\p{N}])`, "giu"),
  }
}
const MATCHERS: Record<Locale, ReturnType<typeof matcher>> = { id: matcher("id"), en: matcher("en") }

export type TextPart = string | { text: string; slug: string }

/**
 * Splits text into plain strings and glossary hits. `locale` is the language
 * the text is written in. Each term is linked only the first time it appears
 * (`seen` carries that across calls), so a paragraph doesn't turn into a wall
 * of underlines.
 */
export function splitTerms(text: string, locale: Locale, seen: Set<string> = new Set()): TextPart[] {
  const { re, toSlug } = MATCHERS[locale]
  const parts: TextPart[] = []
  let last = 0
  for (const m of text.matchAll(re)) {
    const slug = toSlug.get(m[0].toLowerCase())
    if (!slug || seen.has(slug) || m.index === undefined) continue
    seen.add(slug)
    if (m.index > last) parts.push(text.slice(last, m.index))
    parts.push({ text: m[0], slug })
    last = m.index + m[0].length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts
}
