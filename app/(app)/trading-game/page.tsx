import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { TradingGame } from "@/components/trading-game/trading-game"
import { getCurrentUser } from "@/lib/auth"

export const metadata: Metadata = { title: "Trading Game" }

// `?c=<dataset id>` opens the round on that question (the dashboard's daily
// challenge). Signed-in players who haven't done /start go there first;
// guests are checked in the browser, where their answers live.
export default async function TradingGamePage({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  const { c } = await searchParams
  const user = await getCurrentUser()

  if (user && !user.onboarding) {
    const back = c ? `/trading-game?c=${encodeURIComponent(c)}` : "/trading-game"
    redirect(`/start?next=${encodeURIComponent(back)}`)
  }

  return <TradingGame key={c ?? "round"} featuredId={c} serverOnboarding={user ? user.onboarding : undefined} />
}
