"use client"

import { localDateKey } from "@/lib/progress/derive"
import type { Attempt } from "@/lib/progress/types"
import { useNow, useToday } from "@/lib/progress/use-progress"

const decisionChip = {
  buy: { label: "BUY", className: "bg-success/12 text-success" },
  sell: { label: "SELL", className: "bg-danger/12 text-danger" },
  // WAIT keeps its own blue-grey token (see CLAUDE.md), not neutral grey.
  wait: { label: "WAIT", className: "bg-wait/12 text-wait" },
} as const

function difficultyLabel(d: number) {
  if (d <= 2) return "Mudah"
  if (d === 3) return "Menengah"
  return "Sulit"
}

/** "baru saja", "5 menit lalu", "3 jam lalu", "kemarin", "4 hari lalu". */
function relativeTime(iso: string, now: number, today: string) {
  const then = new Date(iso)
  const minutes = Math.floor((now - then.getTime()) / 60_000)
  if (minutes < 1) return "baru saja"
  if (minutes < 60) return `${minutes} menit lalu`
  const [y, m, d] = today.split("-").map(Number)
  const yesterday = localDateKey(new Date(y, m - 1, d - 1))
  const day = localDateKey(then)
  if (day === today) return `${Math.floor(minutes / 60)} jam lalu`
  if (day === yesterday) return "kemarin"
  const days = Math.round((Date.UTC(y, m - 1, d) - Date.UTC(then.getFullYear(), then.getMonth(), then.getDate())) / 86_400_000)
  return `${days} hari lalu`
}

/** Last answers, newest first, one 56px row each. */
export function ActivityRows({ attempts }: { attempts: Attempt[] }) {
  const now = useNow()
  const today = useToday()

  return (
    <ul className="divide-y divide-border">
      {attempts.map((a) => {
        const chip = decisionChip[a.decision]
        return (
          <li key={a.createdAt + a.scenarioId} className="flex min-h-14 items-center gap-3 py-2">
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-sm font-semibold">
                {a.pair} <span className="text-muted-foreground">{a.timeframe}</span>
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">{difficultyLabel(a.difficulty)}</p>
            </div>

            <span className={`rounded-md px-2 py-1 font-mono text-xs font-bold ${chip.className}`}>{chip.label}</span>

            <div className="flex w-28 shrink-0 flex-col items-end leading-tight">
              <span className={`text-xs font-semibold ${a.correct ? "text-success" : "text-muted-foreground"}`}>
                {a.correct ? "Tepat" : "Kurang tepat"}
              </span>
              <span className="mt-0.5 font-mono text-xs tabular-nums text-muted-foreground">
                <span className={a.xpEarned > 0 ? "text-foreground" : ""}>+{a.xpEarned} XP</span>
                {now !== null && today && <> · {relativeTime(a.createdAt, now, today)}</>}
              </span>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
