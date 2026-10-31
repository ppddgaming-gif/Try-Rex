import { FileText, FlaskConical } from "lucide-react"
import { useTranslations } from "next-intl"
import type { Source } from "@/lib/learn/types"

/** The glossary's definitions are still draft copy; this note says so on the Kamus page. */
export function DraftNote() {
  const t = useTranslations("learn.draft")
  return (
    <p role="note" className="flex items-start gap-3 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm leading-relaxed">
      <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
      <span>
        <strong>{t("title")}</strong> <span className="text-muted-foreground">{t("body")}</span>
      </span>
    </p>
  )
}

/** The foot of a lesson: the handouts it is taken from, and the references they list. */
export function SourceList({ material, sources }: { material: string[]; sources: Source[] }) {
  const t = useTranslations("learn.sources")
  return (
    <section aria-labelledby="sumber" className="rounded-2xl border border-border bg-card p-5">
      <h2 id="sumber" className="font-display text-base font-bold">
        {t("title")}
      </h2>
      <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-faint">{t("material")}</p>
      <ul className="mt-1 flex flex-col gap-1 text-sm text-muted-foreground">
        {material.map((m) => (
          <li key={m} className="flex items-start gap-2">
            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" /> {m.replace(/\.pdf$/i, "")}
          </li>
        ))}
      </ul>
      {sources.length > 0 && (
        <>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-faint">{t("references")}</p>
          <ul className="mt-1 flex flex-col gap-1 text-sm text-muted-foreground">
            {sources.map((s, i) => (
              <li key={i}>
                {s.url ? (
                  <a href={s.url} target="_blank" rel="noreferrer" className="font-semibold text-primary hover:text-primary-hi">
                    {s.title}
                  </a>
                ) : (
                  <span className="font-semibold text-foreground/85">{s.title}</span>
                )}
                {s.publisher && <span>, {s.publisher}</span>}
              </li>
            ))}
          </ul>
        </>
      )}
      <p className="mt-4 text-xs leading-relaxed text-faint">{t("disclaimer")}</p>
    </section>
  )
}
