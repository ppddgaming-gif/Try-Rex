import type { AuthError } from "@supabase/supabase-js"

// Pure auth rules, safe to import from client and server alike. Anything that
// touches cookies or the server client lives in lib/auth.ts instead.

export const MIN_PASSWORD = 8

/**
 * Where to send someone after login. Only same-site paths are accepted: the
 * value must start with exactly one "/". "//evil.com" and "/\evil.com" are
 * protocol-relative to browsers, so both are rejected, as is anything else.
 */
export function safeNext(value: FormDataEntryValue | string | null | undefined, fallback = "/dashboard") {
  if (typeof value !== "string") return fallback
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback
  // Control characters (tab, newline) can be stripped by browsers to form "//".
  if (/[\u0000-\u001f\u007f]/.test(value)) return fallback
  return value
}

export const EMAIL_TAKEN = "Email ini sudah terdaftar. Coba masuk, atau reset password kalau lupa."
const TOO_MANY = "Terlalu banyak percobaan. Tunggu beberapa menit, lalu coba lagi."

/** Supabase auth errors as plain Indonesian. Unknown errors get a generic line. */
export function authErrorMessage(error: Pick<AuthError, "code" | "status" | "message">) {
  switch (error.code) {
    case "invalid_credentials":
      return "Email atau password salah."
    case "email_not_confirmed":
      return "Email kamu belum dikonfirmasi. Cek kotak masuk untuk link konfirmasi."
    case "user_already_exists":
    case "email_exists":
      return EMAIL_TAKEN
    case "weak_password":
      return `Password terlalu pendek. Minimal ${MIN_PASSWORD} karakter.`
    case "same_password":
      return "Password baru harus berbeda dari password lama."
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return TOO_MANY
    case "validation_failed":
      return "Format email tidak valid."
  }
  if (error.status === 429) return TOO_MANY
  return "Terjadi kesalahan. Coba lagi sebentar lagi."
}
