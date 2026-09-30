"use client"

import { useDeferredValue, useState } from "react"
import Link from "next/link"
import { BookOpen, Search, X } from "lucide-react"
import { EmptyState } from "@/components/progress/empty-state"
import { CATEGORY_LABELS, GLOSSARY, type GlossaryCategory } from "@/lib/glossary"

const CATEGORIES = Object.keys(CATEGORY_LABELS) as GlossaryCategory[]

/** Searchable, filterable glossary. Each entry is an #anchor, so the term popovers can link straight to it. */
export function GlossaryBrowser() {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<GlossaryCategory | "all">("all")
  const q = useDeferredValue(query.trim().toLowerCase())

  const shown = GLOSSARY.filter(
    (e) =>
      (category === "all" || e.category === category) &&
      (!q || e.term.toLowerCase().includes(q) || e.aliases.some((a) => a.includes(q)) || e.short.toLowerCase().includes(q)),
  ).sort((a, b) => a.term.localeCompare(b.term, "id"))

  return (
    <div>
      <div className="glass-card glass-strong sticky top-[4.5rem] z-10 flex flex-col gap-3 rounded-2xl p-3 lg:top-4">
        <label className="relative block">
          <span className="sr-only">Cari istilah</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari: support, leverage, stablecoin…"
            className="h-12 w-full rounded-xl border border-border bg-inset pl-11 pr-11 text-base placeholder:text-faint"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Hapus pencarian"
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </label>
        <div role="radiogroup" aria-label="Kategori" className="flex gap-2 overflow-x-auto pb-0.5">
          {(["all", ...CATEGORIES] as const).map((c) => {
            const on = category === c
            return (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setCategory(c)}
                className={[
                  "min-h-9 shrink-0 rounded-full border px-3.5 text-sm font-semibold transition-colors",
                  on ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                {c === "all" ? "Semua" : CATEGORY_LABELS[c]}
              </button>
            )
          })}
        </div>
      </div>

      <p className="mt-4 text-xs text-faint" aria-live="polite">
        <span className="font-mono">{shown.length}</span> istilah
      </p>

      {shown.length === 0 ? (
        <EmptyState icon={Search} title="Tidak ketemu" body={`Belum ada istilah untuk "${query}". Coba kata lain.`} />
      ) : (
        <dl className="mt-3 grid gap-3 sm:grid-cols-2">
          {shown.map((e) => (
            <div
              key={e.slug}
              id={e.slug}
              className="term-card scroll-mt-40 rounded-2xl border border-border bg-card p-5 transition-colors"
            >
              <dt className="flex items-baseline justify-between gap-3">
                <span className="font-display text-lg font-bold">{e.term}</span>
                <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wider text-primary">
                  {CATEGORY_LABELS[e.category]}
                </span>
              </dt>
              <dd className="mt-2 text-sm leading-relaxed text-foreground/85">{e.short}</dd>
              {e.example && (
                <dd className="mt-2 rounded-lg bg-inset px-3 py-2 text-xs leading-relaxed text-muted-foreground">
                  <span className="font-semibold text-foreground">Contoh: </span>
                  {e.example}
                </dd>
              )}
              {e.lesson && (
                <dd className="mt-3">
                  <Link href={`/belajar/${e.lesson}`} className="inline-flex min-h-8 items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-hi">
                    <BookOpen className="h-3.5 w-3.5" /> Pelajari materinya
                  </Link>
                </dd>
              )}
            </div>
          ))}
        </dl>
      )}
    </div>
  )
}
