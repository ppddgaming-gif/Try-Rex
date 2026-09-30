import type { Metadata } from "next"
import Link from "next/link"
import { KeyRound, Mail, Palette, Route, UserRound } from "lucide-react"
import { AvatarUploader } from "@/components/account/avatar-uploader"
import { EmailForm, PasswordForm, ProfileForm } from "@/components/account/account-forms"
import { Card } from "@/components/card"
import { Rex } from "@/components/rex-mascot"
import { AppearanceSettings } from "@/components/settings/appearance-settings"
import { SettingsTabs } from "@/components/settings/settings-tabs"
import { TrainingPlan } from "@/components/settings/training-plan"
import { getCurrentUser } from "@/lib/auth"

export const metadata: Metadata = { title: "Pengaturan" }

/**
 * Settings, as tabs: Tampilan (theme, font, text size, motion, sidebar) for
 * everyone; Profil and Keamanan for accounts; Latihan for the plan and reset.
 * Open to guests, whose account tabs invite them to sign in.
 */
export default async function SettingsPage() {
  const user = await getCurrentUser()
  const icon = "h-4 w-4"

  return (
    <div className="mx-auto max-w-3xl px-5 py-6 lg:px-8">
      <header className="enter">
        <h1 className="text-2xl font-bold tracking-tight">Pengaturan</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Atur tampilan, profil, keamanan, dan jalur latihanmu. Tampilan tersimpan di perangkat ini.
        </p>
      </header>

      <div className="enter mt-6" style={{ "--enter-delay": "60ms" } as React.CSSProperties}>
        <SettingsTabs
          tabs={[
            { id: "tampilan", label: "Tampilan", icon: <Palette className={icon} />, panel: <AppearanceSettings /> },
            {
              id: "profil",
              label: "Profil",
              icon: <UserRound className={icon} />,
              panel: user ? (
                <Card className="sm:p-7">
                  <h2 className="mb-5 text-base font-semibold">Foto dan nama</h2>
                  <AvatarUploader userId={user.id} name={user.displayName} src={user.avatarUrl} disabled={!user.profileExtras} />
                  <div className="mt-6 border-t border-border pt-6">
                    <ProfileForm name={user.displayName} username={user.username} disabledUsername={!user.profileExtras} />
                  </div>
                </Card>
              ) : (
                <SignInPrompt what="mengatur foto, nama, dan username" />
              ),
            },
            {
              id: "keamanan",
              label: "Keamanan",
              icon: <KeyRound className={icon} />,
              panel: user ? (
                <>
                  <Card className="sm:p-7">
                    <h2 className="mb-5 flex items-center gap-2 text-base font-semibold">
                      <Mail className="h-4 w-4 text-primary" aria-hidden="true" /> Email
                    </h2>
                    <EmailForm current={user.email} />
                  </Card>
                  <Card className="sm:p-7">
                    <h2 className="mb-5 flex items-center gap-2 text-base font-semibold">
                      <KeyRound className="h-4 w-4 text-primary" aria-hidden="true" /> Password
                    </h2>
                    <PasswordForm />
                  </Card>
                </>
              ) : (
                <SignInPrompt what="mengganti email dan password" />
              ),
            },
            {
              id: "latihan",
              label: "Latihan",
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
  return (
    <Card className="glow-card flex flex-col items-center py-10 text-center sm:p-10">
      <Rex size={72} mood="thinking" className="float" />
      <h2 className="mt-4 text-lg font-bold">Masuk dulu, yuk</h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">Kamu perlu akun untuk {what}. Gratis, dan progresmu ikut tersimpan.</p>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <Link href="/login?next=/pengaturan" className="btn btn-sm">
          Masuk
        </Link>
        <Link href="/signup" className="btn btn-ghost btn-sm">
          Daftar gratis
        </Link>
      </div>
    </Card>
  )
}
