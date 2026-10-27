import type { Metadata } from "next"
import { useTranslations } from "next-intl"
import { getTranslations } from "next-intl/server"
import Link from "next/link"
import { ArrowLeft, LineChart } from "lucide-react"
import { BrandMark } from "@/components/brand-mark"
import { RexArt } from "@/components/rex-mascot"

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("landing.notFound"))("title") }
}

// Unmatched URLs and notFound() calls. Rex grimaces: this was a wrong turn.
export default function NotFound() {
  const t = useTranslations("landing.notFound")
  return (
    <main className="flex min-h-dvh flex-col items-center px-5 py-10">
      <BrandMark size="lg" />
      <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
        <RexArt size={128} mood="dizzy" priority className="enter" />
        <p className="eyebrow mt-6 font-mono">404</p>
        <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">{t("heading")}</h1>
        <p className="mt-3 max-w-sm text-muted-foreground">{t("body")}</p>
        <div className="mt-8 flex w-full max-w-sm flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row">
          <Link href="/trading-game" className="btn">
            <LineChart className="h-4 w-4" /> {t("game")}
          </Link>
          <Link href="/" className="btn btn-ghost">
            <ArrowLeft className="h-4 w-4" /> {t("home")}
          </Link>
        </div>
      </div>
    </main>
  )
}
