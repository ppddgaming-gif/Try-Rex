import { AppNavMobile } from "@/components/app-nav-mobile"
import { PageTransition } from "@/components/page-transition"
import type { ProfileSummary } from "@/components/profile-card"
import { LevelUpToast } from "@/components/progress/level-up-toast"
import { ProgressAccount } from "@/components/progress/progress-account"
import { Sidebar } from "@/components/sidebar"
import { TourProvider } from "@/components/tour/tour-provider"
import { getTranslations } from "next-intl/server"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getAccess } from "@/lib/demo/server"
import type { NavLocks } from "@/components/nav-links"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Null for guests: /trading-game and /ai-evaluation are open without an
  // account, and the profile card then shows "Tamu" with sign-in buttons.
  const user = await getCurrentUser()
  // A Google or GitHub account agrees to the privacy policy first.
  if (user && !user.consented) redirect("/persetujuan")
  const profile: ProfileSummary | null = user
    ? { name: user.displayName, username: user.username, avatarUrl: user.avatarUrl }
    : null

  // Akun Latihan opens after the Trading Game sessions; the sidebar says how
  // far along the player is. Counted on the server.
  const access = user ? await getAccess(user.id) : null
  const [tNav, tDemo] = await Promise.all([getTranslations("nav"), getTranslations("demo")])
  const locks: NavLocks = {
    "/akun-latihan": !user
      ? tNav("signInToOpen")
      : access && !access.open
        ? tDemo("unlock.hint", { needed: access.unlock.needed, sessions: access.unlock.sessions })
        : undefined,
  }

  // Guided tours: a page's tour the first time it opens, the welcome tour
  // first for accounts, and the "?" button (components/tour/).
  return (
    <TourProvider
      signedIn={Boolean(user)}
      serverSeen={user?.toursSeen ?? null}
      context={{
        name: user?.displayName ?? null,
        unlock: access ? { sessions: access.unlock.sessions, needed: access.unlock.needed, open: access.open } : null,
      }}
    >
      <div className="flex min-h-screen">
        <Sidebar profile={profile} locks={locks} />
        <main className="app-main flex-1 min-w-0">
          <AppNavMobile profile={profile} locks={locks} />
          <PageTransition>{children}</PageTransition>
        </main>
        <LevelUpToast />
        <ProgressAccount userId={user?.id ?? null} />
      </div>
    </TourProvider>
  )
}
