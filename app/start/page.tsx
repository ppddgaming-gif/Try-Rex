import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow"
import { getCurrentUser } from "@/lib/auth"
import { safeNext } from "@/lib/auth-rules"
import { COMPLETE_PROFILE_PATH } from "@/lib/profile-gate"

export const metadata: Metadata = { title: "Mulai" }

// The onboarding quiz (build spec ticket 1.12). Open to guests: their answers
// stay on the device and move to the account when they sign up. A signed-in
// player who hasn't finished their profile does the quiz on /lengkapi-profil
// instead; everyone else comes here to retake it (?ulang=1).
export default async function StartPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; ulang?: string }>
}) {
  const { next, ulang } = await searchParams
  const user = await getCurrentUser()
  const back = safeNext(next, "/trading-game")
  if (user?.profileDone === false) redirect(`${COMPLETE_PROFILE_PATH}?next=${encodeURIComponent(back)}`)

  return <OnboardingFlow signedIn={Boolean(user)} existing={user?.onboarding ?? null} redo={ulang === "1"} next={back} />
}
