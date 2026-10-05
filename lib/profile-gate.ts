import { safeNext } from "@/lib/auth-rules"

// "Complete your profile first". Pure: the (app) layout calls profileGate()
// with the signed-in player and the page they asked for. Complete means a
// username plus the /start quiz answered or skipped, recorded once in
// profiles.profile_completed_at; the flag is read, never guessed from
// empty fields.

export const COMPLETE_PROFILE_PATH = "/lengkapi-profil"

/** Request header the proxy sets to the page asked for (path and query). */
export const PATH_HEADER = "x-tryrex-path"

/** Pages that never send a player to /lengkapi-profil, whatever their profile. */
const NEVER_GATED = [
  COMPLETE_PROFILE_PATH,
  "/login",
  "/signup",
  "/lupa-password",
  "/reset-password",
  "/auth",
  "/privacy",
  "/terms",
  "/disclaimer",
  "/start",
]

const under = (path: string, base: string) => path === base || path.startsWith(base + "/") || path.startsWith(base + "?")

export function isGatedPath(path: string) {
  const p = safeNext(path, "/")
  if (p === "/" || p.startsWith("/?") || p.startsWith("/#")) return false
  return !NEVER_GATED.some((base) => under(p, base))
}

/**
 * Where to send this player instead of `path`, or null to let them through.
 * `profileDone` is null when the flag can't be read (the migration hasn't
 * run), and then nobody is held up.
 */
export function profileGate(user: { profileDone: boolean | null } | null, path: string | null): string | null {
  if (!user || user.profileDone !== false) return null
  const next = safeNext(path, "/dashboard")
  if (!isGatedPath(next)) return null
  return `${COMPLETE_PROFILE_PATH}?next=${encodeURIComponent(next)}`
}

/** What the done flag needs: a username and the quiz answered or skipped. */
export const profileComplete = (p: { username: string | null; onboarding: unknown }) =>
  Boolean(p.username) && p.onboarding !== null && p.onboarding !== undefined
