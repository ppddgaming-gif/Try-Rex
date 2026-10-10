import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import Link from "next/link"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("auth.forgot"))("title") }
}

export default async function ForgotPasswordPage() {
  const t = await getTranslations("auth.forgot")
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-extrabold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("lead")}</p>
      </div>
      <ForgotPasswordForm />
      <p className="text-center text-sm text-muted-foreground">
        {t("remember")}{" "}
        <Link href="/login" className="inline-flex min-h-11 items-center font-semibold text-primary hover:text-primary-hi">
          {t("back")}
        </Link>
      </p>
    </div>
  )
}
