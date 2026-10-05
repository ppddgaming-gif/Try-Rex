import { cache } from "react"
import { parseRecord, type OnboardingRecord } from "@/lib/onboarding"
import { createClient } from "@/lib/supabase/server"
import { parseSeen, type TourId } from "@/lib/tours"

export type CurrentUser = {
  id: string
  email: string | undefined
  displayName: string
  /** null until the player picks one on /lengkapi-profil or /pengaturan. */
  username: string | null
  /** Public URL of the uploaded photo, or null (the UI shows initials). */
  avatarUrl: string | null
  /** The /start answers, or null when the player hasn't done the quiz yet. */
  onboarding: OnboardingRecord | null
  /**
   * False when the username/avatar columns don't exist yet (the
   * _profile_customization migration hasn't run). The account page then
   * explains instead of offering fields that can't be saved.
   */
  profileExtras: boolean
  /**
   * profiles.profile_completed_at is set. null when the column doesn't exist
   * yet (the _onboarding_tour migration hasn't run): nobody is gated then.
   */
  profileDone: boolean | null
  /** Tours already shown on this account; null when the column doesn't exist yet. */
  toursSeen: TourId[] | null
}

type ProfileRow = {
  display_name: string | null
  onboarding: unknown
  username?: string | null
  avatar_path?: string | null
  profile_completed_at?: string | null
  tours_seen?: unknown
}

// Newest columns first. Each step back drops the columns a later migration
// added, so the app keeps working on a database that is one migration behind.
const SELECTS = [
  "display_name, onboarding, username, avatar_path, profile_completed_at, tours_seen",
  "display_name, onboarding, username, avatar_path",
  "display_name, onboarding",
]

/**
 * The signed-in user with their profile, or null for guests. Cached per
 * request so the layout and the page share one lookup.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createClient()
  // getUser() revalidates the token with Supabase; never trust a cookie alone
  // for anything the server renders.
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  let profile: ProfileRow | null = null
  let level = 0
  for (; level < SELECTS.length; level++) {
    const res = await supabase.from("profiles").select(SELECTS[level]).eq("id", user.id).maybeSingle()
    if (!res.error) {
      profile = res.data as ProfileRow | null
      break
    }
  }
  const tourColumns = level === 0
  const profileExtras = level <= 1

  const displayName =
    profile?.display_name ??
    (typeof user.user_metadata?.display_name === "string" ? user.user_metadata.display_name : null) ??
    user.email?.split("@")[0] ??
    "Trader"

  const avatarPath = profile?.avatar_path ?? null
  const avatarUrl = avatarPath ? supabase.storage.from("avatars").getPublicUrl(avatarPath).data.publicUrl : null

  return {
    id: user.id,
    email: user.email,
    displayName,
    username: profile?.username ?? null,
    avatarUrl,
    onboarding: parseRecord(profile?.onboarding),
    profileExtras,
    profileDone: tourColumns && profile ? Boolean(profile.profile_completed_at) : null,
    toursSeen: tourColumns && profile ? parseSeen(profile.tours_seen) : null,
  }
})
