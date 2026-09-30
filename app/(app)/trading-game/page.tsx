import type { Metadata } from "next"
import { TradingGame } from "@/components/trading-game/trading-game"

export const metadata: Metadata = { title: "Trading Game" }

// `?c=<dataset id>` opens the round on that question (the dashboard's daily
// challenge). The game loop itself is the client component.
export default async function TradingGamePage({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  const { c } = await searchParams
  return <TradingGame key={c ?? "round"} featuredId={c} />
}
