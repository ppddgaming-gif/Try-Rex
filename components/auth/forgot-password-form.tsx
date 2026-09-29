"use client"

import { useActionState } from "react"
import { requestPasswordReset, type FormState } from "@/lib/auth-actions"
import { EmailSent, Field, FormError } from "@/components/auth/form-parts"

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(requestPasswordReset, {})

  if (state.sent) {
    // Same wording whether or not the address has an account, so the page
    // can't be used to check who is registered.
    return (
      <EmailSent title="Cek email kamu">
        <p>
          Kalau <strong className="text-foreground">{state.email}</strong> terdaftar, kami sudah mengirim link untuk
          membuat password baru. Buka link itu di browser ini.
        </p>
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
        label="Email"
        autoComplete="email"
        inputMode="email"
        required
        defaultValue={state.email}
      />
      <button type="submit" className="btn w-full" disabled={pending}>
        {pending ? "Mengirim…" : "Kirim link reset"}
      </button>
    </form>
  )
}
