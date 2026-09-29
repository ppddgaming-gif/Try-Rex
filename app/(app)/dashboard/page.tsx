import { AiInsight } from "@/components/dashboard/ai-insight"
import { AspectPanel } from "@/components/dashboard/aspect-panel"
import { DailyChallenge } from "@/components/dashboard/daily-challenge"
import { DashboardFilters } from "@/components/dashboard/dashboard-filters"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { TopCards } from "@/components/dashboard/top-cards"
import { activityRanges, challengesForPair, dataAsOf, pairs, recentActivities } from "@/lib/mock-data"

type Search = { pair?: string; range?: string }

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Search>
}) {
  const sp = await searchParams

  const pair = pairs.find((p) => p.symbol === sp.pair) ?? pairs[0]
  const range = activityRanges.find((r) => r.id === sp.range) ?? activityRanges[1]

  const challenge = challengesForPair(pair.symbol)[0]
  const activities = recentActivities.filter((a) => a.pair === pair.symbol && a.hoursAgo <= range.hours)

  return (
    <div className="mx-auto max-w-7xl px-5 py-6 lg:px-8">
      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back, RexTrader!</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Terus belajar, terus berkembang, jadi trader yang konsisten!
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Data per {dataAsOf}</p>
        </div>
        <DashboardFilters pair={pair.symbol} range={range.id} />
      </header>

      <div className="mt-6">
        <TopCards />
      </div>

      <div className="mt-4 grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
        <AspectPanel />
        <AiInsight />
        <RecentActivity activities={activities} range={range} pair={pair.symbol} />
        <DailyChallenge challenge={challenge} />
      </div>
    </div>
  )
}
