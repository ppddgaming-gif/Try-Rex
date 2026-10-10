"use client"

import { useActionState } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { login, type FormState } from "@/lib/auth-actions"
import { Field, FormError } from "@/components/auth/form-parts"

export function LoginForm({ next, initialError }: { next: string; initialError?: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(login, { error: initialError })
  const t = useTranslations("auth")

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <input type="hidden" name="next" value={next} />
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
        aria-invalid={Boolean(state.error)}
      />
      <div className="flex flex-col gap-1">
        <Field
          id="password"
          name="password"
          type="password"
          label={t("fields.password")}
          autoComplete="current-password"
          required
          aria-invalid={Boolean(state.error)}
        />
        <Link
          href="/lupa-password"
          className="inline-flex min-h-11 items-center self-end text-sm font-semibold text-primary hover:text-primary-hi"
        >
          {t("login.forgot")}
        </Link>
      </div>
      <button type="submit" className="btn w-full" disabled={pending}>
        {pending ? t("login.submitting") : t("login.submit")}
      </button>
    </form>
  )
}
