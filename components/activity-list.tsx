import { CheckCircle2, XCircle } from "lucide-react"
import { relativeTime, type Activity } from "@/lib/mock-data"

export function ActivityList({ activities }: { activities: Activity[] }) {
  if (activities.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">
        Belum ada aktivitas di rentang waktu ini.
      </p>
    )
  }

  return (
    <ul className="flex flex-col gap-2">
      {activities.map((a) => {
        const correct = a.result === "Benar"
        return (
          <li
            key={a.id}
            className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2.5"
          >
            {correct ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
            ) : (
              <XCircle className="h-5 w-5 shrink-0 text-danger" />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">Challenge #{a.id}</p>
              <p className="text-xs text-muted-foreground sm:hidden">{a.aspect}</p>
            </div>
            <span className="hidden text-xs text-muted-foreground sm:inline">{a.pair}</span>
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
            <span className="hidden w-20 text-right text-xs text-muted-foreground md:inline">
              {relativeTime(a.hoursAgo)}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
