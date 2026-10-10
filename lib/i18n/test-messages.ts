import { readFileSync } from "node:fs"
import { join } from "node:path"
import { createTranslator } from "next-intl"
import { NAMESPACES, type Locale } from "@/lib/i18n/locale"
import type { T } from "@/lib/i18n/translator"

// For tests only: the catalogues read from disk, and a `t` scoped to one
// namespace, the same shape components hand to pure modules.

export type Catalogue = Record<string, unknown>

export function loadCatalogue(locale: Locale): Catalogue {
  const root = join(process.cwd(), "messages", locale)
  return Object.fromEntries(NAMESPACES.map((ns) => [ns, JSON.parse(readFileSync(join(root, `${ns}.json`), "utf8"))]))
}

/** `namespace` omitted: the root, where keys are full paths ("rex.comments.revenge"). */
export function translator(locale: Locale, namespace?: string): T {
  const t = createTranslator({ locale, messages: loadCatalogue(locale), namespace })
  return (key, values) => (t as unknown as T)(key, values)
}
