import type { Metadata } from "next"
import { TradingGame } from "@/components/trading-game/trading-game"
import { getCurrentUser } from "@/lib/auth"

export const metadata: Metadata = { title: "Trading Game" }

// `?c=<dataset id>` opens the round on that question (the dashboard's daily
// challenge). Signed-in players answer the quiz on /lengkapi-profil before
// they get here (the gate in the (app) layout); guests are checked in the
// browser, where their answers live, and sent to /start.
export default async function TradingGamePage({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  const { c } = await searchParams
  const user = await getCurrentUser()

  return <TradingGame key={c ?? "round"} featuredId={c} serverOnboarding={user ? user.onboarding : undefined} />
}
