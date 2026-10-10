import Link from "next/link"
import { useTranslations } from "next-intl"
import { ArrowRight, BookOpen, Wallet } from "lucide-react"
import { Card } from "@/components/card"
import { Disclosure } from "@/components/disclosure"
import { Rex } from "@/components/rex-mascot"
import { AccountActionButton } from "@/components/akun-latihan/account-actions"
import { RequiredLesson } from "@/components/akun-latihan/intro-lesson"
import { DISIPLIN } from "@/lib/demo/config"
import { checkLabel } from "@/lib/demo/disiplin"
import { lot, pct, usd } from "@/lib/demo/format"
import type { PublicLesson } from "@/lib/demo/lessons"
import { reviewAdvice } from "@/lib/demo/rex-comments"
import type { AccountReview } from "@/lib/demo/stats"

/**
 * What's left of the account's life, in order: "close" (it ran out and is
 * still open), "lesson" (the risk lesson is due), "open" (the next account).
 */
export type EndStep = "close" | "lesson" | "open"

/**
 * The end of an account: Rex's review from its own trades, then the next
 * step. After running out the risk lesson is required; after a reset it's
 * optional. There is no way to add money, only a new account.
 */
export function AccountEnd({
  number,
  ending,
  review,
  step,
  lesson,
  startingBalance,
}: {
  number: number
  ending: "habis" | "reset"
  review: AccountReview
  step: EndStep
  lesson: PublicLesson
  startingBalance: string
}) {
  const next = number + 1
  const t = useTranslations("demo.ui.end")
  const root = useTranslations()
  const title =
    ending === "habis"
      ? t("titleHabis", { n: number, trades: review.trades })
      : review.trades === 0
        ? t("titleResetNone", { n: number })
        : t("titleReset", { n: number, trades: review.trades })

  return (
    <div className="flex flex-col gap-5">
      <Card className="glow-card sm:p-8">
        <div className="flex items-start gap-4">
          <Rex size={64} mood="thinking" className="hidden shrink-0 sm:block" />
          <div className="min-w-0 flex-1">
            <p className="eyebrow">{t("eyebrow")}</p>
            <h2 className="mt-2 text-2xl font-bold">{title}</h2>
            <p className="mt-2 text-muted-foreground">
              {ending === "habis" ? t("bodyHabis") : t("bodyReset")}
            </p>
          </div>
        </div>

        {review.trades === 0 ? (
          <p className="mt-5 rounded-xl bg-inset px-4 py-3 text-sm text-muted-foreground">{t("noTrades")}</p>
        ) : (
          <>
            <dl className="mt-6 grid gap-3 sm:grid-cols-2">
              <Item label={t("biggestLoss")}>
                {review.biggestLoss ? (
                  <>
                    <span className="font-mono text-lg font-bold text-danger">{usd(review.biggestLoss.amount)}</span>
                    <span className="block text-xs text-muted-foreground">
                      {t("lossTrade", {
                        n: review.biggestLoss.number,
                        side: review.biggestLoss.side.toUpperCase(),
                        pair: review.biggestLoss.pair,
                        lot: lot(review.biggestLoss.lot),
                      })}
                    </span>
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground">{t("noLoss")}</span>
                )}
              </Item>
              <Item label={t("avgRisk")}>
                <span className="font-mono text-lg font-bold">
                  {review.avgRiskPct === null ? "—" : t("riskValue", { risk: pct(review.avgRiskPct) })}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {t("limit", { n: DISIPLIN.MAX_RISK_PCT })}
                  {review.withoutSl > 0 && t("noSlUnlimited", { n: review.withoutSl })}
                </span>
              </Item>
              <Item label={t("mostFailed")}>
                {review.failed.length === 0 ? (
                  <span className="text-sm text-muted-foreground">{t("allPassed")}</span>
                ) : (
                  <ul className="flex flex-col gap-1 text-sm">
                    {review.failed.map((f) => (
                      <li key={f.id}>
                        {checkLabel(f.id, root)}{" "}
                        <span className="font-mono text-xs text-muted-foreground">
                          {t("failedCount", { count: f.count, trades: review.trades })}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </Item>
              <Item label={t("revenge")}>
                <span className="font-mono text-lg font-bold">{review.revenge === 0 ? t("none") : t("revengeCount", { n: review.revenge })}</span>
              </Item>
            </dl>
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/10 p-4">
              <Rex size={36} mood="neutral" className="shrink-0" />
              <p className="text-sm leading-relaxed">{reviewAdvice(review.failed[0]?.id ?? null, root)}</p>
            </div>
          </>
        )}

        <Link
          href={`/akun-latihan/jurnal?akun=${number}`}
          className="mt-5 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
        >
          {t("viewJournal", { n: number })} <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </Card>

      {step === "close" && (
        <Card className="sm:p-8">
          <h2 className="text-lg font-bold">{t("nextTitle")}</h2>
          <p className="mt-2 text-muted-foreground">{t("nextBody", { next, balance: startingBalance })}</p>
          <div className="mt-5">
            <AccountActionButton action="close" label={t("toLesson")} icon={<BookOpen className="h-5 w-5" aria-hidden="true" />} />
          </div>
        </Card>
      )}

      {step === "lesson" && <RequiredLesson lesson={lesson} doneLabel={t("toNewAccount")} />}

      {step === "open" && (
        <>
          <Card className="flex flex-col items-center py-10 text-center sm:p-10">
            <Rex size={80} mood="happy" className="float" />
            <h2 className="mt-4 text-2xl font-bold">{t("readyTitle", { next })}</h2>
            <p className="mt-2 max-w-md text-muted-foreground">{t("readyBody", { balance: startingBalance, n: number })}</p>
            <div className="mt-6">
              <AccountActionButton action="open" label={t("open", { next })} icon={<Wallet className="h-5 w-5" aria-hidden="true" />} large />
            </div>
          </Card>
          {ending === "reset" && (
            // One flex child: a closed Disclosure has no height, but a gap would still reserve its slot.
            <div className="flex flex-col">
              <Disclosure
                label={t("optionalLesson")}
                closeLabel={t("closeLesson")}
                className="pb-5"
                triggerClassName=""
              >
                <RequiredLesson lesson={lesson} optional />
              </Disclosure>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function Item({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-inset px-4 py-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1">{children}</dd>
    </div>
  )
}
