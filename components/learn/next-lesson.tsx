"use client"

import Link from "next/link"
import { ArrowRight, BookOpen, GraduationCap } from "lucide-react"
import { Card } from "@/components/card"
import { Skeleton } from "@/components/progress/skeleton"
import { ORDERED_LESSONS } from "@/lib/learn/content"
import { useLessonsDone } from "@/lib/learn/progress"

/** Dashboard card: the first Belajar 101 lesson not yet finished on this device. */
export function NextLesson() {
  const done = useLessonsDone()
  const next = done ? ORDERED_LESSONS.find((l) => !done.includes(l.slug)) : undefined
  const count = done ? ORDERED_LESSONS.filter((l) => done.includes(l.slug)).length : 0

  return (
    <Card className="spotlight flex flex-col">
      <h2 className="flex items-center gap-2 text-base font-semibold">
        <BookOpen className="h-4 w-4 text-primary" aria-hidden="true" /> Lanjut belajar
      </h2>
      {!done ? (
        <>
          <Skeleton className="mt-4 h-6 w-48" />
          <Skeleton className="mt-2 h-4 w-full" />
          <Skeleton className="mt-5 h-11 w-40 rounded-xl" />
        </>
      ) : next ? (
        <>
          <p className="mt-4 font-display text-lg font-bold">{next.title}</p>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{next.summary}</p>
          <p className="mt-2 text-xs text-faint">
            <span className="font-mono">{count}</span> dari <span className="font-mono">{ORDERED_LESSONS.length}</span> materi
            selesai · {next.minutes} menit
          </p>
          <Link href={`/belajar/${next.slug}`} className="btn btn-sm mt-4 self-start">
            {count === 0 ? "Mulai materi pertama" : "Lanjutkan"} <ArrowRight className="h-4 w-4" />
          </Link>
        </>
      ) : (
        <div className="mt-4 flex items-center gap-3">
          <GraduationCap className="pop-in h-8 w-8 text-primary" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">Semua materi Belajar 101 sudah kamu selesaikan.</p>
        </div>
      )}
    </Card>
  )
}
