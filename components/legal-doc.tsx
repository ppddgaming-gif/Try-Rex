import type { ReactNode } from "react"
import { TriangleAlert } from "lucide-react"

// Legal pages are drafts until a lawyer has reviewed them. Every spot that
// needs a real value is marked with <Isi>, every claim that needs review with
// <Tinjau>, so they stand out on the page and are easy to grep for.

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

export function LegalDoc({ title, intro, children }: { title: string; intro: ReactNode; children: ReactNode }) {
  return (
    <article className="mx-auto max-w-3xl px-5 py-12 lg:px-8">
      <div
        role="note"
        className="flex items-start gap-3 rounded-2xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm leading-relaxed"
      >
        <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p>
          <strong>Draf, belum final.</strong> Dokumen ini belum ditinjau ahli hukum dan belum berlaku sebagai teks
          hukum resmi. Bagian bertanda [PERLU DIISI] atau [PERLU DITINJAU] masih harus dilengkapi.
        </p>
      </div>

      <p className="mt-8 font-mono text-xs text-faint">Draf per 29 September 2026</p>
      <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">{title}</h1>
      <div className="mt-4 text-base leading-relaxed text-muted-foreground">{intro}</div>

      <div className="mt-10 flex flex-col gap-10">{children}</div>
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
