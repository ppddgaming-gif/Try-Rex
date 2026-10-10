"use client"

import { useActionState, useState } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { signup, type FormState } from "@/lib/auth-actions"
import { MIN_PASSWORD } from "@/lib/auth-rules"
import { EmailSent, Field, FormError } from "@/components/auth/form-parts"

export function SignupForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(signup, {})
  const [agreed, setAgreed] = useState(false)
  const t = useTranslations("auth")

  if (state.sent) {
    return (
      <EmailSent title={t("signup.sentTitle")}>
        <p>{t.rich("signup.sentBody", { email: state.email ?? "", b: (c) => <strong className="text-foreground">{c}</strong> })}</p>
        <p className="mt-3 text-faint">{t("signup.sentSpam")}</p>
      </EmailSent>
    )
  }

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <FormError message={state.error} />
      <Field id="name" name="name" label={t("signup.name")} autoComplete="name" required maxLength={60} />
      <Field
        id="email"
        name="email"
        type="email"
        label={t("fields.email")}
        autoComplete="email"
        inputMode="email"
        required
        defaultValue={state.email}
      />
      <Field
        id="password"
        name="password"
        type="password"
        label={t("fields.password")}
        autoComplete="new-password"
        required
        minLength={MIN_PASSWORD}
        hint={t("fields.minLength", { min: MIN_PASSWORD })}
      />

      {/* The whole row is the tap target, not just the 20px box. */}
      <label className="flex min-h-11 cursor-pointer items-start gap-3 text-sm leading-relaxed text-muted-foreground">
        <input
          type="checkbox"
          name="agree"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 h-5 w-5 shrink-0 accent-primary"
        />
        <span>
          {t.rich("signup.agree", {
            privacy: (c) => (
              <Link href="/privacy" target="_blank" className="font-semibold text-primary underline-offset-2 hover:underline">
                {c}
              </Link>
            ),
            terms: (c) => (
              <Link href="/terms" target="_blank" className="font-semibold text-primary underline-offset-2 hover:underline">
                {c}
              </Link>
            ),
          })}
        </span>
      </label>

      <button type="submit" className="btn w-full" disabled={!agreed || pending}>
        {pending ? t("signup.submitting") : t("signup.submit")}
      </button>
    </form>
  )
}
