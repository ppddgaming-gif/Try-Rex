import { cache } from "react"
import { createClient } from "@/lib/supabase/server"

export type CurrentUser = { id: string; email: string | undefined; displayName: string }

/**
 * The signed-in user with their display name, or null for guests. Cached per
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

  const { data: profile } = await supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle()

  const displayName =
    profile?.display_name ??
    (typeof user.user_metadata?.display_name === "string" ? user.user_metadata.display_name : null) ??
    user.email?.split("@")[0] ??
    "Trader"

  return { id: user.id, email: user.email, displayName }
})

/** Cheap signed-in check for pages that only need to pick a button label. */
export async function isSignedIn() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  return Boolean(data?.claims)
}
