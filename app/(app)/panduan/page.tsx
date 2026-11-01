import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { GuideList } from "@/components/tour/guide-list"
import { RexArt } from "@/components/rex-mascot"
import { getCurrentUser } from "@/lib/auth"
import { getAccess } from "@/lib/demo/server"

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("tours.ui"))("guideTitle") }
}

// Every guided tour in one list, with what has been seen and a replay
// button. The "?" button links here on pages that have no tour of their own.
export default async function GuidePage() {
  const user = await getCurrentUser()
  const access = user ? await getAccess(user.id) : null
  const t = await getTranslations("tours.ui")

  return (
    <div className="mx-auto max-w-3xl px-5 py-6 lg:px-8">
      <header className="enter flex items-center gap-4">
        <RexArt size={72} mood="explain" className="shrink-0" />
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight">{t("guideTitle")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("guideLead")}</p>
        </div>
      </header>

      <div className="mt-6">
        <GuideList signedIn={Boolean(user)} akunOpen={Boolean(access?.open)} />
      </div>
    </div>
  )
}
