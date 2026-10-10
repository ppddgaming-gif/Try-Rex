import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import Link from "next/link"
import { SignupForm } from "@/components/auth/signup-form"

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("auth.signup"))("title") }
}

export default async function SignupPage() {
  const t = await getTranslations("auth.signup")
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-extrabold">{t("heading")}</h1>
        <p className="text-sm text-muted-foreground">{t("lead")}</p>
      </div>
      <SignupForm />
      <p className="text-center text-sm text-muted-foreground">
        {t("haveAccount")}{" "}
        <Link href="/login" className="inline-flex min-h-11 items-center font-semibold text-primary hover:text-primary-hi">
          {t("signIn")}
        </Link>
      </p>
    </div>
  )
}
