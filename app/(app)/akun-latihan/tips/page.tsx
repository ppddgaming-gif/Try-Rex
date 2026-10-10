import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { redirect } from "next/navigation"
import { Card } from "@/components/card"
import { DemoTabs } from "@/components/akun-latihan/demo-tabs"
import { TipsList } from "@/components/akun-latihan/tips-list"
import { getCurrentUser } from "@/lib/auth"
import { sectionState } from "@/lib/demo/server"

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("demo.ui.meta"))("tips") }
}

export default async function TipsPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/akun-latihan")
  const state = await sectionState(user.id)
  if (!state) redirect("/akun-latihan")
  const t = await getTranslations("demo.ui.tipsPage")

  return (
    <div className="flex flex-col gap-5">
      <DemoTabs />
      <Card className="sm:p-7">
        <h2 className="text-base font-semibold">{t("title")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("body")}</p>
        <div className="mt-5">
          <TipsList seen={state.tipsSeen} />
        </div>
      </Card>
    </div>
  )
}
