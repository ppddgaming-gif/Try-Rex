import { MarketingNav } from "@/components/landing/marketing-nav"
import { Hero } from "@/components/landing/hero"
import { StatsBanner } from "@/components/landing/stats-banner"
import { About } from "@/components/landing/about"
import { Surfaces } from "@/components/landing/surfaces"
import { FeatureRows } from "@/components/landing/feature-rows"
import { HowItWorks } from "@/components/landing/how-it-works"
import { Faq } from "@/components/landing/faq"
import { FinalCta } from "@/components/landing/final-cta"
import { SiteFooter } from "@/components/landing/site-footer"
import { PageTransition } from "@/components/page-transition"
import { isSignedIn } from "@/lib/auth"

// Reads the session cookie to choose "Masuk" or "Dashboard", so this page is
// rendered per request rather than prebuilt.
export default async function LandingPage() {
  const signedIn = await isSignedIn()

  return (
    <div className="min-h-screen">
      <MarketingNav signedIn={signedIn} />
      <PageTransition>
        <main>
          <Hero />
          <StatsBanner />
          <About />
          <Surfaces />
          <FeatureRows />
          <HowItWorks />
          <Faq />
          <FinalCta signedIn={signedIn} />
        </main>
      </PageTransition>
      <SiteFooter />
    </div>
  )
}
