import Link from "next/link"
import { ArrowRight, BrainCircuit, LineChart } from "lucide-react"
import { useTranslations } from "next-intl"
import { Card } from "@/components/card"
import type { Unlock } from "@/lib/demo/access"

/**
 * Dashboard card: what's waiting for AI Evaluation, counted on the server
 * from the player's own journal. Before the Demo Account opens it says how
 * far along the unlock is; with nothing waiting it shows "—" and the way to
 * get there, never a big 0.
 */
export function EvaluationCard({ open, unlock, counts }: { open: boolean; unlock: Unlock; counts: { ready: number; needNote: number } }) {
  const t = useTranslations("evaluation.card")

  let body: React.ReactNode
  if (!open) {
    body = (
      <>
        <p className="mt-4 font-mono text-2xl font-bold text-faint">—</p>
        <p className="mt-1 text-sm text-muted-foreground">{t("lockedHint", { sessions: unlock.sessions, needed: unlock.needed })}</p>
        <Link href="/trading-game" className="btn btn-sm btn-ghost mt-4 self-start">
          <LineChart className="h-4 w-4" aria-hidden="true" /> {t("play")}
        </Link>
      </>
    )
  } else if (counts.ready > 0) {
    body = (
      <>
        <p className="mt-4 font-mono text-2xl font-bold">{counts.ready}</p>
        <p className="mt-1 text-sm text-muted-foreground">{t("ready", { n: counts.ready })}</p>
        <Link href="/ai-evaluation" className="btn btn-sm mt-4 self-start">
          {t("evaluate")} <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </>
    )
  } else if (counts.needNote > 0) {
    body = (
      <>
        <p className="mt-4 font-mono text-2xl font-bold text-faint">—</p>
        <p className="mt-1 text-sm text-muted-foreground">{t("needNote", { n: counts.needNote })}</p>
        <Link href="/akun-latihan/jurnal" className="btn btn-sm btn-ghost mt-4 self-start">
          {t("writeNote")}
        </Link>
      </>
    )
  } else {
    body = (
      <>
        <p className="mt-4 font-mono text-2xl font-bold text-faint">—</p>
        <p className="mt-1 text-sm text-muted-foreground">{t("emptyHint")}</p>
      </>
    )
  }

  return (
    <Card className="flex flex-col">
      <h2 className="flex items-center gap-2 text-base font-semibold">
        <BrainCircuit className="h-4 w-4 text-primary" aria-hidden="true" /> {t("title")}
      </h2>
      {body}
    </Card>
  )
}
