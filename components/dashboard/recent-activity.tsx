import { ActivityList } from "@/components/activity-list"
import { Card } from "@/components/card"
import { Disclosure } from "@/components/disclosure"
import { ListChecks } from "lucide-react"
import type { Activity, ActivityRange } from "@/lib/mock-data"

export function RecentActivity({
  activities,
  range,
  pair,
}: {
  activities: Activity[]
  range: ActivityRange
  pair: string
}) {
  const visible = activities.slice(0, 3)
  const rest = activities.slice(3)

  return (
    <Card className="flex flex-col">
      <h2 className="flex items-center gap-2 text-base font-semibold">
        <ListChecks className="h-4 w-4 text-primary" />
        Aktivitas Terbaru
      </h2>
      <p className="mt-1 text-xs text-muted-foreground">
        {pair} · {range.label}
      </p>

      <div className="mt-4">
        <ActivityList activities={visible} />
      </div>

      {rest.length > 0 && (
        <Disclosure
          label={`Lihat ${rest.length} Aktivitas Lain`}
          closeLabel="Sembunyikan Aktivitas"
          className="mt-2"
        >
          <ActivityList activities={rest} />
        </Disclosure>
      )}
    </Card>
  )
}
