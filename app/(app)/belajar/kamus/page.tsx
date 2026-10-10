import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { DraftNote } from "@/components/learn/draft-note"
import { GlossaryBrowser } from "@/components/learn/glossary-browser"

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("learn.kamusPage"))("title") }
}

export default async function GlossaryPage() {
  const t = await getTranslations("learn")
  return (
    <div className="mx-auto max-w-4xl px-5 py-6 lg:px-8">
      <Link
        href="/belajar"
        className="enter inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> {t("lesson.back")}
      </Link>
      <header className="mt-2">
        <p className="eyebrow enter">{t("kamusPage.eyebrow")}</p>
        <h1 className="enter-focus mt-3 text-3xl font-extrabold sm:text-4xl">{t("kamusPage.title")}</h1>
        <p className="enter mt-3 max-w-xl text-muted-foreground">{t("kamusPage.body")}</p>
      </header>
      <div className="mt-6">
        <DraftNote />
      </div>
      <div className="mt-6">
        <GlossaryBrowser />
      </div>
    </div>
  )
}
