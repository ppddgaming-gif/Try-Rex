import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { getLocale, getTranslations } from "next-intl/server"
import { ExamRunner } from "@/components/learn/exam-runner"
import type { Locale } from "@/lib/i18n/locale"
import { LEVELS, levelById } from "@/lib/learn/content"
import type { LevelId } from "@/lib/learn/types"

export function generateStaticParams() {
  return LEVELS.map((l) => ({ level: String(l.id) }))
}

export async function generateMetadata({ params }: { params: Promise<{ level: string }> }): Promise<Metadata> {
  const { level } = await params
  const t = await getTranslations("learn.exam")
  return { title: t("title", { level: Number(level) }) }
}

export default async function ExamPage({ params }: { params: Promise<{ level: string }> }) {
  const { level: raw } = await params
  const level = levelById.get(Number(raw) as LevelId)
  if (!level) notFound()
  const [t, locale] = await Promise.all([getTranslations("learn"), getLocale() as Promise<Locale>])

  return (
    <div className="mx-auto max-w-3xl px-5 py-6 lg:px-8">
      <Link href="/belajar" className="enter inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> {t("lesson.back")}
      </Link>
      <header className="mt-2">
        <p className="eyebrow enter">{t("hub.levelEyebrow", { n: level.id })}</p>
        <h1 className="enter-focus mt-3 text-3xl font-extrabold leading-tight sm:text-[40px]">{t("exam.title", { level: level.id })}</h1>
        <p className="enter mt-3 text-lg text-muted-foreground">{level.title[locale]}</p>
      </header>
      <div className="mt-6">
        <ExamRunner level={level.id} hasNext={level.id < 6} />
      </div>
    </div>
  )
}
