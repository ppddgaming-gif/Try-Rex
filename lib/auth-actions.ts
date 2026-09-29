"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { EMAIL_TAKEN, MIN_PASSWORD, authErrorMessage, safeNext } from "@/lib/auth-rules"
import { createClient } from "@/lib/supabase/server"

export type FormState = { error?: string; sent?: boolean; email?: string }

const text = (fd: FormData, key: string) => {
  const v = fd.get(key)
  return typeof v === "string" ? v.trim() : ""
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
  if (!email || typeof password !== "string" || !password) {
    return { error: "Isi email dan password.", email }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: authErrorMessage(error), email }

  redirect(safeNext(fd.get("next")))
}

export async function signup(_: FormState, fd: FormData): Promise<FormState> {
  const name = text(fd, "name")
  const email = text(fd, "email")
  const password = fd.get("password")

  // The form already enforces these; repeat them because a form post can be
  // replayed without the browser.
  if (!name) return { error: "Isi nama kamu.", email }
  if (!email) return { error: "Isi email kamu.", email }
  if (typeof password !== "string" || password.length < MIN_PASSWORD) {
    return { error: `Password terlalu pendek. Minimal ${MIN_PASSWORD} karakter.`, email }
  }
  if (fd.get("agree") !== "on") {
    return { error: "Kamu perlu menyetujui Kebijakan Privasi dan Syarat & Ketentuan.", email }
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
  if (error) return { error: authErrorMessage(error), email }

  // With email confirmation on, Supabase answers a signup for an existing
  // address with a fake user and no error, so accounts can't be enumerated.
  // An empty identities list is how that case shows up.
  if (data.user && data.user.identities?.length === 0) return { error: EMAIL_TAKEN, email }

  return { sent: true, email }
}

export async function requestPasswordReset(_: FormState, fd: FormData): Promise<FormState> {
  const email = text(fd, "email")
  if (!email) return { error: "Isi email kamu." }

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${await origin()}/auth/callback?next=/reset-password`,
  })
  // Only surface rate limiting. Anything else would reveal whether the
  // address has an account.
  if (error && (error.status === 429 || error.code?.startsWith("over_"))) {
    return { error: authErrorMessage(error), email }
  }
  return { sent: true, email }
}

export async function updatePassword(_: FormState, fd: FormData): Promise<FormState> {
  const password = fd.get("password")
  const confirm = fd.get("confirm")
  if (typeof password !== "string" || password.length < MIN_PASSWORD) {
    return { error: `Password terlalu pendek. Minimal ${MIN_PASSWORD} karakter.` }
  }
  if (password !== confirm) return { error: "Kedua password tidak sama." }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Link reset sudah kedaluwarsa. Minta link baru." }

  const { error } = await supabase.auth.updateUser({ password })
  if (error) return { error: authErrorMessage(error) }

  redirect("/dashboard")
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/")
}
