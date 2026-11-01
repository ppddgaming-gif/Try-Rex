import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, ArrowRight, ClipboardList } from "lucide-react"
import { getLocale, getTranslations } from "next-intl/server"
import { PackageStatus } from "@/components/assessment/package-status"
import { publicPackage } from "@/lib/assessment/data"
import { PACKAGE_IDS } from "@/lib/assessment/types"
import type { Locale } from "@/lib/i18n/locale"

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("assessment.hub"))("title") }
}

export default async function AssessmentHub() {
  const [t, tl, locale] = await Promise.all([getTranslations("assessment.hub"), getTranslations("learn"), getLocale() as Promise<Locale>])
  const packages = PACKAGE_IDS.map((id) => publicPackage(id))

  return (
    <div className="mx-auto max-w-4xl px-5 py-6 lg:px-8">
      <Link href="/belajar" className="enter inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> {tl("lesson.back")}
      </Link>
      <header className="mt-2">
        <p className="eyebrow enter">{t("eyebrow")}</p>
        <h1 className="enter-focus mt-3 text-3xl font-extrabold leading-tight sm:text-[40px]">{t("heading")}</h1>
        <p className="enter mt-3 max-w-2xl text-muted-foreground">{t("body")}</p>
      </header>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {packages.map((p) => {
          const count = (type: string) => p.items.filter((i) => i.type === type).length
          return (
            <li key={p.id}>
              <Link
                href={`/belajar/asesmen/${p.id}`}
                className="reveal lift spotlight flex h-full flex-col gap-3 rounded-2xl border border-border bg-card p-5 hover:border-primary/40"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/30">
                    <ClipboardList className="h-5 w-5 text-primary" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-mono text-xs text-faint">{p.id}</p>
                    <p className="font-display text-lg font-bold leading-snug">{p.title[locale]}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t("counts", { scenarios: count("scenario"), complex: count("mcq_complex"), basic: count("mcq_basic") })}
                </p>
                <div className="mt-auto flex items-center justify-between gap-3">
                  <PackageStatus id={p.id} />
                  <ArrowRight className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
      <p className="mt-6 text-xs text-faint">{t("note")}</p>
    </div>
  )
}
