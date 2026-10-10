"use client"

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { BookOpen, X } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import type { Locale } from "@/lib/i18n/locale"
import { glossaryBySlug, splitTerms, type TextPart } from "@/lib/glossary"

// One popover open at a time across the page.
const OPEN_EVENT = "tryrex:glossary-open"

/**
 * Text with its trading terms underlined. Tapping one explains it in a small
 * card, without leaving the page. `lang` is the language the text is written
 * in (default: the page's), which decides which spellings are matched.
 */
export function GlossaryText({ text, lang }: { text: string; lang?: Locale }) {
  const locale = useLocale() as Locale
  return <GlossaryParts parts={splitTerms(text, lang ?? locale)} />
}

/**
 * Pre-split text (from splitTerms). A server component can split a whole
 * article with one shared `seen` set, so each term is linked once per
 * article rather than once per paragraph, and pass the parts down.
 */
export function GlossaryParts({ parts }: { parts: TextPart[] }) {
  return (
    <>
      {parts.map((p, i) =>
        typeof p === "string" ? (
          p
        ) : (
          <Term key={i} slug={p.slug}>
            {p.text}
          </Term>
        ),
      )}
    </>
  )
}

const WIDTH = 300
const GAP = 8

export function Term({ slug, children }: { slug: string; children: string }) {
  const entry = glossaryBySlug.get(slug)
  const t = useTranslations("glossary")
  const [open, setOpen] = useState(false)
  const button = useRef<HTMLButtonElement>(null)
  const card = useRef<HTMLDivElement>(null)
  const id = useId()

  // Place the card under the word, flipped above when there's no room, and
  // kept inside the viewport horizontally. Written straight to the DOM before
  // paint: it needs the card's measured height, and state would re-render.
  useLayoutEffect(() => {
    const el = card.current
    if (!open || !button.current || !el) return
    const r = button.current.getBoundingClientRect()
    const h = el.offsetHeight
    const above = r.bottom + GAP + h > window.innerHeight && r.top - GAP - h > 0
    const left = Math.min(Math.max(12, r.left + r.width / 2 - WIDTH / 2), window.innerWidth - WIDTH - 12)
    el.style.left = `${left}px`
    el.style.top = `${above ? r.top - GAP - h : r.bottom + GAP}px`
    el.style.transformOrigin = above ? "bottom" : "top"
    el.style.visibility = "visible"
  }, [open])

  useEffect(() => {
    if (!open) return
    const onOther = (e: Event) => {
      if ((e as CustomEvent).detail !== id) setOpen(false)
    }
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node
      if (!card.current?.contains(t) && !button.current?.contains(t)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false)
        button.current?.focus()
      }
    }
    const onMove = () => setOpen(false)
    window.addEventListener(OPEN_EVENT, onOther)
    document.addEventListener("pointerdown", onDown)
    document.addEventListener("keydown", onKey)
    window.addEventListener("scroll", onMove, { passive: true, capture: true })
    window.addEventListener("resize", onMove)
    return () => {
      window.removeEventListener(OPEN_EVENT, onOther)
      document.removeEventListener("pointerdown", onDown)
      document.removeEventListener("keydown", onKey)
      window.removeEventListener("scroll", onMove, { capture: true })
      window.removeEventListener("resize", onMove)
    }
  }, [open, id])

  if (!entry) return <>{children}</>

  function toggle() {
    const next = !open
    if (next) {
      window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: id }))
    }
    setOpen(next)
  }

  return (
    <>
      <button
        ref={button}
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          toggle()
        }}
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        aria-label={t("seeMeaning", { term: children })}
        className="term inline font-[inherit] text-[length:inherit] leading-[inherit]"
      >
        {children}
      </button>
      {open &&
        createPortal(
          <div
            ref={card}
            id={id}
            role="dialog"
            aria-label={t(`entries.${slug}.term`)}
            className="glass-card glass-strong pop fixed z-[80] rounded-2xl p-4 text-left"
            // Hidden until the layout effect has placed it.
            style={{ width: WIDTH, left: 0, top: 0, visibility: "hidden" }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                  {t(`categories.${entry.category}`)}
                </p>
                <p className="mt-0.5 font-display text-lg font-bold leading-tight">{t(`entries.${slug}.term`)}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t("close")}
                className="-m-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-foreground/90">{t(`entries.${slug}.short`)}</p>
            {entry.example && (
              <p className="mt-2 rounded-lg bg-inset px-3 py-2 text-xs leading-relaxed text-muted-foreground">
                <span className="font-semibold text-foreground">{t("example")}</span>
                {t(`entries.${slug}.example`)}
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold">
              {entry.lesson && (
                <Link href={`/belajar/${entry.lesson}`} className="inline-flex min-h-8 items-center gap-1 text-primary hover:text-primary-hi">
                  <BookOpen className="h-3.5 w-3.5" /> {t("lesson")}
                </Link>
              )}
              <Link href={`/belajar/kamus#${entry.slug}`} className="inline-flex min-h-8 items-center text-muted-foreground hover:text-foreground">
                {t("openKamus")}
              </Link>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
