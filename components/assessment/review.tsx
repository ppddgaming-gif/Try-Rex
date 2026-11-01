"use client"

import Link from "next/link"
import { CheckCircle2, CircleMinus, XCircle } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { ScenarioChart } from "@/components/assessment/scenario-chart"
import { Disclosure } from "@/components/disclosure"
import type { Aspect } from "@/lib/assessment/grade"
import type { McqReview, Report, ScenarioReview } from "@/lib/assessment/report"
import type { PublicMcq, PublicPackage, PublicScenario } from "@/lib/assessment/types"
import type { Marker } from "@/lib/chart-geometry"
import { INTL_LOCALE, type Locale } from "@/lib/i18n/locale"

const ASPECTS: Aspect[] = ["risk", "sl", "tp", "decision", "management"]

/** Scores in the reader's number format (67,6 in Indonesian). */
function useNum() {
  const locale = useLocale() as Locale
  const f = new Intl.NumberFormat(INTL_LOCALE[locale], { maximumFractionDigits: 2 })
  return (v: number) => f.format(v)
}

/**
 * The end of a package: per-aspect feedback, the Learn 101 levels to revisit,
 * then every item with its key and explanation. What price did is shown as
 * one sample and is never part of the score. No ranking.
 */
export function Review({ pkg, report }: { pkg: PublicPackage; report: Report }) {
  const t = useTranslations("assessment.review")
  const tl = useTranslations("assessment")
  const num = useNum()

  return (
    <div className="flex flex-col gap-6">
      <section className="glow-card rounded-2xl border border-border p-6">
        <p className="eyebrow">{t("eyebrow")}</p>
        <h2 className="mt-2 font-display text-2xl font-bold">{t("title")}</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{t("principle")}</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Stat label={t("scenarios")} value={num(report.scenarios.average)} suffix="/100" note={t("scenariosNote", { n: report.scenarios.count })} />
          <Stat label={t("complex")} value={num(report.complex.score)} suffix={`/${report.complex.max}`} note={t("complexNote")} />
          <Stat label={t("basic")} value={num(report.basic.score)} suffix={`/${report.basic.max}`} note={t("basicNote")} />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="font-display text-lg font-bold">{t("aspects")}</h3>
          <ul className="mt-3 flex flex-col gap-3">
            {ASPECTS.map((a) => {
              const s = report.aspects[a]
              const pct = s ? Math.round((s.points / s.max) * 100) : null
              return (
                <li key={a}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span>{tl(`aspects.${a}`)}</span>
                    <span className="font-mono tabular-nums text-muted-foreground">{pct === null ? "—" : `${pct}%`}</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-inset" aria-hidden="true">
                    <div className="h-full origin-left rounded-full bg-primary" style={{ transform: `scaleX(${(pct ?? 0) / 100})` }} />
                  </div>
                </li>
              )
            })}
          </ul>
          <p className="mt-3 text-xs text-faint">{t("aspectsNote")}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="font-display text-lg font-bold">{t("levels")}</h3>
          <ul className="mt-3 flex flex-col gap-2">
            {report.levels.map((l) => (
              <li key={l.level} className="flex items-center justify-between gap-3 rounded-xl bg-inset px-3 py-2 text-sm">
                <span>{t("level", { n: l.level })}</span>
                <span className="flex items-center gap-2">
                  <span className="font-mono tabular-nums text-muted-foreground">
                    {num(l.earned)}/{l.possible}
                  </span>
                  <span className={["rounded-full px-2 py-0.5 text-xs font-semibold", l.revisit ? "bg-primary/15 text-primary" : "bg-wait/15 text-wait"].join(" ")}>
                    {l.revisit ? t("revisit") : t("fine")}
                  </span>
                </span>
              </li>
            ))}
          </ul>
          <Link href="/belajar" className="mt-3 inline-block text-sm font-semibold text-primary underline-offset-4 hover:underline">
            {t("toLearn")}
          </Link>
        </div>
      </section>

      <ol className="flex flex-col gap-4">
        {report.items.map((r, i) => {
          const item = pkg.items.find((x) => x.id === r.id)
          if (!item) return null
          return (
            <li key={r.id}>
              {r.type === "scenario" ? (
                <ScenarioCard n={i + 1} item={item as PublicScenario} r={r} pkg={pkg} />
              ) : (
                <McqCard n={i + 1} item={item as PublicMcq} r={r} />
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function Stat({ label, value, suffix, note }: { label: string; value: string; suffix: string; note: string }) {
  return (
    <div className="rounded-xl bg-inset p-4">
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-3xl font-bold tabular-nums">
        {value}
        <span className="text-base text-muted-foreground">{suffix}</span>
      </p>
      <p className="mt-1 text-xs text-faint">{note}</p>
    </div>
  )
}

function ScenarioCard({ n, item, r, pkg }: { n: number; item: PublicScenario; r: ScenarioReview; pkg: PublicPackage }) {
  const t = useTranslations("assessment.review")
  const ts = useTranslations("assessment.scenario")
  const tl = useTranslations("assessment")
  const locale = useLocale() as Locale
  const num = useNum()
  const fmt = (p: number) => p.toFixed(item.digits)
  const money = (v: number) => new Intl.NumberFormat(INTL_LOCALE[locale], { style: "currency", currency: "USD", currencyDisplay: "narrowSymbol", signDisplay: "exceptZero" }).format(v)
  const d = r.decision
  const trade = d.action !== "no_trade"
  const markers: Marker[] = []
  if (trade) {
    if (r.fill) markers.push({ price: r.fill.p, label: ts("lineEntry"), variant: "neutral" })
    else if (d.price !== undefined) markers.push({ price: d.price, label: ts("linePending"), variant: "neutral" })
    if (d.sl !== undefined) markers.push({ price: d.sl, label: "SL", variant: "danger" })
    if (d.tp !== undefined) markers.push({ price: d.tp, label: "TP", variant: "success" })
  }
  const ideal = r.ideal.action === "no_trade" ? ts("actions.no_trade") : `${ts(`actions.${r.ideal.action}`)} · ${ts(`orderTypes.${r.ideal.entry ?? "market"}`)}`
  const aspects = ASPECTS.filter((a) => r.score.aspects[a])
  const m = r.score.measures

  return (
    <article className="rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-xs text-faint">
            {t("number", { n })} · {item.pair.slice(0, 3)}/{item.pair.slice(3)} {item.timeframe}
          </p>
          <h3 className="mt-1 font-display text-lg font-bold leading-snug">{item.title[locale]}</h3>
        </div>
        <p className="font-mono text-2xl font-bold tabular-nums">
          {num(r.score.total)}
          <span className="text-sm text-muted-foreground">/100</span>
        </p>
      </div>

      <dl className="mt-3 grid gap-x-4 gap-y-1 text-sm sm:grid-cols-2">
        <dt className="text-muted-foreground">{t("you")}</dt>
        <dd>
          {trade
            ? ts("decisionLine", { action: ts(`actions.${d.action}`), type: ts(`orderTypes.${d.entry ?? "market"}`), lot: d.lot ?? 0, sl: fmt(d.sl ?? 0), tp: fmt(d.tp ?? 0) })
            : ts("actions.no_trade")}
        </dd>
        <dt className="text-muted-foreground">{t("ideal")}</dt>
        <dd>
          {ideal}
          {r.ideal.acceptable.length > 0 && <span className="text-muted-foreground"> · {t("acceptable", { list: r.ideal.acceptable.map((a) => ts(`actions.${a}`)).join(", ") })}</span>}
        </dd>
        <dt className="text-muted-foreground">{t("reasons")}</dt>
        <dd>
          <ul className="flex flex-col gap-0.5">
            {d.reasons.map((x) => (
              <li key={x} className="flex items-start gap-1.5">
                {r.validReasons.includes(x) ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-label={t("validReason")} />
                ) : (
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-label={t("invalidReason")} />
                )}
                <span>{pkg.reasons[x]?.[locale] ?? x}</span>
              </li>
            ))}
          </ul>
        </dd>
        {m.riskPct !== null && (
          <>
            <dt className="text-muted-foreground">{t("measures")}</dt>
            <dd className="font-mono text-xs tabular-nums">{t("measureLine", { risk: m.riskPct, sl: m.slPips ?? 0, atr: m.slAtr ?? 0, rr: m.rr ?? 0 })}</dd>
          </>
        )}
      </dl>

      <ul className="mt-4 flex flex-col gap-3">
        {aspects.map((a) => {
          const s = r.score.aspects[a]!
          return (
            <li key={a} className="rounded-xl bg-inset p-3">
              <div className="flex items-baseline justify-between gap-3 text-sm font-semibold">
                <span>{r.score.mode === "no_trade" && a === "decision" ? t("decisionAndReasons") : tl(`aspects.${a}`)}</span>
                <span className="font-mono tabular-nums">
                  {num(s.points)}/{s.max}
                </span>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-foreground/90">{r.feedback[a][locale]}</p>
            </li>
          )
        })}
      </ul>
      {r.score.mode === "decision_only" && <p className="mt-2 text-xs text-muted-foreground">{t("decisionOnly")}</p>}

      <Disclosure label={t("showChart")} closeLabel={t("hideChart")} className="mt-4">
        <div className="mt-3 flex flex-col gap-2">
          <div className="h-[260px] rounded-xl border border-border bg-inset p-2 sm:h-[340px]">
            <ScenarioChart bars={r.candles} startAt={r.context} digits={item.digits} markers={markers} startLabel={ts("startLine")} locale={locale} />
          </div>
          <p className="text-sm text-muted-foreground">
            {r.exit ? ts(`exit.${r.exit.why}`, { price: fmt(r.exit.p) }) : trade ? ts("position.unfilled") : t("noPosition")}
            {r.pnl !== null && <span className={["ml-2 font-mono tabular-nums", r.pnl >= 0 ? "text-success" : "text-danger"].join(" ")}>{money(r.pnl)}</span>}
          </p>
          <p className="text-xs text-faint">{t("oneSample")}</p>
        </div>
      </Disclosure>
    </article>
  )
}

function McqCard({ n, item, r }: { n: number; item: PublicMcq; r: McqReview }) {
  const t = useTranslations("assessment.review")
  const locale = useLocale() as Locale
  const num = useNum()
  const full = r.score === 1
  const Icon = full ? CheckCircle2 : r.score > 0 ? CircleMinus : XCircle
  return (
    <article className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="font-mono text-xs text-faint">
          {t("number", { n })} · {t("level", { n: r.level })}
        </p>
        <span className="flex items-center gap-1.5 font-mono text-sm tabular-nums">
          <Icon className={["h-4 w-4", full ? "text-success" : r.score > 0 ? "text-primary" : "text-danger"].join(" ")} aria-hidden="true" />
          {num(r.score)}/1
        </span>
      </div>
      <h3 className="mt-1 font-display text-base font-bold leading-snug sm:text-lg">{item.question[locale]}</h3>
      <ul className="mt-3 flex flex-col gap-2">
        {item.options.map((o) => {
          const right = r.correct.includes(o.id)
          const picked = r.chosen.includes(o.id)
          return (
            <li
              key={o.id}
              className={[
                "rounded-xl border px-3 py-2 text-sm",
                right ? "border-success bg-success/10" : picked ? "border-danger bg-danger/10" : "border-border",
              ].join(" ")}
            >
              <div className="flex items-start gap-2">
                {right ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-label={t("right")} />
                ) : picked ? (
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-label={t("wrong")} />
                ) : (
                  <span className="h-4 w-4 shrink-0" aria-hidden="true" />
                )}
                <span className="flex-1">
                  {o.text[locale]}
                  {picked && <span className="ml-2 text-xs font-semibold text-muted-foreground">{t("picked")}</span>}
                </span>
              </div>
              {r.explanations[o.id] && <p className="mt-1 pl-6 text-xs leading-relaxed text-muted-foreground">{r.explanations[o.id][locale]}</p>}
            </li>
          )
        })}
      </ul>
      {r.explanation && <p className="mt-3 rounded-xl bg-inset px-4 py-3 text-sm leading-relaxed">{r.explanation[locale]}</p>}
      {r.lesson.title && (
        <Link href={`/belajar/${r.lesson.slug}`} className="mt-3 inline-block text-sm font-semibold text-primary underline-offset-4 hover:underline">
          {t("lesson", { title: r.lesson.title[locale] })}
        </Link>
      )}
    </article>
  )
}
