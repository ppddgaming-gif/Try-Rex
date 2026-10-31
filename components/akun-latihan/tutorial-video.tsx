"use client"

import { useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { CheckCircle2, PlayCircle, X } from "lucide-react"
import { usePostJson } from "@/components/akun-latihan/post-json"
import { TUTORIAL_VIDEO } from "@/lib/live/config"
import type { Locale } from "@/lib/i18n/locale"

/**
 * The drawing tools' tutorial, shown on the trading screen until the player
 * marks it watched (stored in demo_tips_seen as TUTORIAL_VIDEO.id), in the
 * page's language. Without a recording for that language the player shows a
 * placeholder. "Tonton tutorial" brings it back afterwards.
 */
export function TutorialVideo({ seen: initialSeen }: { seen: boolean }) {
  const t = useTranslations("demo.ui.video")
  const postJson = usePostJson()
  const locale = useLocale() as Locale
  const src = TUTORIAL_VIDEO.src?.[locale] ?? null
  const [seen, setSeen] = useState(initialSeen)
  const [open, setOpen] = useState(!initialSeen)

  function markWatched() {
    if (!seen) void postJson("/api/akun-latihan/tips", { tip: TUTORIAL_VIDEO.id })
    setSeen(true)
    setOpen(false)
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 items-center gap-1.5 self-start rounded-lg px-2 text-sm font-semibold text-primary hover:bg-primary/10"
      >
        <PlayCircle className="h-4 w-4" aria-hidden="true" /> {t("reopen")}
        {seen && <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground" aria-label={t("watched")} />}
      </button>
    )
  }

  return (
    <section aria-labelledby="tutorial-title" className="glass-card w-full max-w-xl rounded-2xl p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">{t("eyebrow")}</p>
          <h2 id="tutorial-title" className="mt-1 font-display text-lg font-bold">
            {t("title")}
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label={t("close")}
          className="-m-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-3 aspect-video w-full overflow-hidden rounded-xl border border-border bg-inset">
        {src ? (
          // Only the first frame and duration load with the page; the rest streams when played.
          <video key={src} src={src} controls playsInline preload="metadata" onEnded={markWatched} className="h-full w-full" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center text-sm text-muted-foreground">
            <PlayCircle className="h-10 w-10 text-faint" aria-hidden="true" />
            {t("comingSoon")}
          </div>
        )}
      </div>
      <button type="button" onClick={markWatched} className="btn btn-ghost btn-sm mt-3">
        <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> {seen ? t("close") : t("markWatched")}
      </button>
    </section>
  )
}
