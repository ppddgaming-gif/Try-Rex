import type { ReactNode } from "react"
import { Languages, TriangleAlert } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"

// Legal pages are drafts until a lawyer has reviewed them. Every spot that
// needs a real value is marked with <Isi>, every claim that needs review with
// <Tinjau>, so they stand out on the page and are easy to grep for.
//
// The documents themselves are Indonesian only: a legal text shouldn't be
// machine-translated before review. In English the page chrome is
// translated and the body is shown in Indonesian under a label, marked
// lang="id".

/** A value that must be filled in before launch. */
export function Isi({ children }: { children: ReactNode }) {
  return (
    <mark className="rounded bg-primary/15 px-1 font-mono text-[0.9em] text-primary">[PERLU DIISI: {children}]</mark>
  )
}

/** A statement that needs legal review before launch. */
export function Tinjau({ children }: { children?: ReactNode }) {
  return (
    <mark className="rounded bg-primary/15 px-1 font-mono text-[0.9em] text-primary">
      [PERLU DITINJAU{children ? <>: {children}</> : null}]
    </mark>
  )
}

/** The date the drafts were written, shown in the reader's language. */
const DRAFT_DATE = new Date(Date.UTC(2026, 8, 29))

export function LegalDoc({
  doc,
  intro,
  children,
}: {
  /** legal.titles.<doc> */
  doc: "privacy" | "terms" | "disclaimer"
  intro: ReactNode
  children: ReactNode
}) {
  const t = useTranslations("legal")
  const locale = useLocale()
  const date = new Intl.DateTimeFormat(locale === "en" ? "en-US" : "id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(DRAFT_DATE)
  return (
    <article className="mx-auto max-w-3xl px-5 py-12 lg:px-8">
      <div
        role="note"
        className="flex items-start gap-3 rounded-2xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm leading-relaxed"
      >
        <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p>
          <strong>{t("draftTitle")}</strong> {t("draftBody")}
        </p>
      </div>
      {locale !== "id" && (
        <div
          role="note"
          className="mt-3 flex items-start gap-3 rounded-2xl border border-wait/30 bg-wait/10 px-4 py-3 text-sm leading-relaxed"
        >
          <Languages className="mt-0.5 h-4 w-4 shrink-0 text-wait" aria-hidden="true" />
          <p>
            <strong>{t("notTranslated")}</strong> <span className="text-muted-foreground">{t("notTranslatedBody")}</span>
          </p>
        </div>
      )}

      <p className="mt-8 font-mono text-xs text-faint">{t("draftDate", { date })}</p>
      <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">{t(`titles.${doc}`)}</h1>
      <div lang="id">
        <div className="mt-4 text-base leading-relaxed text-muted-foreground">{intro}</div>

        <div className="mt-10 flex flex-col gap-10">{children}</div>
      </div>
    </article>
  )
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-extrabold">{title}</h2>
      <div className="flex flex-col gap-3 text-[15px] leading-relaxed text-muted-foreground [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-foreground [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1.5">
        {children}
      </div>
    </section>
  )
}
