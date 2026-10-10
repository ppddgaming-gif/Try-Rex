import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/locale"

// Content that is authored per language rather than kept in the message
// catalogues: future assessment questions, lesson bodies. Indonesian is
// required; English is optional until someone translates it. Pure.

export type LocalizedText = { id: string; en?: string }

/** The text in `locale`, or Indonesian when it hasn't been translated yet. */
export function pickText(text: LocalizedText, locale: Locale): { text: string; translated: boolean } {
  const value = text[locale]
  if (value) return { text: value, translated: true }
  return { text: text.id, translated: locale === DEFAULT_LOCALE }
}

/**
 * Shape for an assessment question, ready for both languages. Nothing uses it
 * yet: the questions themselves aren't written.
 */
export type LocalizedQuestion = {
  id: string
  prompt: LocalizedText
  options: { id: string; label: LocalizedText }[]
  explanation?: LocalizedText
}
