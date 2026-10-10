import { cookies } from "next/headers"
import { getRequestConfig } from "next-intl/server"
import { DEFAULT_LOCALE, LOCALE_COOKIE, NAMESPACES, isLocale, type Locale } from "@/lib/i18n/locale"

// next-intl's per-request config. The locale comes from the cookie the
// language switcher writes (lib/i18n/actions.ts), so URLs stay as they are.

async function loadMessages(locale: Locale) {
  const parts = await Promise.all(
    NAMESPACES.map(async (ns) => [ns, (await import(`../messages/${locale}/${ns}.json`)).default] as const),
  )
  return Object.fromEntries(parts)
}

export default getRequestConfig(async () => {
  const raw = (await cookies()).get(LOCALE_COOKIE)?.value
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE
  return {
    locale,
    messages: await loadMessages(locale),
    // Dates in the app are Jakarta dates unless a formatter says otherwise.
    timeZone: "Asia/Jakarta",
  }
})
