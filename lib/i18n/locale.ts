// The two languages and how each formats. Pure and client-safe.
//
// Indonesian is the default. The choice lives in the NEXT_LOCALE cookie (the
// device) and, for signed-in players, in profiles.locale (the account); there
// is no locale segment in the URL.

export const LOCALES = ["id", "en"] as const
export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = "id"
export const LOCALE_COOKIE = "NEXT_LOCALE"

export const isLocale = (v: unknown): v is Locale => typeof v === "string" && (LOCALES as readonly string[]).includes(v)

/** BCP 47 tag for Intl formatters. */
export const INTL_LOCALE: Record<Locale, string> = { id: "id-ID", en: "en-US" }

/**
 * Message catalogue namespaces: one JSON file per namespace in
 * messages/<locale>/. The parity test checks this list against the folders.
 */
export const NAMESPACES = [
  "common",
  "nav",
  "auth",
  "settings",
  "dashboard",
  "progress",
  "game",
  "evaluation",
  "demo",
  "rex",
  "tips",
  "learn",
  "glossary",
  "onboarding",
  "landing",
  "legal",
] as const
