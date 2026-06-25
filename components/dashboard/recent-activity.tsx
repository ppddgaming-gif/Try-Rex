import { Card } from "@/components/card"
import { recentActivities } from "@/lib/mock-data"
import { ListChecks, CheckCircle2, XCircle, ChevronRight } from "lucide-react"

export function RecentActivity() {
  return (
    <Card className="flex flex-col">
      <h2 className="flex items-center gap-2 text-base font-semibold">
        <ListChecks className="h-4 w-4 text-primary" />
        Aktivitas Terbaru
      </h2>

      <div className="mt-4 flex flex-col gap-2">
        {recentActivities.map((a) => {
          const correct = a.result === "Benar"
          return (
            <div
              key={a.id}
              className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2.5"
            >
              {correct ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
              ) : (
                <XCircle className="h-5 w-5 shrink-0 text-danger" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">Challenge #{a.id}</p>
              </div>
              <span className="hidden text-xs text-muted-foreground sm:inline">{a.aspect}</span>
              <span
                className={[
                  "rounded-md px-2 py-0.5 text-xs font-semibold",
                  correct ? "bg-success/15 text-success" : "bg-danger/15 text-danger",
                ].join(" ")}
              >
                {a.result}
              </span>
              <span className={`w-12 text-right text-xs font-bold ${correct ? "text-success" : "text-muted-foreground"}`}>
                +{a.xp} XP
              </span>
              <span className="hidden w-20 text-right text-xs text-muted-foreground md:inline">{a.time}</span>
            </div>
          )
        })}
      </div>

      <button className="mt-4 flex items-center justify-center gap-1 rounded-lg border border-border bg-muted/40 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted">
        Lihat Semua Aktivitas <ChevronRight className="h-4 w-4" />
      </button>
    </Card>
  )
}
