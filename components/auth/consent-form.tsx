"use client"

import { useActionState, useState } from "react"
import { useTranslations } from "next-intl"
import { acceptPrivacy, type FormState } from "@/lib/auth-actions"
import { AgreeField, FormError } from "@/components/auth/form-parts"

/** The sign-up form's agreement, for an account made with Google or GitHub. */
export function ConsentForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(acceptPrivacy, {})
  const [agreed, setAgreed] = useState(false)
  const t = useTranslations("auth.consent")

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <input type="hidden" name="next" value={next} />
      <FormError message={state.error} />
      <AgreeField checked={agreed} onChange={setAgreed} />
      <button type="submit" className="btn w-full" disabled={!agreed || pending}>
        {pending ? t("submitting") : t("submit")}
      </button>
    </form>
  )
}
