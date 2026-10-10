import type { Locale } from "@/lib/i18n/locale"

// For the LLM call (Groq) when it's added: the reply language goes in the
// system prompt, alongside the instruction to keep trading terms as they are.
// Nothing calls an LLM yet. Pure.

const INSTRUCTION: Record<Locale, string> = {
  id: "Jawab dalam Bahasa Indonesia yang santai tapi jelas. Jangan terjemahkan istilah trading baku: BUY, SELL, WAIT, SL, TP, pip, lot, ATR, support, resistance, spread.",
  en: "Reply in plain, friendly English. Keep standard trading terms as they are: BUY, SELL, WAIT, SL, TP, pip, lot, ATR, support, resistance, spread.",
}

export const languageInstruction = (locale: Locale) => INSTRUCTION[locale]
