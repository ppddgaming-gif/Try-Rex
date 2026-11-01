import type { Metadata } from "next"
import { getLocale, getTranslations } from "next-intl/server"
import Link from "next/link"
import { Card } from "@/components/card"
import { SessionsLockedCard } from "@/components/akun-latihan/locked-card"
import { EvaluationPicker, type PickerMonth } from "@/components/evaluation/evaluation-picker"
import { EmptyState } from "@/components/progress/empty-state"
import { llmConfigured } from "@/lib/ai/groq"
import { getCurrentUser } from "@/lib/auth"
import { AI_EVAL } from "@/lib/demo/config"
import { monthLabel } from "@/lib/demo/evaluation"
import { accountNumbers, loadEntries, quotaOf } from "@/lib/demo/evaluation-server"
import { getAccess } from "@/lib/demo/server"
import { INTL_LOCALE, type Locale } from "@/lib/i18n/locale"

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("evaluation"))("title") }
}

/**
 * AI Evaluation: only the journal entries (closed Akun Latihan trades) not
 * evaluated yet, by month. The player picks entries from one month and asks
 * for one evaluation; the result is saved and shown in the Journal, and the
 * entries leave this list. Every rule is checked again on the server.
 * `?trade=<id>` (from a closed trade) or `?month=YYYY-MM` (from the Journal)
 * arrive with those entries already picked.
 */
export default async function AiEvaluationPage({ searchParams }: { searchParams: Promise<{ trade?: string; month?: string }> }) {
  const [t, locale, user] = await Promise.all([getTranslations("evaluation"), getLocale() as Promise<Locale>, getCurrentUser()])

  const shell = (body: React.ReactNode) => (
    <div className="mx-auto max-w-5xl px-5 py-6 lg:px-8">
      <header>
        <p className="eyebrow">{t("eyebrow")}</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{t("title")}</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{t("lead", { n: AI_EVAL.MAX_PER_RUN })}</p>
      </header>
      <div className="mt-6">{body}</div>
    </div>
  )

  if (!user) {
    return shell(
      <Card>
        <EmptyState
          mood="explain"
          title={t("signInTitle")}
          body={t("signInBody")}
          action={
            <Link href="/login?next=/ai-evaluation" className="btn btn-sm">
              {t("signIn")}
            </Link>
          }
        />
      </Card>,
    )
  }

  // The journal comes from the Demo Account, which opens after the Trading
  // Game sessions: show how far along the player is instead of an empty list.
  const access = await getAccess(user.id)
  if (!access.open) {
    return shell(
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">{t("lockedLead")}</p>
        <SessionsLockedCard unlock={access.unlock} />
      </div>,
    )
  }

  const entries = await loadEntries(user.id)
  if (!entries) return shell(<Card><EmptyState mood="thinking" title={t("notReadyTitle")} body={t("errors.notReady")} /></Card>)

  const [numbers, quota] = await Promise.all([accountNumbers(user.id), quotaOf(user.id).catch(() => null)])
  const dayFmt = new Intl.DateTimeFormat(INTL_LOCALE[locale], { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" })

  const months = new Map<string, PickerMonth>()
  for (const e of entries) {
    if (e.evaluated) continue
    const m = months.get(e.month) ?? { month: e.month, label: monthLabel(e.month, INTL_LOCALE[locale]), entries: [] }
    m.entries.push({
      id: e.trade.id,
      number: e.trade.number,
      account: numbers.get(e.accountId) ?? null,
      pair: e.trade.pair,
      side: e.trade.side,
      lot: e.trade.lot,
      closed: t("closedAt", { time: dayFmt.format(new Date(e.closedAt)) }),
      review: e.trade.review,
      note: e.trade.reviewNote,
      complete: e.complete,
    })
    months.set(e.month, m)
  }

  if (months.size === 0) {
    return shell(
      <Card>
        <EmptyState
          mood="happy"
          title={t("emptyTitle")}
          body={entries.length ? t("emptyAllDone") : t("emptyNoTrades")}
          action={
            <Link href={entries.length ? "/akun-latihan/jurnal" : "/akun-latihan/trading"} className="btn btn-sm">
              {entries.length ? t("toJournal") : t("toDemo")}
            </Link>
          }
        />
      </Card>,
    )
  }

  // Entries picked on arrival: the one closed trade, or a month's written
  // entries up to the run's size. Only ids on this page can be picked.
  const { trade, month } = await searchParams
  const waiting = [...months.values()].flatMap((m) => m.entries.map((e) => ({ ...e, month: m.month })))
  const initial = trade
    ? waiting.filter((e) => e.id === trade).map((e) => e.id)
    : waiting.filter((e) => e.month === month && e.complete).slice(0, AI_EVAL.MAX_PER_RUN).map((e) => e.id)
  const unwritten = waiting.filter((e) => !e.complete).length

  return shell(
    <EvaluationPicker
      months={[...months.values()].sort((a, b) => b.month.localeCompare(a.month))}
      initial={initial}
      unwritten={unwritten}
      quota={quota ? { ...quota, resetLabel: dayFmt.format(new Date(quota.resetAt)) } : null}
      maxPerRun={AI_EVAL.MAX_PER_RUN}
      aiReady={llmConfigured()}
    />,
  )
}
