import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ArrowRight, Clock } from "lucide-react"
import { getLocale, getTranslations } from "next-intl/server"
import { SourceList } from "@/components/learn/draft-note"
import { LessonBlocks } from "@/components/learn/lesson-blocks"
import { LessonDoneButton } from "@/components/learn/lesson-done"
import { LevelGate } from "@/components/learn/level-gate"
import type { Locale } from "@/lib/i18n/locale"
import { LESSONS, lessonBySlug, levelById, neighbours } from "@/lib/learn/content"

export function generateStaticParams() {
  return LESSONS.map((l) => ({ slug: l.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const lesson = lessonBySlug.get(slug)
  const [t, locale] = await Promise.all([getTranslations("learn"), getLocale() as Promise<Locale>])
  return { title: lesson ? lesson.title[locale] : t("lesson.fallbackTitle") }
}

export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const lesson = lessonBySlug.get(slug)
  if (!lesson) notFound()

  const level = levelById.get(lesson.level)!
  const { prev, next } = neighbours(slug)
  const [t, locale] = await Promise.all([getTranslations("learn"), getLocale() as Promise<Locale>])
  const lastOfLevel = level.lessons[level.lessons.length - 1].slug === lesson.slug

  return (
    <article className="mx-auto max-w-3xl px-5 py-6 lg:px-8">
      <Link
        href="/belajar"
        className="enter inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> {t("lesson.back")}
      </Link>

      <header className="mt-2">
        <p className="eyebrow enter">
          {t("hub.levelEyebrow", { n: level.id })} · {level.title[locale]}
        </p>
        <h1 className="enter-focus mt-3 text-3xl font-extrabold leading-tight sm:text-[40px]">{lesson.title[locale]}</h1>
        <p className="enter mt-3 text-lg text-muted-foreground" style={{ "--enter-delay": "80ms" } as React.CSSProperties}>
          {lesson.summary[locale]}
        </p>
        <p className="enter mt-4 flex items-center gap-1.5 text-sm text-faint" style={{ "--enter-delay": "120ms" } as React.CSSProperties}>
          <Clock className="h-4 w-4" aria-hidden="true" /> {t("lesson.readMinutes", { n: lesson.minutes })}
        </p>
      </header>

      <div className="mt-6">
        <LevelGate level={lesson.level}>
          <p className="text-xs text-faint">{t("lesson.tapHint")}</p>
          <div className="mt-3">
            <LessonBlocks blocks={lesson.blocks} />
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <LessonDoneButton slug={lesson.slug} />
            {lastOfLevel && (
              <Link href={`/belajar/ujian/${level.id}`} className="btn btn-ghost">
                {t("exam.cta", { level: level.id })} <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>

          <div className="mt-10">
            <SourceList material={lesson.material} sources={lesson.sources} />
          </div>
        </LevelGate>
      </div>

      <nav aria-label={t("lesson.others")} className="mt-8 grid gap-3 sm:grid-cols-2">
        {prev ? (
          <Link href={`/belajar/${prev.slug}`} className="lift rounded-2xl border border-border bg-card p-4 hover:border-primary/40">
            <p className="flex items-center gap-1 text-xs text-faint">
              <ArrowLeft className="h-3 w-3" /> {t("lesson.prev")}
            </p>
            <p className="mt-1 font-semibold">{prev.title[locale]}</p>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link
            href={`/belajar/${next.slug}`}
            className="lift rounded-2xl border border-border bg-card p-4 text-right hover:border-primary/40"
          >
            <p className="flex items-center justify-end gap-1 text-xs text-faint">
              {t("lesson.next")} <ArrowRight className="h-3 w-3" />
            </p>
            <p className="mt-1 font-semibold">{next.title[locale]}</p>
          </Link>
        )}
      </nav>
    </article>
  )
}
