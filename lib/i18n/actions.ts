"use server"

import { cookies } from "next/headers"
import { LOCALE_COOKIE, isLocale } from "@/lib/i18n/locale"
import { createClient } from "@/lib/supabase/server"

const ONE_YEAR = 60 * 60 * 24 * 365

/** Writes the language cookie on this device. */
export async function writeLocaleCookie(locale: string) {
  if (!isLocale(locale)) return
  ;(await cookies()).set(LOCALE_COOKIE, locale, { path: "/", maxAge: ONE_YEAR, sameSite: "lax" })
}

/**
 * The language switcher. Always saved on the device; for a signed-in player
 * also in profiles.locale (through their own session, so RLS applies), which
 * login reads back on other devices. A failed profile write is not an error:
 * the device still switches.
 */
export async function setLocale(locale: string) {
  if (!isLocale(locale)) return
  await writeLocaleCookie(locale)

  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const uid = data?.claims?.sub
  if (typeof uid === "string") {
    await supabase.from("profiles").update({ locale }).eq("id", uid)
  }
}
