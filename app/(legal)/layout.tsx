import { MarketingNav } from "@/components/landing/marketing-nav"
import { SiteFooter } from "@/components/landing/site-footer"
import { PageTransition } from "@/components/page-transition"
import { isSignedIn } from "@/lib/auth"

// /privacy, /terms and /disclaimer share the landing page's nav and footer.
export default async function LegalLayout({ children }: { children: React.ReactNode }) {
  const signedIn = await isSignedIn()

  return (
    <div className="min-h-screen">
      <MarketingNav signedIn={signedIn} />
      <main>
        <PageTransition>{children}</PageTransition>
      </main>
      <SiteFooter />
    </div>
  )
}
