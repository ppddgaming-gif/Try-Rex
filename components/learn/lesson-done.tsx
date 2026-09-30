"use client"

import { Check, CircleCheck, Circle } from "lucide-react"
import { Skeleton } from "@/components/progress/skeleton"
import { setLessonDone, useLessonsDone } from "@/lib/learn/progress"

/** The "mark as finished" toggle at the foot of a lesson. */
export function LessonDoneButton({ slug }: { slug: string }) {
  const done = useLessonsDone()
  if (!done) return <Skeleton className="h-[52px] w-48 rounded-xl" />
  const finished = done.includes(slug)

  return (
    <button
      type="button"
      onClick={() => setLessonDone(slug, !finished)}
      aria-pressed={finished}
      className={finished ? "btn btn-ghost" : "btn"}
    >
      <span key={String(finished)} className="pop-in flex">
        {finished ? <CircleCheck className="h-4 w-4 text-primary" /> : <Check className="h-4 w-4" />}
      </span>
      {finished ? "Sudah selesai" : "Tandai selesai"}
    </button>
  )
}

/** Small status dot beside a lesson in lists. */
export function LessonStatus({ slug }: { slug: string }) {
  const done = useLessonsDone()
  if (!done) return <Skeleton className="h-5 w-5 rounded-full" />
  return done.includes(slug) ? (
    <CircleCheck className="pop-in h-5 w-5 shrink-0 text-primary" aria-label="Selesai" />
  ) : (
    <Circle className="h-5 w-5 shrink-0 text-faint" aria-label="Belum" />
  )
}

/** "3 / 15 materi selesai" with a ring, counted from this device. */
export function LearnProgressRing({ total, slugs }: { total: number; slugs?: string[] }) {
  const done = useLessonsDone()
  const count = done ? (slugs ? slugs.filter((s) => done.includes(s)).length : done.length) : 0
  const size = 64
  const stroke = 7
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r

  return (
    <div className="flex items-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        {done ? (
          <>
            <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
              <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--inset)" strokeWidth={stroke} />
              <circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke="var(--primary)"
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={circ * (1 - count / total)}
                className="transition-[stroke-dashoffset] duration-1000 ease-spring"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center font-mono text-sm font-bold">
              {count}/{total}
            </span>
          </>
        ) : (
          <Skeleton className="h-full w-full rounded-full" />
        )}
      </div>
      <p className="text-sm text-muted-foreground">
        {done && count === 0 ? "Belum ada materi selesai." : "materi selesai di perangkat ini"}
      </p>
    </div>
  )
}
