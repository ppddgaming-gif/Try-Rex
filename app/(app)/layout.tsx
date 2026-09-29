import { AppNavMobile } from "@/components/app-nav-mobile"
import { PageTransition } from "@/components/page-transition"
import { LevelUpToast } from "@/components/progress/level-up-toast"
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
  const userName = user?.displayName ?? null

  return (
    <div className="flex min-h-screen">
      <Sidebar userName={userName} />
      <main className="flex-1 min-w-0 lg:ml-64">
        <AppNavMobile userName={userName} />
        <PageTransition>{children}</PageTransition>
      </main>
      <LevelUpToast />
    </div>
  )
}
