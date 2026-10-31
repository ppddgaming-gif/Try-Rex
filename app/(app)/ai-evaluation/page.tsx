import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import Link from "next/link"
import { Card } from "@/components/card"
import { EmptyState } from "@/components/progress/empty-state"

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("evaluation"))("title") }
}

// AI Evaluation is being rebuilt for the trading journal. Until then the page
// is empty; the per-question explanation lives in the Trading Game itself
// (AI Explanation).
export default async function AiEvaluationPage() {
  const t = await getTranslations("evaluation")
  return (
    <div className="mx-auto max-w-7xl px-5 py-6 lg:px-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("lead")}</p>
      </header>
      <Card className="mt-6">
        <EmptyState
          mood="thinking"
          title={t("emptyTitle")}
          body={t("emptyBody")}
          action={
            <Link href="/trading-game" className="btn btn-sm">
              {t("openGame")}
            </Link>
          }
        />
      </Card>
    </div>
  )
}
