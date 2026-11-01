import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { getLocale, getTranslations } from "next-intl/server"
import { AssessmentRunner } from "@/components/assessment/runner"
import { publicPackage } from "@/lib/assessment/data"
import { isPackageId, PACKAGE_IDS } from "@/lib/assessment/types"
import type { Locale } from "@/lib/i18n/locale"

export function generateStaticParams() {
  return PACKAGE_IDS.map((paket) => ({ paket }))
}

export async function generateMetadata({ params }: { params: Promise<{ paket: string }> }): Promise<Metadata> {
  const { paket } = await params
  return { title: isPackageId(paket) ? paket : (await getTranslations("assessment.hub"))("title") }
}

export default async function AssessmentPackagePage({ params }: { params: Promise<{ paket: string }> }) {
  const { paket } = await params
  if (!isPackageId(paket)) notFound()
  const [t, locale] = await Promise.all([getTranslations("assessment.hub"), getLocale() as Promise<Locale>])
  const pkg = publicPackage(paket)

  return (
    <div className="mx-auto max-w-6xl px-5 py-6 lg:px-8">
      <Link href="/belajar/asesmen" className="enter inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> {t("back")}
      </Link>
      <header className="mt-2">
        <p className="eyebrow enter">{pkg.id}</p>
        <h1 className="enter-focus mt-3 text-3xl font-extrabold leading-tight">{pkg.title[locale]}</h1>
      </header>
      <div className="mt-6">
        <AssessmentRunner pkg={pkg} />
      </div>
    </div>
  )
}
