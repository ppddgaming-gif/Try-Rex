import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { redirect } from "next/navigation"
import { ConsentForm } from "@/components/auth/consent-form"
import { signOut } from "@/lib/auth-actions"
import { getCurrentUser } from "@/lib/auth"
import { safeNext } from "@/lib/auth-rules"

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("auth.consent"))("title") }
}

/**
 * The agreement for an account made with Google or GitHub, which skips the
 * sign-up form. The app layout and /start send such accounts here until it is
 * accepted.
 */
export default async function ConsentPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const [{ next }, user, t] = await Promise.all([searchParams, getCurrentUser(), getTranslations("auth.consent")])
  if (!user) redirect("/login")
  if (user.consented) redirect(safeNext(next))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-extrabold">{t("heading", { name: user.displayName })}</h1>
        <p className="text-sm text-muted-foreground">{t("lead")}</p>
      </div>
      <ConsentForm next={safeNext(next)} />
      <form action={signOut} className="text-center">
        <button type="submit" className="inline-flex min-h-11 items-center text-sm font-semibold text-muted-foreground hover:text-foreground">
          {t("signOut")}
        </button>
      </form>
    </div>
  )
}
