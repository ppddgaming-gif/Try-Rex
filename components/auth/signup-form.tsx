"use client"

import { useActionState, useState } from "react"
import Link from "next/link"
import { signup, type FormState } from "@/lib/auth-actions"
import { MIN_PASSWORD } from "@/lib/auth-rules"
import { EmailSent, Field, FormError } from "@/components/auth/form-parts"

export function SignupForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(signup, {})
  const [agreed, setAgreed] = useState(false)

  if (state.sent) {
    return (
      <EmailSent title="Cek email kamu untuk konfirmasi">
        <p>
          Kami mengirim link konfirmasi ke <strong className="text-foreground">{state.email}</strong>. Buka link itu
          di browser ini untuk mengaktifkan akunmu.
        </p>
        <p className="mt-3 text-faint">Tidak ada di kotak masuk? Cek folder spam atau promosi.</p>
      </EmailSent>
    )
  }

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <FormError message={state.error} />
      <Field id="name" name="name" label="Nama" autoComplete="name" required maxLength={60} />
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
      <Field
        id="password"
        name="password"
        type="password"
        label="Password"
        autoComplete="new-password"
        required
        minLength={MIN_PASSWORD}
        hint={`Minimal ${MIN_PASSWORD} karakter.`}
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
          Saya setuju dengan{" "}
          <Link href="/privacy" target="_blank" className="font-semibold text-primary underline-offset-2 hover:underline">
            Kebijakan Privasi
          </Link>{" "}
          dan{" "}
          <Link href="/terms" target="_blank" className="font-semibold text-primary underline-offset-2 hover:underline">
            Syarat &amp; Ketentuan
          </Link>
        </span>
      </label>

      <button type="submit" className="btn w-full" disabled={!agreed || pending}>
        {pending ? "Memproses…" : "Daftar"}
      </button>
    </form>
  )
}
