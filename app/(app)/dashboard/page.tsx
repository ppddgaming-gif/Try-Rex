import { TopCards } from "@/components/dashboard/top-cards"
import { AspectPanel } from "@/components/dashboard/aspect-panel"
import { AiInsight } from "@/components/dashboard/ai-insight"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { DailyChallenge } from "@/components/dashboard/daily-challenge"
import { ChevronDown, Calendar } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-6 lg:px-8">
      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back, RexTrader! 👋</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Terus belajar, terus berkembang, jadi trader yang konsisten!
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium">
            <span className="text-base">🇪🇺</span> EURUSD <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground">
            <Calendar className="h-4 w-4" /> 25 Mei 2025
          </button>
        </div>
      </header>

      <div className="mt-6">
        <TopCards />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AspectPanel />
        <AiInsight />
        <RecentActivity />
        <DailyChallenge />
      </div>
    </div>
  )
}
