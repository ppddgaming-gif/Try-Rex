import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { redirect } from "next/navigation"
import { DemoTabs } from "@/components/akun-latihan/demo-tabs"
import { TradingDesk } from "@/components/akun-latihan/trading-desk"
import { getCurrentUser } from "@/lib/auth"
import { getAccess, loadDemoState } from "@/lib/demo/server"
import { loadTrading } from "@/lib/demo/trading"
import { buildView } from "@/lib/demo/view"
import { TUTORIAL_VIDEO } from "@/lib/live/config"
import { loadDesk } from "@/lib/live/desk"
import { availablePairs } from "@/lib/live/store"
import { createClient } from "@/lib/supabase/server"

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("demo.ui.meta"))("trading") }
}

/**
 * The trading screen: nine pairs, four timeframes, drawing tools. Same gate
 * as /akun-latihan (account and required lesson first). The browser gets the
 * closed candles before the account's "now" with relative times only, never a
 * whole data file and never a date.
 */
export default async function TradingPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/akun-latihan")
  const [access, state] = await Promise.all([getAccess(user.id), loadDemoState(user.id)])
  if (!state.ready || !access.open || !state.account || !state.introLessonPassed) redirect("/akun-latihan")

  const supabase = await createClient()
  const [loaded, desk, available, video] = await Promise.all([
    loadTrading(user.id),
    loadDesk(user.id).catch(() => null),
    availablePairs(),
    supabase.from("demo_tips_seen").select("tip_id").eq("user_id", user.id).eq("tip_id", TUTORIAL_VIDEO.id).maybeSingle(),
  ])
  if (!loaded) redirect("/akun-latihan")

  return (
    <div className="flex flex-col gap-5">
      <DemoTabs />
      <TradingDesk
        view={buildView(loaded.state)}
        initial={desk ?? { pair: "EURUSD", timeframe: "H1", chart: null, drawings: [] }}
        available={available}
        videoSeen={Boolean(video.data)}
      />
    </div>
  )
}
