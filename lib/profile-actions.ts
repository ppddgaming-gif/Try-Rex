"use server"

import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { MIN_PASSWORD, authErrorMessage } from "@/lib/auth-rules"
import { parseRecord } from "@/lib/onboarding"
import { profileComplete } from "@/lib/profile-gate"
import { USERNAME_RULE, normalizeUsername } from "@/lib/profile-rules"
import { createClient } from "@/lib/supabase/server"

export type ProfileFormState = { error?: string; ok?: boolean; sent?: boolean; email?: string }

const NOT_READY = "Fitur ini belum aktif di server. Coba lagi nanti."

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

/**
 * Name and username. The username may be left empty until the profile is
 * complete; from then on the database refuses an empty one
 * (profiles_completed_is_complete), and /lengkapi-profil asks for it up front.
 */
export async function updateProfile(_: ProfileFormState, fd: FormData): Promise<ProfileFormState> {
  const name = text(fd, "name")
  const username = normalizeUsername(text(fd, "username"))

  if (!name) return { error: "Isi nama tampilanmu." }
  if (name.length > 60) return { error: "Nama maksimal 60 karakter." }
  if (!username && fd.get("require_username") === "1") return { error: USERNAME_NEEDED }
  if (username && !USERNAME_RULE.test(username)) {
    return { error: "Username 3–20 karakter: huruf kecil, angka, atau garis bawah (_)." }
  }

  const { supabase, user } = await signedIn()
  if (!user) return { error: "Sesi berakhir. Masuk lagi." }

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: name, username: username || null })
    .eq("id", user.id)
  if (error) {
    if (error.code === "23505") return { error: "Username itu sudah dipakai. Coba yang lain." }
    if (error.code === "23514") return { error: USERNAME_NEEDED }
    if (missingColumn(error.code)) return { error: NOT_READY }
    return { error: "Gagal menyimpan. Coba lagi sebentar lagi." }
  }

  revalidatePath("/", "layout")
  return { ok: true }
}

const USERNAME_NEEDED = "Isi username. Username tampil di profilmu dan tidak bisa dikosongkan."

/**
 * Records that the profile is complete, after checking it here: a username
 * and the quiz answered or skipped. The database checks the same thing.
 */
export async function completeProfile(): Promise<{ ok: boolean; error?: string }> {
  const { supabase, user } = await signedIn()
  if (!user) return { ok: false, error: "Sesi berakhir. Masuk lagi." }

  const { data, error } = await supabase
    .from("profiles")
    .select("username, onboarding, profile_completed_at")
    .eq("id", user.id)
    .maybeSingle()
  if (error || !data) return { ok: false, error: missingColumn(error?.code) ? NOT_READY : "Gagal memuat profil. Coba lagi." }
  if (!profileComplete({ username: data.username, onboarding: parseRecord(data.onboarding) })) {
    return { ok: false, error: data.username ? "Jawab atau lewati kuisnya dulu." : USERNAME_NEEDED }
  }
  if (data.profile_completed_at) return { ok: true }

  const { error: saveError } = await supabase
    .from("profiles")
    .update({ profile_completed_at: new Date().toISOString() })
    .eq("id", user.id)
  if (saveError) return { ok: false, error: "Gagal menyimpan. Coba lagi sebentar lagi." }

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
  if (!user) return { error: "Sesi berakhir. Masuk lagi." }
  if (path !== null && (!path.startsWith(`${user.id}/`) || path.length > 200 || path.includes(".."))) {
    return { error: "Foto tidak valid." }
  }

  const { data: before } = await supabase.from("profiles").select("avatar_path").eq("id", user.id).maybeSingle()
  const { error } = await supabase.from("profiles").update({ avatar_path: path }).eq("id", user.id)
  if (error) return { error: missingColumn(error.code) ? NOT_READY : "Gagal menyimpan foto." }

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
  if (!email || !email.includes("@")) return { error: "Isi email baru yang valid.", email }

  const { supabase, user } = await signedIn()
  if (!user) return { error: "Sesi berakhir. Masuk lagi." }
  if (email === user.email?.toLowerCase()) return { error: "Itu sudah email akunmu.", email }

  const { error } = await supabase.auth.updateUser(
    { email },
    { emailRedirectTo: `${await origin()}/auth/callback?next=/pengaturan%23keamanan` },
  )
  if (error) return { error: authErrorMessage(error), email }
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
  if (typeof current !== "string" || !current) return { error: "Isi password lamamu." }
  if (typeof password !== "string" || password.length < MIN_PASSWORD) {
    return { error: `Password baru terlalu pendek. Minimal ${MIN_PASSWORD} karakter.` }
  }
  if (password !== confirm) return { error: "Kedua password baru tidak sama." }

  const { supabase, user } = await signedIn()
  if (!user?.email) return { error: "Sesi berakhir. Masuk lagi." }

  const check = await supabase.auth.signInWithPassword({ email: user.email, password: current })
  if (check.error) return { error: "Password lama salah." }

  const { error } = await supabase.auth.updateUser({ password })
  if (error) return { error: authErrorMessage(error) }
  return { ok: true }
}
