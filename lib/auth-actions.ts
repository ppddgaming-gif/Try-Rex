"use server"

import { headers } from "next/headers"
import { getTranslations } from "next-intl/server"
import { redirect } from "next/navigation"
import { MIN_PASSWORD, authErrorKey, safeNext } from "@/lib/auth-rules"
import { writeLocaleCookie } from "@/lib/i18n/actions"
import { createClient } from "@/lib/supabase/server"

export type FormState = { error?: string; sent?: boolean; email?: string }

const text = (fd: FormData, key: string) => {
  const v = fd.get(key)
  return typeof v === "string" ? v.trim() : ""
}

/** Error lines in the player's language; tooShort needs the minimum. */
async function errors() {
  const t = await getTranslations("auth.errors")
  return (key: string) => t(key, { min: MIN_PASSWORD })
}

/** Absolute origin for links inside emails, taken from the incoming request. */
async function origin() {
  const h = await headers()
  const fromHeader = h.get("origin")
  if (fromHeader) return fromHeader
  const host = h.get("x-forwarded-host") ?? h.get("host")
  const proto = h.get("x-forwarded-proto") ?? "https"
  return `${proto}://${host}`
}

export async function login(_: FormState, fd: FormData): Promise<FormState> {
  const email = text(fd, "email")
  const password = fd.get("password")
  const e = await errors()
  if (!email || typeof password !== "string" || !password) {
    return { error: e("fillEmailPassword"), email }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: e(authErrorKey(error)), email }

  // The account's language follows the player to this device.
  const { data: profile } = await supabase.from("profiles").select("locale").eq("id", data.user.id).maybeSingle()
  if (profile?.locale) await writeLocaleCookie(profile.locale)

  redirect(safeNext(fd.get("next")))
}

export async function signup(_: FormState, fd: FormData): Promise<FormState> {
  const name = text(fd, "name")
  const email = text(fd, "email")
  const password = fd.get("password")
  const e = await errors()

  // The form already enforces these; repeat them because a form post can be
  // replayed without the browser.
  if (!name) return { error: e("fillName"), email }
  if (!email) return { error: e("fillEmail"), email }
  if (typeof password !== "string" || password.length < MIN_PASSWORD) {
    return { error: e("tooShort"), email }
  }
  if (fd.get("agree") !== "on") {
    return { error: e("mustAgree"), email }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Read by the handle_new_user trigger; the client never writes profiles.
      data: { display_name: name.slice(0, 60), privacy_accepted: true },
      emailRedirectTo: `${await origin()}/auth/callback?next=/dashboard`,
    },
  })
  if (error) return { error: e(authErrorKey(error)), email }

  // With email confirmation on, Supabase answers a signup for an existing
  // address with a fake user and no error, so accounts can't be enumerated.
  // An empty identities list is how that case shows up.
  if (data.user && data.user.identities?.length === 0) return { error: e("emailTaken"), email }

  return { sent: true, email }
}

export async function requestPasswordReset(_: FormState, fd: FormData): Promise<FormState> {
  const email = text(fd, "email")
  const e = await errors()
  if (!email) return { error: e("fillEmail") }

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${await origin()}/auth/callback?next=/reset-password`,
  })
  // Only surface rate limiting. Anything else would reveal whether the
  // address has an account.
  if (error && (error.status === 429 || error.code?.startsWith("over_"))) {
    return { error: e(authErrorKey(error)), email }
  }
  return { sent: true, email }
}

export async function updatePassword(_: FormState, fd: FormData): Promise<FormState> {
  const password = fd.get("password")
  const confirm = fd.get("confirm")
  const e = await errors()
  if (typeof password !== "string" || password.length < MIN_PASSWORD) {
    return { error: e("tooShort") }
  }
  if (password !== confirm) return { error: e("mismatch") }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: e("resetExpired") }

  const { error } = await supabase.auth.updateUser({ password })
  if (error) return { error: e(authErrorKey(error)) }

  redirect("/dashboard")
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/")
}
