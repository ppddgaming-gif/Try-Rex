import { MarketingNav } from "@/components/landing/marketing-nav"
import { Hero } from "@/components/landing/hero"
import { StatsBanner } from "@/components/landing/stats-banner"
import { Surfaces } from "@/components/landing/surfaces"
import { FeatureRows } from "@/components/landing/feature-rows"
import { HowItWorks } from "@/components/landing/how-it-works"
import { FinalCta } from "@/components/landing/final-cta"
import { SiteFooter } from "@/components/landing/site-footer"
import { PageTransition } from "@/components/page-transition"
import { getCurrentUser } from "@/lib/auth"

// Reads the session to choose Masuk/Daftar or Dashboard plus the player's
// avatar, so this page is rendered per request rather than prebuilt. Guests
// cost no database call; a signed-in visitor costs one profile read.
export default async function LandingPage() {
  const user = await getCurrentUser()
  const signedIn = Boolean(user)

  return (
    <div className="min-h-screen">
      <MarketingNav profile={user ? { name: user.displayName, avatarUrl: user.avatarUrl } : null} />
      <PageTransition>
        <main>
          <Hero signedIn={signedIn} />
          <StatsBanner />
          <Surfaces />
          <FeatureRows />
          <HowItWorks />
          <FinalCta signedIn={signedIn} />
        </main>
      </PageTransition>
      <SiteFooter />
    </div>
  )
}
