"use server"

import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { getTranslations } from "next-intl/server"
import { MIN_PASSWORD, authErrorKey } from "@/lib/auth-rules"
import { parseRecord } from "@/lib/onboarding"
import { USERNAME_RULE, normalizeUsername } from "@/lib/profile-rules"
import { createClient } from "@/lib/supabase/server"

export type ProfileFormState = { error?: string; ok?: boolean; sent?: boolean; email?: string }

/** Error lines in the player's language (settings.errors, and auth.errors for Supabase's). */
async function errors() {
  const [t, auth] = await Promise.all([getTranslations("settings.errors"), getTranslations("auth.errors")])
  return Object.assign((key: string) => t(key, { min: MIN_PASSWORD }), {
    auth: (error: Parameters<typeof authErrorKey>[0]) => auth(authErrorKey(error), { min: MIN_PASSWORD }),
  })
}

const text = (fd: FormData, key: string) => {
  const v = fd.get(key)
  return typeof v === "string" ? v.trim() : ""
}

async function signedIn() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return { supabase, user }
}

/** Postgres "undefined column": the customisation migration hasn't run. */
const missingColumn = (code: string | undefined) => code === "42703" || code === "PGRST204"

/**
 * Saves the /start answers to the account. The record is re-validated here,
 * so only known questions and options are ever stored.
 */
export async function saveOnboarding(input: unknown): Promise<{ ok: boolean }> {
  const record = parseRecord(input)
  if (!record) return { ok: false }
  const { supabase, user } = await signedIn()
  if (!user) return { ok: false }
  const { error } = await supabase.from("profiles").update({ onboarding: record, track: "forex" }).eq("id", user.id)
  if (error) return { ok: false }
  revalidatePath("/", "layout")
  return { ok: true }
}

/** Name and username. Either may be left unchanged. */
export async function updateProfile(_: ProfileFormState, fd: FormData): Promise<ProfileFormState> {
  const name = text(fd, "name")
  const username = normalizeUsername(text(fd, "username"))
  const e = await errors()

  if (!name) return { error: e("fillName") }
  if (name.length > 60) return { error: e("nameTooLong") }
  if (username && !USERNAME_RULE.test(username)) {
    return { error: e("usernameRule") }
  }

  const { supabase, user } = await signedIn()
  if (!user) return { error: e("sessionEnded") }

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: name, username: username || null })
    .eq("id", user.id)
  if (error) {
    if (error.code === "23505") return { error: e("usernameTaken") }
    if (missingColumn(error.code)) return { error: e("notReady") }
    return { error: e("saveFailed") }
  }

  revalidatePath("/", "layout")
  return { ok: true }
}

/** Live check for the username field. true = free (or already yours). */
export async function checkUsername(candidate: string): Promise<boolean | null> {
  const username = normalizeUsername(candidate)
  if (!USERNAME_RULE.test(username)) return null
  const { supabase, user } = await signedIn()
  if (!user) return null
  const { data, error } = await supabase.rpc("username_available", { candidate: username })
  if (error) return null
  return data === true
}

/**
 * Points the profile at a freshly uploaded photo (or clears it) and deletes
 * the previous file. The upload itself goes straight from the browser to
 * Storage, where policies keep each player inside their own folder.
 */
export async function setAvatar(path: string | null): Promise<{ error?: string }> {
  const { supabase, user } = await signedIn()
  const e = await errors()
  if (!user) return { error: e("sessionEnded") }
  if (path !== null && (!path.startsWith(`${user.id}/`) || path.length > 200 || path.includes(".."))) {
    return { error: e("invalidPhoto") }
  }

  const { data: before } = await supabase.from("profiles").select("avatar_path").eq("id", user.id).maybeSingle()
  const { error } = await supabase.from("profiles").update({ avatar_path: path }).eq("id", user.id)
  if (error) return { error: missingColumn(error.code) ? e("notReady") : e("photoSaveFailed") }

  const old = before?.avatar_path
  if (old && old !== path) await supabase.storage.from("avatars").remove([old])

  revalidatePath("/", "layout")
  return {}
}

async function origin() {
  const h = await headers()
  const fromHeader = h.get("origin")
  if (fromHeader) return fromHeader
  const host = h.get("x-forwarded-host") ?? h.get("host")
  const proto = h.get("x-forwarded-proto") ?? "https"
  return `${proto}://${host}`
}

/**
 * Starts an email change. Supabase sends a confirmation link to the new
 * address (and, with secure email change on, to the old one too); the address
 * only changes once it is confirmed.
 */
export async function changeEmail(_: ProfileFormState, fd: FormData): Promise<ProfileFormState> {
  const email = text(fd, "email").toLowerCase()
  const e = await errors()
  if (!email || !email.includes("@")) return { error: e("invalidEmail"), email }

  const { supabase, user } = await signedIn()
  if (!user) return { error: e("sessionEnded") }
  if (email === user.email?.toLowerCase()) return { error: e("sameEmail"), email }

  const { error } = await supabase.auth.updateUser(
    { email },
    { emailRedirectTo: `${await origin()}/auth/callback?next=/pengaturan%23keamanan` },
  )
  if (error) return { error: e.auth(error), email }
  return { sent: true, email }
}

/**
 * Changes the password after checking the current one, so an unattended
 * signed-in browser can't be used to lock the owner out.
 */
export async function changePassword(_: ProfileFormState, fd: FormData): Promise<ProfileFormState> {
  const current = fd.get("current")
  const password = fd.get("password")
  const confirm = fd.get("confirm")
  const e = await errors()
  if (typeof current !== "string" || !current) return { error: e("fillCurrent") }
  if (typeof password !== "string" || password.length < MIN_PASSWORD) {
    return { error: e("newTooShort") }
  }
  if (password !== confirm) return { error: e("newMismatch") }

  const { supabase, user } = await signedIn()
  if (!user?.email) return { error: e("sessionEnded") }

  const check = await supabase.auth.signInWithPassword({ email: user.email, password: current })
  if (check.error) return { error: e("wrongCurrent") }

  const { error } = await supabase.auth.updateUser({ password })
  if (error) return { error: e.auth(error) }
  return { ok: true }
}
