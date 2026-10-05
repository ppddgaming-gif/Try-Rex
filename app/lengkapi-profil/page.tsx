import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { CompleteProfile } from "@/components/onboarding/complete-profile"
import { getCurrentUser } from "@/lib/auth"
import { safeNext } from "@/lib/auth-rules"
import { COMPLETE_PROFILE_PATH, isGatedPath } from "@/lib/profile-gate"

export const metadata: Metadata = { title: "Lengkapi profil" }

// "Complete your profile first": a username (plus name and an optional
// photo), then the /start quiz unless it's already answered. Full screen like
// /start, outside the app shell. The (app) layout sends incomplete profiles
// here with ?next=; a confirmed sign-up lands here directly.
export default async function CompleteProfilePage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams
  const asked = safeNext(next, "/dashboard")
  // Never come back here, or to a page that doesn't need it.
  const back = isGatedPath(asked) ? asked : "/dashboard"

  const user = await getCurrentUser()
  if (!user) redirect(`/login?next=${encodeURIComponent(`${COMPLETE_PROFILE_PATH}?next=${back}`)}`)
  // Already complete, or the database can't record it yet: nothing to do here.
  if (user.profileDone !== false) redirect(back)

  return (
    <CompleteProfile
      account={{
        id: user.id,
        displayName: user.displayName,
        username: user.username,
        avatarUrl: user.avatarUrl,
        profileExtras: user.profileExtras,
      }}
      needsQuiz={!user.onboarding}
      next={back}
    />
  )
}
