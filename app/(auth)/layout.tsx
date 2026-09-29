import { BrandMark } from "@/components/brand-mark"
import { Card } from "@/components/card"
import { PageTransition } from "@/components/page-transition"

// Login, signup and password reset: one centred card, no app sidebar.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-dvh flex-col items-center px-4 py-10 sm:justify-center">
      <div className="mb-8">
        <BrandMark size="lg" />
      </div>
      <Card className="w-full max-w-md sm:p-8">
        <PageTransition>{children}</PageTransition>
      </Card>
    </main>
  )
}
