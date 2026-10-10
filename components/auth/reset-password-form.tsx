"use client"

import { useActionState } from "react"
import { useTranslations } from "next-intl"
import { updatePassword, type FormState } from "@/lib/auth-actions"
import { MIN_PASSWORD } from "@/lib/auth-rules"
import { Field, FormError } from "@/components/auth/form-parts"

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(updatePassword, {})
  const t = useTranslations("auth")

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <FormError message={state.error} />
      <Field
        id="password"
        name="password"
        type="password"
        label={t("reset.newPassword")}
        autoComplete="new-password"
        required
        minLength={MIN_PASSWORD}
        hint={t("fields.minLength", { min: MIN_PASSWORD })}
      />
      <Field
        id="confirm"
        name="confirm"
        type="password"
        label={t("reset.repeat")}
        autoComplete="new-password"
        required
        minLength={MIN_PASSWORD}
      />
      <button type="submit" className="btn w-full" disabled={pending}>
        {pending ? t("reset.submitting") : t("reset.submit")}
      </button>
    </form>
  )
}
