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

/** Message keys under auth.errors (messages/<locale>/auth.json). */
export type AuthErrorKey =
  | "invalidCredentials"
  | "emailNotConfirmed"
  | "emailTaken"
  | "tooShort"
  | "samePassword"
  | "tooMany"
  | "invalidEmail"
  | "generic"

/** Supabase auth errors as a message key. Unknown errors get the generic line. */
export function authErrorKey(error: Pick<AuthError, "code" | "status" | "message">): AuthErrorKey {
  switch (error.code) {
    case "invalid_credentials":
      return "invalidCredentials"
    case "email_not_confirmed":
      return "emailNotConfirmed"
    case "user_already_exists":
    case "email_exists":
      return "emailTaken"
    case "weak_password":
      return "tooShort"
    case "same_password":
      return "samePassword"
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return "tooMany"
    case "validation_failed":
      return "invalidEmail"
  }
  if (error.status === 429) return "tooMany"
  return "generic"
}
