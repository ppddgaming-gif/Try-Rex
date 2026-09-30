"use client"

import { useState, type InputHTMLAttributes, type ReactNode } from "react"
import { CircleAlert, Eye, EyeOff, MailCheck } from "lucide-react"

/**
 * Labelled text input. 48px tall so it clears the 44px tap target, and 16px
 * text so iOS doesn't zoom the page on focus. A password field gets a
 * show/hide toggle, so a typo can be caught before submitting.
 */
export function Field({
  label,
  hint,
  id,
  type,
  ...input
}: { label: string; hint?: string; id: string } & InputHTMLAttributes<HTMLInputElement>) {
  const [reveal, setReveal] = useState(false)
  const password = type === "password"

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={password && reveal ? "text" : type}
          aria-describedby={hint ? `${id}-hint` : undefined}
          className={[
            "h-12 w-full rounded-xl border border-border bg-inset px-4 text-base text-foreground transition-colors placeholder:text-faint hover:border-faint",
            password ? "pr-12" : "",
          ].join(" ")}
          {...input}
        />
        {password && (
          <button
            type="button"
            onClick={() => setReveal((v) => !v)}
            aria-label={reveal ? "Sembunyikan password" : "Tampilkan password"}
            aria-pressed={reveal}
            aria-controls={id}
            className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-muted-foreground transition-colors hover:text-foreground"
          >
            <span key={reveal ? "hide" : "show"} className="icon-swap flex">
              {reveal ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </span>
          </button>
        )}
      </div>
      {hint && (
        <p id={`${id}-hint`} className="text-xs text-faint">
          {hint}
        </p>
      )}
    </div>
  )
}

/** Error line announced to screen readers as soon as it appears. */
export function FormError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p
      role="alert"
      className="flex items-start gap-2 rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-foreground"
    >
      <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
      {message}
    </p>
  )
}

/** Shown in place of a form once an email has gone out. */
export function EmailSent({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div role="status" className="flex flex-col items-center gap-4 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/12 text-primary">
        <MailCheck className="h-7 w-7" />
      </span>
      <h1 className="text-2xl font-extrabold">{title}</h1>
      <div className="text-sm leading-relaxed text-muted-foreground">{children}</div>
    </div>
  )
}
