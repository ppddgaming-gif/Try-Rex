"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import { setLocale } from "@/lib/i18n/actions"
import { LOCALES, type Locale } from "@/lib/i18n/locale"

/**
 * ID | EN. Saves on the device and, when signed in, on the account
 * (lib/i18n/actions.ts), then re-renders the page in the new language.
 * `size="lg"` is the full-width version in Settings.
 */
export function LocaleSwitcher({ size = "sm", className = "" }: { size?: "sm" | "lg"; className?: string }) {
  const locale = useLocale() as Locale
  const t = useTranslations("common.language")
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const choose = (next: Locale) => {
    if (next === locale || pending) return
    startTransition(async () => {
      await setLocale(next)
      router.refresh()
    })
  }

  return (
    <div
      role="group"
      aria-label={t("label")}
      aria-busy={pending}
      className={[
        "inline-flex shrink-0 gap-0.5 rounded-xl border border-border bg-inset p-0.5",
        size === "lg" ? "w-full sm:w-auto" : "",
        pending ? "opacity-70" : "",
        className,
      ].join(" ")}
    >
      {LOCALES.map((l) => {
        const on = l === locale
        return (
          <button
            key={l}
            type="button"
            onClick={() => choose(l)}
            aria-pressed={on}
            lang={l}
            title={t(l)}
            className={[
              "flex min-h-11 items-center justify-center rounded-lg font-mono text-xs font-semibold uppercase tracking-wider transition-colors",
              size === "lg" ? "flex-1 px-5 sm:flex-none" : "min-w-11 px-2.5",
              on ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            <span aria-hidden="true">{l}</span>
            <span className="sr-only">{t(l)}</span>
          </button>
        )
      })}
    </div>
  )
}
