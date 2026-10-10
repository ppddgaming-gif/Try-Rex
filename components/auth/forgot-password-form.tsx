"use client"

import { useActionState } from "react"
import { useTranslations } from "next-intl"
import { requestPasswordReset, type FormState } from "@/lib/auth-actions"
import { EmailSent, Field, FormError } from "@/components/auth/form-parts"

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(requestPasswordReset, {})
  const t = useTranslations("auth")

  if (state.sent) {
    // Same wording whether or not the address has an account, so the page
    // can't be used to check who is registered.
    return (
      <EmailSent title={t("forgot.sentTitle")}>
        <p>{t.rich("forgot.sentBody", { email: state.email ?? "", b: (c) => <strong className="text-foreground">{c}</strong> })}</p>
      </EmailSent>
    )
  }

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <FormError message={state.error} />
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
      <button type="submit" className="btn w-full" disabled={pending}>
        {pending ? t("forgot.submitting") : t("forgot.submit")}
      </button>
    </form>
  )
}
