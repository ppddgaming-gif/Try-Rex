// Pure profile rules, safe for client and server. The database enforces the
// same pattern (profiles_username_format), so the two can't disagree.

export const USERNAME_RULE = /^[a-z0-9_]{3,20}$/

/** Lowercase, no leading "@", no spaces. */
export const normalizeUsername = (value: string) => value.trim().replace(/^@/, "").toLowerCase()

/** "Budi Santoso" -> "BS", for the avatar fallback. */
export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  const first = parts[0][0] ?? ""
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? "") : ""
  return (first + last).toUpperCase()
}
