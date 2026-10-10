import { FlaskConical } from "lucide-react"
import { useTranslations } from "next-intl"
import type { Source } from "@/lib/learn/types"

/**
 * Belajar 101 is mock content until reputable sources are added. This note
 * says so on every page, the way the legal drafts carry [PERLU DIISI].
 */
export function DraftNote() {
  const t = useTranslations("learn.draft")
  return (
    <p
      role="note"
      className="flex items-start gap-3 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm leading-relaxed"
    >
      <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
      <span>
        <strong>{t("title")}</strong> <span className="text-muted-foreground">{t("body")}</span>
      </span>
    </p>
  )
}

/** The sources section at the foot of a lesson, with needed ones flagged. */
export function SourceList({ sources }: { sources: Source[] }) {
  const t = useTranslations("learn.draft")
  return (
    <section aria-labelledby="sumber" className="rounded-2xl border border-border bg-card p-5">
      <h2 id="sumber" className="font-display text-base font-bold">
        {t("sources")}
      </h2>
      <ul className="mt-3 flex flex-col gap-2 text-sm">
        {sources.map((s, i) =>
          s.status === "added" ? (
            <li key={i} className="text-muted-foreground">
              <a href={s.url} target="_blank" rel="noreferrer" className="font-semibold text-primary hover:text-primary-hi">
                {s.title}
              </a>
              {t("accessed", { publisher: s.publisher, date: s.accessed })}
            </li>
          ) : (
            <li key={i}>
              <mark className="rounded bg-primary/15 px-1 font-mono text-[0.85em] text-primary">[PERLU SUMBER]</mark>{" "}
              <span className="text-muted-foreground">{s.note}</span>
            </li>
          ),
        )}
      </ul>
    </section>
  )
}
