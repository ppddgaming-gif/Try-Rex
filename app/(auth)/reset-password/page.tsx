import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import Link from "next/link"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"
import { getCurrentUser } from "@/lib/auth"

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("auth.reset"))("title") }
}

// Reached from the reset email via /auth/callback, which signs the user in
// with a recovery session. Without that session there is nothing to update.
export default async function ResetPasswordPage() {
  const [user, t] = await Promise.all([getCurrentUser(), getTranslations("auth.reset")])

  if (!user) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-extrabold">{t("expiredTitle")}</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">{t("expiredBody")}</p>
        <Link href="/lupa-password" className="btn w-full">
          {t("requestNew")}
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-extrabold">{t("heading")}</h1>
        <p className="text-sm text-muted-foreground">{t("forAccount", { email: user.email ?? "" })}</p>
      </div>
      <ResetPasswordForm />
    </div>
  )
}
