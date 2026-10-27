import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { redirect } from "next/navigation"
import { DemoTabs } from "@/components/akun-latihan/demo-tabs"
import { NotReadyCard } from "@/components/akun-latihan/not-ready"
import { TradingDesk } from "@/components/akun-latihan/trading-desk"
import { getCurrentUser } from "@/lib/auth"
import { getAccess, loadDemoState } from "@/lib/demo/server"
import { TUTORIAL_VIDEO } from "@/lib/live/config"
import { loadDesk } from "@/lib/live/desk"
import { liveQuote, liveView, syncLive } from "@/lib/live/engine"
import { availablePairs } from "@/lib/live/store"
import { createClient } from "@/lib/supabase/server"

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("demo.ui.meta"))("trading") }
}

/**
 * The live trading screen: nine pairs, four timeframes, drawing tools, and a
 * chart that runs on real time. Same gate as /akun-latihan (account and
 * required lesson first). Loading replays the account up to now; the browser
 * gets candles up to now only, with relative times, never a date.
 */
export default async function TradingPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/akun-latihan")
  const [access, state] = await Promise.all([getAccess(user.id), loadDemoState(user.id)])
  if (!state.ready || !access.open || !state.account || !state.introLessonPassed) redirect("/akun-latihan")

  const synced = await syncLive(user.id).catch((e) => {
    console.error("Akun Latihan: live sync failed", e)
    return "not-ready" as const
  })
  if (synced === null) redirect("/akun-latihan")
  if (synced === "not-ready") {
    return (
      <div className="flex flex-col gap-5">
        <DemoTabs />
        <NotReadyCard />
      </div>
    )
  }

  const supabase = await createClient()
  const [desk, view, available, video] = await Promise.all([
    loadDesk(user.id, synced, { drawings: true }),
    liveView(synced),
    availablePairs(),
    supabase.from("demo_tips_seen").select("tip_id").eq("user_id", user.id).eq("tip_id", TUTORIAL_VIDEO.id).maybeSingle(),
  ])
  const quote = await liveQuote(synced, desk.pair)

  return (
    <div className="flex flex-col gap-5">
      <DemoTabs />
      <TradingDesk
        view={view}
        initial={{ pair: desk.pair, timeframe: desk.timeframe, chart: desk.chart, drawings: desk.drawings ?? [], quote }}
        available={available}
        videoSeen={Boolean(video.data)}
      />
    </div>
  )
}
