import type { InputHTMLAttributes, ReactNode } from "react"
import { CircleAlert, MailCheck } from "lucide-react"

/**
 * Labelled text input. 48px tall so it clears the 44px tap target, and 16px
 * text so iOS doesn't zoom the page on focus.
 */
export function Field({
  label,
  hint,
  id,
  ...input
}: { label: string; hint?: string; id: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      <input
        id={id}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className="h-12 w-full rounded-xl border border-border bg-inset px-4 text-base text-foreground placeholder:text-faint"
        {...input}
      />
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
