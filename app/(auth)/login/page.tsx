import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import Link from "next/link"
import { LoginForm } from "@/components/auth/login-form"
import { safeNext } from "@/lib/auth-rules"

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("auth.login"))("title") }
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams
  const t = await getTranslations("auth.login")

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-extrabold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("lead")}</p>
      </div>
      <LoginForm next={safeNext(next)} initialError={error === "link" ? t("linkError") : undefined} />
      <p className="text-center text-sm text-muted-foreground">
        {t("noAccount")}{" "}
        <Link href="/signup" className="inline-flex min-h-11 items-center font-semibold text-primary hover:text-primary-hi">
          {t("signUp")}
        </Link>
      </p>
      {/* The game is open to guests, so an account is never a wall. */}
      <div className="flex items-center gap-3 text-xs text-faint">
        <span className="h-px flex-1 bg-border" />
        {t("or")}
        <span className="h-px flex-1 bg-border" />
      </div>
      <Link href="/trading-game" className="btn btn-ghost w-full">
        {t("playAsGuest")}
      </Link>
    </div>
  )
}
