import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { AppNavMobile } from "@/components/app-nav-mobile"
import { PageTransition } from "@/components/page-transition"
import type { ProfileSummary } from "@/components/profile-card"
import { LevelUpToast } from "@/components/progress/level-up-toast"
import { ProgressAccount } from "@/components/progress/progress-account"
import { Sidebar } from "@/components/sidebar"
import { TourProvider } from "@/components/tour/tour-provider"
import { getCurrentUser } from "@/lib/auth"
import { getAccess } from "@/lib/demo/server"
import { PATH_HEADER, profileGate } from "@/lib/profile-gate"
import type { NavLocks } from "@/components/nav-links"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Null for guests: /trading-game and /ai-evaluation are open without an
  // account, and the profile card then shows "Tamu" with sign-in buttons.
  const user = await getCurrentUser()

  // Complete your profile first: a signed-in player without a username or
  // quiz answers goes to /lengkapi-profil and comes back afterwards. Guests
  // are never sent there. The proxy passes the requested page in a header,
  // since a layout can't read its URL.
  const gate = profileGate(user, (await headers()).get(PATH_HEADER))
  if (gate) redirect(gate)

  const profile: ProfileSummary | null = user
    ? { name: user.displayName, username: user.username, avatarUrl: user.avatarUrl }
    : null

  // Akun Latihan opens after the Trading Game sessions; the sidebar says how
  // far along the player is. Counted on the server.
  const access = user ? await getAccess(user.id) : null
  const locks: NavLocks = {
    "/akun-latihan": !user ? "Masuk untuk membuka" : access && !access.open ? (access.unlock.hint ?? undefined) : undefined,
  }

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
