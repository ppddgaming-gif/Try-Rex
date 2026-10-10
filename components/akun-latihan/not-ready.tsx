import { DatabaseZap } from "lucide-react"
import { Card } from "@/components/card"
import { useTranslations } from "next-intl"

/** The Akun Latihan tables aren't in the database yet (migration not run). */
export function NotReadyCard() {
  const t = useTranslations("demo.ui.notReady")
  return (
    <Card className="flex flex-col items-center py-12 text-center sm:p-12">
      <DatabaseZap className="h-10 w-10 text-primary" aria-hidden="true" />
      <h2 className="mt-4 text-xl font-bold">{t("title")}</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{t("body")}</p>
    </Card>
  )
}
