import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { DailyChallenge } from "@/components/dashboard/daily-challenge"
import { DashboardView } from "@/components/dashboard/dashboard-view"
import { getCurrentUser } from "@/lib/auth"
import { challenges } from "@/lib/mock-data"

export const metadata: Metadata = { title: "Dashboard" }

/**
 * Today's challenge rotates through the real datasets once a day, on Jakarta
 * time. Server-only, so the date never reaches client code and can't cause a
 * hydration mismatch.
 */
function dailyChallenge() {
  const [y, m, d] = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" })
    .format(new Date())
    .split("-")
    .map(Number)
  const day = Math.floor(Date.UTC(y, m - 1, d) / 86_400_000)
  return challenges[day % challenges.length]
}

export default async function DashboardPage() {
  // proxy.ts already sends guests to /login; this is the backstop in case the
  // proxy matcher ever stops covering this route.
  const user = await getCurrentUser()
  if (!user) redirect("/login?next=/dashboard")

  // Progress lives in the browser, so the view is a client component. The
  // daily challenge (a server-rendered chart) is handed in as a slot.
  return <DashboardView name={user.displayName} dailyChallenge={<DailyChallenge challenge={dailyChallenge()} />} />
}
