import type { Metadata } from "next"
import { getLocale, getTranslations } from "next-intl/server"
import Link from "next/link"
import { ArrowRight, BookA, Clock } from "lucide-react"
import { Card } from "@/components/card"
import { LearnProgressRing, LessonStatus } from "@/components/learn/lesson-done"
import { LevelStatus, LockBadge } from "@/components/learn/level-gate"
import { RexArt } from "@/components/rex-mascot"
import { GLOSSARY } from "@/lib/glossary"
import type { Locale } from "@/lib/i18n/locale"
import { LESSONS, LEVELS } from "@/lib/learn/content"
import { EXAM } from "@/lib/learn/exam/engine"

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("learn.hub"))("title") }
}

export default async function LearnPage() {
  const [t, locale] = await Promise.all([getTranslations("learn"), getLocale() as Promise<Locale>])
  return (
    <div className="mx-auto max-w-5xl px-5 py-6 lg:px-8">
      <header className="glow-card enter relative overflow-hidden rounded-3xl border border-border p-6 sm:p-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1">
            <p className="eyebrow">{t("hub.eyebrow")}</p>
            <h1 className="enter-focus mt-3 text-3xl font-extrabold sm:text-4xl">{t("hub.heading")}</h1>
            <p className="mt-3 max-w-xl text-muted-foreground">{t("hub.body", { n: LEVELS.length, pass: EXAM.PASS, q: EXAM.QUESTIONS })}</p>
            <div className="mt-5">
              <LearnProgressRing total={LESSONS.length} slugs={LESSONS.map((l) => l.slug)} />
            </div>
          </div>
          <RexArt size={180} mood="explain" priority className="float hidden sm:block" />
        </div>
      </header>

      <Link
        href="/belajar/kamus"
        className="reveal lift spotlight mt-6 flex items-center gap-4 rounded-2xl border border-border bg-card p-5 hover:border-primary/40"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/30">
          <BookA className="h-6 w-6 text-primary" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg font-bold">{t("hub.kamus")}</p>
          <p className="text-sm text-muted-foreground">
            {t.rich("hub.kamusBody", { n: GLOSSARY.length, num: (c) => <span className="font-mono">{c}</span> })}
          </p>
        </div>
        <ArrowRight className="h-5 w-5 text-primary" aria-hidden="true" />
      </Link>

      <div className="mt-10 flex flex-col gap-10">
        {LEVELS.map((level) => (
          <section key={level.id} className="reveal" aria-labelledby={`level-${level.id}`}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 font-mono text-lg font-bold text-primary ring-1 ring-primary/30">
                  {level.id}
                </span>
                <div className="min-w-0">
                  <p className="font-mono text-xs text-faint">{t("hub.levelEyebrow", { n: level.id })}</p>
                  <h2 id={`level-${level.id}`} className="text-xl font-bold">
                    {level.title[locale]}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">{level.description[locale]}</p>
                </div>
              </div>
              <LevelStatus level={level.id} questions={EXAM.QUESTIONS} />
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {level.lessons.map((l) => (
                <Link
                  key={l.slug}
                  href={`/belajar/${l.slug}`}
                  className="lift spotlight group flex items-start gap-3 rounded-2xl border border-border bg-card p-4 hover:border-primary/40"
                >
                  <LessonStatus slug={l.slug} />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold leading-snug group-hover:text-primary">{l.title[locale]}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{l.summary[locale]}</p>
                    <p className="mt-2 flex items-center gap-1 text-xs text-faint">
                      <Clock className="h-3 w-3" aria-hidden="true" /> {t("hub.minutes", { n: l.minutes })}
                    </p>
                  </div>
                  <LockBadge level={level.id} />
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      <Card className="glow-card mt-12 flex flex-col items-center gap-4 text-center sm:p-10">
        <p className="font-display text-2xl font-bold">{t("hub.practiceTitle")}</p>
        <p className="max-w-md text-sm text-muted-foreground">{t("hub.practiceBody")}</p>
        <Link href="/trading-game" className="btn">
          {t("hub.openGame")} <ArrowRight className="h-4 w-4" />
        </Link>
      </Card>
    </div>
  )
}
