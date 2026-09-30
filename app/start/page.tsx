import type { Metadata } from "next"
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow"
import { getCurrentUser } from "@/lib/auth"
import { safeNext } from "@/lib/auth-rules"

export const metadata: Metadata = { title: "Mulai" }

// The onboarding quiz (build spec ticket 1.12). Open to guests: their answers
// stay on the device and move to the account when they sign up.
export default async function StartPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; ulang?: string }>
}) {
  const { next, ulang } = await searchParams
  const user = await getCurrentUser()

  return (
    <OnboardingFlow
      account={
        user
          ? {
              id: user.id,
              displayName: user.displayName,
              username: user.username,
              avatarUrl: user.avatarUrl,
              profileExtras: user.profileExtras,
            }
          : null
      }
      existing={user?.onboarding ?? null}
      redo={ulang === "1"}
      next={safeNext(next, "/trading-game")}
    />
  )
}
