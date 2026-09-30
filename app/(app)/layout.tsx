import { AppNavMobile } from "@/components/app-nav-mobile"
import { PageTransition } from "@/components/page-transition"
import type { ProfileSummary } from "@/components/profile-card"
import { LevelUpToast } from "@/components/progress/level-up-toast"
import { ProgressAccount } from "@/components/progress/progress-account"
import { Sidebar } from "@/components/sidebar"
import { getCurrentUser } from "@/lib/auth"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Null for guests: /trading-game and /ai-evaluation are open without an
  // account, and the profile card then shows "Tamu" with sign-in buttons.
  const user = await getCurrentUser()
  const profile: ProfileSummary | null = user
    ? { name: user.displayName, username: user.username, avatarUrl: user.avatarUrl }
    : null

  return (
    <div className="flex min-h-screen">
      <Sidebar profile={profile} />
      <main className="flex-1 min-w-0 lg:ml-64">
        <AppNavMobile profile={profile} />
        <PageTransition>{children}</PageTransition>
      </main>
      <LevelUpToast />
      <ProgressAccount userId={user?.id ?? null} />
    </div>
  )
}
