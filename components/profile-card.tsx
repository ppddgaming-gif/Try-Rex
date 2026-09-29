import { Trophy } from "lucide-react"

export function ProfileCard({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-xl border border-border bg-card p-4 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 ring-1 ring-primary/30">
          <Trophy className="h-5 w-5 text-primary" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold">RexTrader</p>
          <p className="text-xs text-muted-foreground">Novice Trader</p>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-primary">Level 12</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary" style={{ width: "72%" }} />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">720 / 1000 XP</p>
      </div>
    </div>
  )
}
