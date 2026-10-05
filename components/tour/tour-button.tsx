"use client"

import Link from "next/link"
import { CircleHelp } from "lucide-react"
import { useTours } from "@/components/tour/tour-provider"

/**
 * The "?" button: replays the open page's tour, or opens /panduan on a page
 * without one. `sidebar` is the desktop row (it folds with the sidebar);
 * `bar` is the square button in the phone's top bar.
 */
export function TourButton({ variant, onNavigate }: { variant: "sidebar" | "bar"; onNavigate?: () => void }) {
  const tours = useTours()
  const tour = tours?.pageTour ?? null
  const label = tour ? `Putar tur ${tour.title}` : "Buka Panduan"

  const className =
    variant === "sidebar"
      ? "group relative flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      : "flex h-11 w-11 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:text-foreground"

  const content = (
    <>
      <CircleHelp className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
      {variant === "sidebar" && <span className="sb-label">{tour ? "Tur halaman ini" : "Panduan"}</span>}
    </>
  )

  if (!tour || !tours) {
    return (
      <Link
        href="/panduan"
        onClick={onNavigate}
        aria-label={label}
        data-tip="Panduan"
        data-tour={variant === "sidebar" ? "tour-help" : "tour-help-mobile"}
        className={className}
      >
        {content}
      </Link>
    )
  }
  return (
    <button
      type="button"
      onClick={() => {
        // Close the phone menu first; a tour never starts over an open one.
        onNavigate?.()
        requestAnimationFrame(() => tours.start(tour.id))
      }}
      aria-label={label}
      data-tip="Tur halaman ini"
      data-tour={variant === "sidebar" ? "tour-help" : "tour-help-mobile"}
      className={className}
    >
      {content}
    </button>
  )
}
