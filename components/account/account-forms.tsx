"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { AtSign, Check, LoaderCircle, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { EmailSent, Field, FormError } from "@/components/auth/form-parts"
import { MIN_PASSWORD } from "@/lib/auth-rules"
import {
  changeEmail,
  changePassword,
  checkUsername,
  updateProfile,
  type ProfileFormState,
} from "@/lib/profile-actions"
import { USERNAME_RULE, normalizeUsername } from "@/lib/profile-rules"

/** Green confirmation line that fades in after a save. */
export function FormSaved({ show, children }: { show: boolean; children: React.ReactNode }) {
  if (!show) return null
  return (
    <p role="status" className="enter flex items-center gap-2 text-sm font-semibold text-success">
      <Check className="h-4 w-4" aria-hidden="true" /> {children}
    </p>
  )
}

type Availability = "idle" | "checking" | "free" | "taken" | "invalid"

/**
 * Name + username. The username is checked as you type (debounced), so a
 * taken name shows before you press save.
 */
export function ProfileForm({
  name,
  username,
  disabledUsername = false,
  submitLabel,
  onSaved,
}: {
  name: string
  username: string | null
  /** True when the server can't store usernames yet. */
  disabledUsername?: boolean
  submitLabel?: string
  onSaved?: () => void
}) {
  const [state, action, pending] = useActionState<ProfileFormState, FormData>(updateProfile, {})
  const t = useTranslations("settings.profile")
  const [value, setValue] = useState(username ?? "")
  // Only the server's answer is state; "checking" and "invalid" are derived.
  const [checked, setChecked] = useState<{ name: string; free: boolean | null } | null>(null)

  // Fire once per successful save. The callback lives in a ref so an inline
  // function from the parent doesn't re-trigger it on every render.
  const saved = useRef(onSaved)
  useEffect(() => {
    saved.current = onSaved
  })
  useEffect(() => {
    if (state.ok) saved.current?.()
  }, [state])

  const candidate = normalizeUsername(value)
  const needsCheck = Boolean(candidate) && candidate !== username && !disabledUsername
  const availability: Availability = !needsCheck
    ? "idle"
    : !USERNAME_RULE.test(candidate)
      ? "invalid"
      : checked?.name !== candidate
        ? "checking"
        : checked.free === null
          ? "idle"
          : checked.free
            ? "free"
            : "taken"

  // Ask the server 400ms after typing stops.
  useEffect(() => {
    if (!needsCheck || !USERNAME_RULE.test(candidate)) return
    let live = true
    const id = setTimeout(async () => {
      const free = await checkUsername(candidate)
      if (live) setChecked({ name: candidate, free })
    }, 400)
    return () => {
      live = false
      clearTimeout(id)
    }
  }, [candidate, needsCheck])

  const hint: Record<Availability, React.ReactNode> = {
    idle: t("usernameIdle"),
    checking: (
      <span className="flex items-center gap-1.5">
        <LoaderCircle className="h-3 w-3 animate-spin" /> {t("checking")}
      </span>
    ),
    free: (
      <span className="flex items-center gap-1.5 text-success">
        <Check className="h-3 w-3" /> {t("free")}
      </span>
    ),
    taken: (
      <span className="flex items-center gap-1.5 text-danger">
        <X className="h-3 w-3" /> {t("taken")}
      </span>
    ),
    invalid: t("invalid"),
  }

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <FormError message={state.error} />
      <Field id="name" name="name" label={t("displayName")} autoComplete="name" required maxLength={60} defaultValue={name} />
      <div className="flex flex-col gap-2">
        <label htmlFor="username" className="text-sm font-semibold">
          {t("username")}
        </label>
        <div className="relative">
          <AtSign className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" aria-hidden="true" />
          <input
            id="username"
            name="username"
            value={value}
            onChange={(e) => setValue(e.target.value.toLowerCase().replace(/\s/g, ""))}
            maxLength={21}
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            disabled={disabledUsername}
            aria-describedby="username-hint"
            aria-invalid={availability === "taken" || availability === "invalid"}
            placeholder="trader_rex"
            className="h-12 w-full rounded-xl border border-border bg-inset pl-10 pr-4 text-base text-foreground transition-colors placeholder:text-faint hover:border-faint disabled:opacity-50"
          />
        </div>
        <p id="username-hint" aria-live="polite" className="text-xs text-faint">
          {disabledUsername ? t("usernameDisabled") : hint[availability]}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" className="btn" disabled={pending || availability === "taken" || availability === "invalid"}>
          {pending ? t("saving") : (submitLabel ?? t("save"))}
        </button>
        <FormSaved show={Boolean(state.ok) && !pending}>{t("saved")}</FormSaved>
      </div>
    </form>
  )
}

export function EmailForm({ current }: { current: string | undefined }) {
  const [state, action, pending] = useActionState<ProfileFormState, FormData>(changeEmail, {})
  const t = useTranslations("settings.emailForm")
  const bold = (c: React.ReactNode) => <strong className="text-foreground">{c}</strong>

  if (state.sent) {
    return (
      <EmailSent title={t("sentTitle")}>
        <p>{t.rich("sentBody", { email: state.email ?? "", b: bold })}</p>
      </EmailSent>
    )
  }

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <p className="text-sm text-muted-foreground">
        {t.rich("current", { email: current ?? "—", b: (c) => <span className="font-semibold text-foreground">{c}</span> })}
      </p>
      <FormError message={state.error} />
      <Field
        id="email"
        name="email"
        type="email"
        label={t("newEmail")}
        autoComplete="email"
        inputMode="email"
        required
        defaultValue={state.email}
      />
      <button type="submit" className="btn btn-ghost self-start" disabled={pending}>
        {pending ? t("sending") : t("submit")}
      </button>
    </form>
  )
}

export function PasswordForm() {
  // React clears the uncontrolled fields itself once the action finishes.
  const [state, action, pending] = useActionState<ProfileFormState, FormData>(changePassword, {})
  const t = useTranslations("settings.passwordForm")
  const tf = useTranslations("auth.fields")

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <FormError message={state.error} />
      <Field id="current" name="current" type="password" label={t("current")} autoComplete="current-password" required />
      <Field
        id="new-password"
        name="password"
        type="password"
        label={t("new")}
        autoComplete="new-password"
        required
        minLength={MIN_PASSWORD}
        hint={tf("minLength", { min: MIN_PASSWORD })}
      />
      <Field id="confirm" name="confirm" type="password" label={t("repeat")} autoComplete="new-password" required />
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" className="btn btn-ghost" disabled={pending}>
          {pending ? t("saving") : t("submit")}
        </button>
        <FormSaved show={Boolean(state.ok) && !pending}>{t("saved")}</FormSaved>
      </div>
    </form>
  )
}
