import { NextResponse, type NextRequest } from "next/server"
import type { EmailOtpType } from "@supabase/supabase-js"
import { safeNext } from "@/lib/auth-rules"
import { LOCALE_COOKIE, isLocale } from "@/lib/i18n/locale"
import { createClient } from "@/lib/supabase/server"

/**
 * Landing point for links in Supabase emails: signup confirmation and
 * password reset. Exchanges the one-time code for a session cookie, then
 * sends the user on to `next`, which is checked so it can't leave the site.
 *
 * Handles both link formats: `?code=` (the default PKCE flow, which only works
 * in the browser that requested the email) and `?token_hash=&type=` (custom
 * email templates, which work in any browser).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const next = safeNext(searchParams.get("next"))
  const code = searchParams.get("code")
  const tokenHash = searchParams.get("token_hash")
  const type = searchParams.get("type") as EmailOtpType | null

  const supabase = await createClient()

  let userId: string | undefined
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) userId = data.user?.id
  } else if (tokenHash && type) {
    const { data, error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
    if (!error) userId = data.user?.id ?? undefined
  }

  if (userId) {
    // The language chosen on this device (as a guest, before signing up)
    // becomes the account's. Best effort: a failed write still signs them in.
    const locale = request.cookies.get(LOCALE_COOKIE)?.value
    if (isLocale(locale)) await supabase.from("profiles").update({ locale }).eq("id", userId)
    return NextResponse.redirect(`${origin}${next}`)
  }

  // Expired, already used, or opened in a different browser.
  return NextResponse.redirect(`${origin}/login?error=link`)
}
