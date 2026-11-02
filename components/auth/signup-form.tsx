"use client"

import { useActionState, useState } from "react"
import { useTranslations } from "next-intl"
import { signup, type FormState } from "@/lib/auth-actions"
import { MIN_PASSWORD } from "@/lib/auth-rules"
import { AgreeField, EmailSent, Field, FormError } from "@/components/auth/form-parts"
import { SocialButtons } from "@/components/auth/social-buttons"

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
    <div className="flex flex-col gap-5">
      <SocialButtons next="/dashboard" />
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

        <AgreeField checked={agreed} onChange={setAgreed} />

        <button type="submit" className="btn w-full" disabled={!agreed || pending}>
          {pending ? t("signup.submitting") : t("signup.submit")}
        </button>
      </form>
    </div>
  )
}
