"use client"

import { useEffect, useMemo, useRef } from "react"
import { useLocale, useTranslations } from "next-intl"
import { INTL_LOCALE, type Locale } from "@/lib/i18n/locale"
import { attemptsPerDay, localDateKey } from "@/lib/progress/derive"
import { useProgress, useToday } from "@/lib/progress/use-progress"
import { Card } from "@/components/card"
import { Skeleton } from "@/components/progress/skeleton"

const WEEKS = 12
const CELL = 12
const GAP = 3
const GRID_W = WEEKS * CELL + (WEEKS - 1) * GAP
const GRID_H = 7 * CELL + 6 * GAP
const MONTH_H = 18
// Weekday label column ("Sen") plus the 8px gap before the squares.
const LABEL_W = 28

/** Local time on purpose (no timeZone): a practice day is the player's day. */
function useFormats() {
  const locale = INTL_LOCALE[useLocale() as Locale]
  return useMemo(
    () => ({
      month: new Intl.DateTimeFormat(locale, { month: "short" }),
      tip: new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric", month: "short" }),
    }),
    [locale],
  )
}

function shade(n: number) {
  if (n === 0) return "bg-muted"
  if (n <= 2) return "bg-primary/30"
  if (n <= 5) return "bg-primary/60"
  return "bg-primary"
}

/** Monday-first columns covering the last 12 weeks, ending in today's week. */
function buildWeeks(todayKey: string) {
  const [y, m, d] = todayKey.split("-").map(Number)
  const today = new Date(y, m - 1, d)
  const sinceMonday = (today.getDay() + 6) % 7
  const start = new Date(y, m - 1, d - sinceMonday - (WEEKS - 1) * 7)
  return Array.from({ length: WEEKS }, (_, w) =>
    Array.from({ length: 7 }, (_, r) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + w * 7 + r)),
  )
}

/**
 * GitHub-style practice grid. A new player sees twelve weeks of empty
 * squares, which is the point: it visibly fills up as they play.
 */
export function PracticeCalendar() {
  const progress = useProgress()
  const today = useToday()
  const scroller = useRef<HTMLDivElement>(null)

  // On narrow screens the grid scrolls sideways; start at today (the end).
  useEffect(() => {
    const el = scroller.current
    if (el) el.scrollLeft = el.scrollWidth
  }, [today, progress])

  const ready = progress && today
  const perDay = ready ? attemptsPerDay(progress.attempts) : null
  const activeDays = perDay ? [...perDay.values()].length : 0
  const t = useTranslations("progress.calendar")
  const num = (c: React.ReactNode) => <span className="font-mono tabular-nums">{c}</span>

  return (
    <Card>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-base font-semibold">{t("title")}</h2>
        {ready ? (
          <p className="text-xs text-muted-foreground">
            {t.rich("days", { n: activeDays, num })}
          </p>
        ) : (
          <Skeleton className="h-4 w-20" />
        )}
      </div>

      <div ref={scroller} className="mt-4 overflow-x-auto pb-1">
        {ready ? (
          <CalendarGrid weeks={buildWeeks(today)} perDay={perDay!} today={today} />
        ) : (
          // Same footprint as the grid: weekday column + gap, month row + squares.
          <span aria-hidden="true" className="skeleton rounded" style={{ width: LABEL_W + GRID_W, height: MONTH_H + GRID_H }} />
        )}
      </div>

      <div className="mt-3 flex items-center justify-end gap-1.5 text-[11px] text-muted-foreground">
        {t("less")}
        {["bg-muted", "bg-primary/30", "bg-primary/60", "bg-primary"].map((c) => (
          <span key={c} className={`h-3 w-3 rounded-[2px] ${c}`} aria-hidden="true" />
        ))}
        {t("more")}
      </div>
    </Card>
  )
}

function CalendarGrid({ weeks, perDay, today }: { weeks: Date[][]; perDay: Map<string, number>; today: string }) {
  const total = [...perDay.entries()].filter(([k]) => k >= localDateKey(weeks[0][0])).reduce((s, [, n]) => s + n, 0)
  const t = useTranslations("progress.calendar")
  const fmt = useFormats()

  return (
    <div className="inline-flex gap-2" role="img" aria-label={t("aria", { n: total })}>
      {/* Weekday labels on alternate rows, like GitHub's. */}
      <div
        className="flex flex-col text-[10px] leading-none text-muted-foreground"
        style={{ gap: GAP, width: LABEL_W - 8, paddingTop: MONTH_H }}
      >
        {[t("mon"), "", t("wed"), "", t("fri"), "", ""].map((l, i) => (
          <span key={i} className="flex items-center" style={{ height: CELL }}>
            {l}
          </span>
        ))}
      </div>

      <div aria-hidden="true">
        {/* Month label over the first column of each month. */}
        <div className="relative text-[10px] text-muted-foreground" style={{ width: GRID_W, height: MONTH_H }}>
          {weeks.map((col, w) => {
            const first = col[0]
            const prev = w > 0 ? weeks[w - 1][0] : null
            if (prev && prev.getMonth() === first.getMonth()) return null
            return (
              <span key={w} className="absolute top-0" style={{ left: w * (CELL + GAP) }}>
                {fmt.month.format(first)}
              </span>
            )
          })}
        </div>

        <div className="flex" style={{ gap: GAP }}>
          {weeks.map((col, w) => (
            <div key={w} className="flex flex-col" style={{ gap: GAP }}>
              {col.map((day) => {
                const key = localDateKey(day)
                // Days later this week haven't happened; keep the slot, show nothing.
                if (key > today) return <span key={key} style={{ width: CELL, height: CELL }} />
                const n = perDay.get(key) ?? 0
                return (
                  <span
                    key={key}
                    title={t("tip", { n, date: fmt.tip.format(day) })}
                    className={`block rounded-[2px] ${shade(n)} ${key === today ? "ring-1 ring-foreground/70" : ""}`}
                    style={{ width: CELL, height: CELL }}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
