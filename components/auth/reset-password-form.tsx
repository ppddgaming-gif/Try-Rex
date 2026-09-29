"use client"

import { useActionState } from "react"
import { updatePassword, type FormState } from "@/lib/auth-actions"
import { MIN_PASSWORD } from "@/lib/auth-rules"
import { Field, FormError } from "@/components/auth/form-parts"

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(updatePassword, {})

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <FormError message={state.error} />
      <Field
        id="password"
        name="password"
        type="password"
        label="Password baru"
        autoComplete="new-password"
        required
        minLength={MIN_PASSWORD}
        hint={`Minimal ${MIN_PASSWORD} karakter.`}
      />
      <Field
        id="confirm"
        name="confirm"
        type="password"
        label="Ulangi password baru"
        autoComplete="new-password"
        required
        minLength={MIN_PASSWORD}
      />
      <button type="submit" className="btn w-full" disabled={pending}>
        {pending ? "Menyimpan…" : "Simpan password baru"}
      </button>
    </form>
  )
}
