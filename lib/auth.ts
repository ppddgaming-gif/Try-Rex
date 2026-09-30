import { cache } from "react"
import { parseRecord, type OnboardingRecord } from "@/lib/onboarding"
import { createClient } from "@/lib/supabase/server"

export type CurrentUser = {
  id: string
  email: string | undefined
  displayName: string
  /** null until the player picks one on /start or /akun. */
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
}

type ProfileRow = {
  display_name: string | null
  onboarding: unknown
  username?: string | null
  avatar_path?: string | null
}

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

  // Ask for the customisation columns, and fall back to the original ones if
  // the migration that adds them hasn't been applied yet.
  let profile: ProfileRow | null = null
  let profileExtras = true
  const full = await supabase
    .from("profiles")
    .select("display_name, onboarding, username, avatar_path")
    .eq("id", user.id)
    .maybeSingle()
  if (full.error) {
    profileExtras = false
    const basic = await supabase.from("profiles").select("display_name, onboarding").eq("id", user.id).maybeSingle()
    profile = basic.data
  } else {
    profile = full.data
  }

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
  }
})

/** Cheap signed-in check for pages that only need to pick a button label. */
export async function isSignedIn() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  return Boolean(data?.claims)
}
