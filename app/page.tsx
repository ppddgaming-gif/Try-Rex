import { MarketingNav } from "@/components/landing/marketing-nav"
import { Hero } from "@/components/landing/hero"
import { StatsBanner } from "@/components/landing/stats-banner"
import { Surfaces } from "@/components/landing/surfaces"
import { FeatureRows } from "@/components/landing/feature-rows"
import { HowItWorks } from "@/components/landing/how-it-works"
import { Testimonials } from "@/components/landing/testimonials"
import { FinalCta } from "@/components/landing/final-cta"
import { SiteFooter } from "@/components/landing/site-footer"

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <MarketingNav />
      <main>
        <Hero />
        <StatsBanner />
        <Surfaces />
        <FeatureRows />
        <HowItWorks />
        <Testimonials />
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  )
}
