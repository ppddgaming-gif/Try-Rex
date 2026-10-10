import type { Metadata } from "next"
import Link from "next/link"
import { KeyRound, Mail, Palette, Route, UserRound } from "lucide-react"
import { useTranslations } from "next-intl"
import { getTranslations } from "next-intl/server"
import { AvatarUploader } from "@/components/account/avatar-uploader"
import { EmailForm, PasswordForm, ProfileForm } from "@/components/account/account-forms"
import { Card } from "@/components/card"
import { Rex } from "@/components/rex-mascot"
import { AppearanceSettings } from "@/components/settings/appearance-settings"
import { SettingsTabs } from "@/components/settings/settings-tabs"
import { TrainingPlan } from "@/components/settings/training-plan"
import { getCurrentUser } from "@/lib/auth"

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("settings"))("title") }
}

/**
 * Settings, as tabs: Tampilan (theme, font, text size, motion, sidebar) for
 * everyone; Profil and Keamanan for accounts; Latihan for the plan and reset.
 * Open to guests, whose account tabs invite them to sign in.
 */
export default async function SettingsPage() {
  const [user, t] = await Promise.all([getCurrentUser(), getTranslations("settings")])
  const icon = "h-4 w-4"

  return (
    <div className="mx-auto max-w-3xl px-5 py-6 lg:px-8">
      <header className="enter">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("lead")}</p>
      </header>

      <div className="enter mt-6" style={{ "--enter-delay": "60ms" } as React.CSSProperties}>
        <SettingsTabs
          label={t("tabs.label")}
          tabs={[
            { id: "tampilan", label: t("tabs.tampilan"), icon: <Palette className={icon} />, panel: <AppearanceSettings /> },
            {
              id: "profil",
              label: t("tabs.profil"),
              icon: <UserRound className={icon} />,
              panel: user ? (
                <Card className="sm:p-7">
                  <h2 className="mb-5 text-base font-semibold">{t("photoAndName")}</h2>
                  <AvatarUploader userId={user.id} name={user.displayName} src={user.avatarUrl} disabled={!user.profileExtras} />
                  <div className="mt-6 border-t border-border pt-6">
                    <ProfileForm name={user.displayName} username={user.username} disabledUsername={!user.profileExtras} />
                  </div>
                </Card>
              ) : (
                <SignInPrompt what={t("signIn.profile")} />
              ),
            },
            {
              id: "keamanan",
              label: t("tabs.keamanan"),
              icon: <KeyRound className={icon} />,
              panel: user ? (
                <>
                  <Card className="sm:p-7">
                    <h2 className="mb-5 flex items-center gap-2 text-base font-semibold">
                      <Mail className="h-4 w-4 text-primary" aria-hidden="true" /> {t("email")}
                    </h2>
                    <EmailForm current={user.email} />
                  </Card>
                  <Card className="sm:p-7">
                    <h2 className="mb-5 flex items-center gap-2 text-base font-semibold">
                      <KeyRound className="h-4 w-4 text-primary" aria-hidden="true" /> {t("password")}
                    </h2>
                    <PasswordForm />
                  </Card>
                </>
              ) : (
                <SignInPrompt what={t("signIn.security")} />
              ),
            },
            {
              id: "latihan",
              label: t("tabs.latihan"),
              icon: <Route className={icon} />,
              panel: <TrainingPlan serverRecord={user ? user.onboarding : undefined} />,
            },
          ]}
        />
      </div>
    </div>
  )
}

function SignInPrompt({ what }: { what: string }) {
  const t = useTranslations("settings.signIn")
  return (
    <Card className="glow-card flex flex-col items-center py-10 text-center sm:p-10">
      <Rex size={72} mood="thinking" className="float" />
      <h2 className="mt-4 text-lg font-bold">{t("title")}</h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{t("body", { what })}</p>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <Link href="/login?next=/pengaturan" className="btn btn-sm">
          {t("signIn")}
        </Link>
        <Link href="/signup" className="btn btn-ghost btn-sm">
          {t("signUp")}
        </Link>
      </div>
    </Card>
  )
}
