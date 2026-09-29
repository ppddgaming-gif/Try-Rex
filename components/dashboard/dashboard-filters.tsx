"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { ArrowLeftRight, CalendarDays } from "lucide-react"
import { SelectMenu } from "@/components/select-menu"
import { activityRanges, pairs } from "@/lib/mock-data"

/**
 * Filters live in the URL so the dashboard itself stays a server component and
 * the view is shareable / restorable.
 */
export function DashboardFilters({ pair, range }: { pair: string; range: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function set(key: string, value: string) {
    const next = new URLSearchParams(searchParams)
    next.set(key, value)
    router.replace(`${pathname}?${next}`, { scroll: false })
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <SelectMenu
        label="Pasangan mata uang"
        className="min-w-[9.5rem]"
        value={pair}
        onChange={(v) => set("pair", v)}
        options={pairs.map((p) => ({
          value: p.symbol,
          label: p.symbol,
          prefix: <ArrowLeftRight className="h-4 w-4" />,
        }))}
      />
      <SelectMenu
        label="Rentang waktu"
        className="min-w-[11rem]"
        value={range}
        onChange={(v) => set("range", v)}
        options={activityRanges.map((r) => ({
          value: r.id,
          label: r.label,
          prefix: <CalendarDays className="h-4 w-4" />,
        }))}
      />
    </div>
  )
}
