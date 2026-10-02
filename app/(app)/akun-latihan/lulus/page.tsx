import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowRight, Check, Info } from "lucide-react"
import { Card } from "@/components/card"
import { Confetti } from "@/components/confetti"
import { Rex } from "@/components/rex-mascot"
import { DemoTabs } from "@/components/akun-latihan/demo-tabs"
import { getCurrentUser } from "@/lib/auth"
import { DISIPLIN, GRADUATION } from "@/lib/demo/config"
import { pct } from "@/lib/demo/format"
import { loadPlayerTrades, tradeCounts } from "@/lib/demo/history"
import { statTrade } from "@/lib/demo/journal"
import { sectionState } from "@/lib/demo/server"
import { stageProgress } from "@/lib/demo/stages"
import { accountStats } from "@/lib/demo/stats"

export const metadata: Metadata = { title: "Lulus · Akun Latihan" }

/** What practice on historical data can't give. Plain statements, no statistics. */
const DEMO_LIMITS = [
  "Uang sungguhan terasa berbeda. Rugi beberapa dolar di saldo virtual tidak membuat jantung berdebar; uang yang kamu butuhkan bisa.",
  "Di sini chart bisa dijeda dan diputar candle demi candle. Pasar sungguhan berjalan terus, juga saat kamu tidur atau sedang sibuk.",
  "Eksekusi nyata bisa meleset dari harga yang kamu lihat (slippage), dan spread bisa melebar saat berita besar.",
  "Biaya, leverage dan aturannya berbeda di setiap penyedia, dan semuanya ikut menentukan hasil.",
  "Chart di sini sudah terjadi. Hasil latihan tidak memprediksi hasil trading nyata.",
]

/**
 * The graduation summary: 30 counted Stage 3 trades at 80% Disiplin or
 * better, told in the player's own numbers. No broker, no link to open an
 * account anywhere: practice simply goes on.
 */
export default async function LulusPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/akun-latihan")
  const state = await sectionState(user.id)
  if (!state?.graduated) redirect("/akun-latihan")

  const [trades, counts] = await Promise.all([loadPlayerTrades(user.id), tradeCounts(user.id)])
  const total = [...counts.values()].reduce((s, n) => s + n, 0)
  const scored = trades.filter((t) => t.counted).map((t) => ({ stage: t.stage, score: t.disiplin ?? 0 }))
  const progress = stageProgress(3, scored)
  const stage3 = accountStats(trades.filter((t) => t.stage === 3).map(statTrade), [])
  const revenge3 = trades.filter((t) => t.stage === 3 && t.revenge).length

  const shown = [
    progress.disiplin !== null && `Disiplin ${progress.disiplin}% rata-rata di ${GRADUATION.TRADES} trade Stage 3 terakhir.`,
    stage3.slAtEntryPct !== null && `${stage3.slAtEntryPct}% trade Stage 3 dibuka dengan stop loss.`,
    stage3.avgRiskPct !== null && `Risiko rata-rata ${pct(stage3.avgRiskPct)} saldo per trade (batas ${DISIPLIN.MAX_RISK_PCT}%).`,
    stage3.avgRewardRisk !== null && `Reward:risk rata-rata 1 : ${stage3.avgRewardRisk.toFixed(2)}.`,
    revenge3 === 0 ? "Tidak ada revenge trade di Stage 3." : `${revenge3} revenge trade di Stage 3.`,
    `${total} trade di ${state.accountCount} akun sejak trade pertamamu.`,
  ].filter((s): s is string => Boolean(s))

  return (
    <div className="flex flex-col gap-5">
      <DemoTabs />
      <Card className="glow-card relative overflow-hidden text-center sm:p-10">
        <Confetti />
        <Rex size={96} mood="happy" className="float mx-auto" />
        <p className="eyebrow mt-4">Akun Latihan</p>
        <h2 className="mt-2 text-3xl font-bold">Kamu lulus</h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          {GRADUATION.TRADES} trade di Stage 3 dengan Disiplin minimal {GRADUATION.MIN_DISIPLIN}%. Yang dinilai sejak awal
          adalah rencanamu, bukan untungnya, dan rencanamu konsisten.
        </p>
      </Card>

      <Card className="sm:p-8">
        <h2 className="text-lg font-bold">Yang sudah kamu tunjukkan</h2>
        <p className="mt-1 text-sm text-muted-foreground">Dari trade-mu sendiri.</p>
        <ul className="mt-4 flex flex-col gap-2.5">
          {shown.map((line) => (
            <li key={line} className="flex items-start gap-2.5 text-sm leading-relaxed">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" /> {line}
            </li>
          ))}
        </ul>
      </Card>

      <Card className="sm:p-8">
        <h2 className="text-lg font-bold">Yang tidak bisa diajarkan demo</h2>
        <ul className="mt-4 flex flex-col gap-2.5">
          {DEMO_LIMITS.map((line) => (
            <li key={line} className="flex items-start gap-2.5 text-sm leading-relaxed">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" /> {line}
            </li>
          ))}
        </ul>
        <p className="mt-5 rounded-xl border border-dashed border-primary/50 bg-primary/5 px-4 py-3 text-sm leading-relaxed">
          Berapa banyak akun trader ritel yang rugi saat trading produk ber-leverage?{" "}
          <mark className="rounded bg-primary/15 px-1 font-mono text-[0.9em] text-primary">[ISI SUMBER + ANGKA RESMI]</mark>
        </p>
      </Card>

      <Card className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:p-8">
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold">Latihan tetap terbuka</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Akunmu, stage-mu dan jurnalmu tetap di sini. Kebiasaan yang baik bertahan karena diulang.
          </p>
        </div>
        <Link href={state.account ? "/akun-latihan/trading" : "/akun-latihan"} className="btn">
          Lanjut berlatih <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </Card>
    </div>
  )
}
