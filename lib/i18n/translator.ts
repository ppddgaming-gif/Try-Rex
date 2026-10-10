// The translate function pure modules take as a parameter, so they can say
// things in either language without importing a catalogue. Components pass
// next-intl's `t` (useTranslations / getTranslations, scoped to a namespace);
// tests build one with createTranslator. Pure.

export type TValues = Record<string, string | number>
export type T = (key: string, values?: TValues) => string

/**
 * A message not yet put into words: a catalogue key and its values. Pure
 * modules return these (refusals, order problems) so the words can be chosen
 * at the edge, in the reader's language.
 */
export type Msg = { key: string; values?: TValues }

export const msg = (key: string, values?: TValues): Msg => (values ? { key, values } : { key })

/** A Msg in words. */
export const say = (t: T, m: Msg) => t(m.key, m.values)

/**
 * "a", "a dan b", "a, b, dan c" (or the English equivalent). `t` is the root
 * translator: the patterns are common.list.two and common.list.many.
 */
export function joinList(items: string[], t: T) {
  if (items.length <= 1) return items.join("")
  if (items.length === 2) return t("common.list.two", { a: items[0], b: items[1] })
  return t("common.list.many", { head: items.slice(0, -1).join(", "), last: items[items.length - 1] })
}
