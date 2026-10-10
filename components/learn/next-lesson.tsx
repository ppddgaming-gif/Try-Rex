"use client"

import Link from "next/link"
import { ArrowRight, BookOpen, GraduationCap } from "lucide-react"
import { useTranslations } from "next-intl"
import { Card } from "@/components/card"
import { Skeleton } from "@/components/progress/skeleton"
import { ORDERED_LESSONS } from "@/lib/learn/content"
import { useLessonsDone } from "@/lib/learn/progress"

/** Dashboard card: the first Belajar 101 lesson not yet finished on this device. */
export function NextLesson() {
  const done = useLessonsDone()
  const next = done ? ORDERED_LESSONS.find((l) => !done.includes(l.slug)) : undefined
  const count = done ? ORDERED_LESSONS.filter((l) => done.includes(l.slug)).length : 0
  const t = useTranslations("learn.next")
  const tl = useTranslations("learn.lessons")

  return (
    <Card className="spotlight flex flex-col">
      <h2 className="flex items-center gap-2 text-base font-semibold">
        <BookOpen className="h-4 w-4 text-primary" aria-hidden="true" /> {t("title")}
      </h2>
      {!done ? (
        <>
          <Skeleton className="mt-4 h-6 w-48" />
          <Skeleton className="mt-2 h-4 w-full" />
          <Skeleton className="mt-5 h-11 w-40 rounded-xl" />
        </>
      ) : next ? (
        <>
          <p className="mt-4 font-display text-lg font-bold">{tl(`${next.slug}.title`)}</p>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{tl(`${next.slug}.summary`)}</p>
          <p className="mt-2 text-xs text-faint">
            {t.rich("count", {
              count,
              total: ORDERED_LESSONS.length,
              minutes: next.minutes,
              num: (c) => <span className="font-mono">{c}</span>,
            })}
          </p>
          <Link href={`/belajar/${next.slug}`} className="btn btn-sm mt-4 self-start">
            {count === 0 ? t("first") : t("continue")} <ArrowRight className="h-4 w-4" />
          </Link>
        </>
      ) : (
        <div className="mt-4 flex items-center gap-3">
          <GraduationCap className="pop-in h-8 w-8 text-primary" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">{t("allDone")}</p>
        </div>
      )}
    </Card>
  )
}
