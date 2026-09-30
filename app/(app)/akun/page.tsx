import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { KeyRound, Mail, RotateCcw, Route, UserRound } from "lucide-react"
import { AvatarUploader } from "@/components/account/avatar-uploader"
import { EmailForm, PasswordForm, ProfileForm } from "@/components/account/account-forms"
import { Card } from "@/components/card"
import { ResetProgress } from "@/components/progress/reset-progress"
import { getCurrentUser } from "@/lib/auth"
import { LEVEL_LABELS, QUESTIONS, answerLabel, planFrom } from "@/lib/onboarding"

export const metadata: Metadata = { title: "Akun" }

export default async function AccountPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login?next=/akun")

  const plan = planFrom(user.onboarding)

  return (
    <div className="mx-auto max-w-3xl px-5 py-6 lg:px-8">
      <header className="enter">
        <h1 className="text-2xl font-bold tracking-tight">Akun</h1>
        <p className="mt-1 text-sm text-muted-foreground">Atur profil, email, password, dan jalur latihanmu.</p>
      </header>

      {!user.profileExtras && (
        <p role="note" className="mt-6 rounded-2xl border border-primary/30 bg-primary/10 p-4 text-sm leading-relaxed">
          <strong>Foto dan username belum aktif.</strong>{" "}
          <span className="text-muted-foreground">
            Server masih perlu satu pembaruan database. Nama, email, dan password sudah bisa diubah.
          </span>
        </p>
      )}

      <div className="mt-6 flex flex-col gap-4">
        <Section icon={UserRound} title="Profil" delay={40}>
          <AvatarUploader userId={user.id} name={user.displayName} src={user.avatarUrl} disabled={!user.profileExtras} />
          <div className="mt-6 border-t border-border pt-6">
            <ProfileForm name={user.displayName} username={user.username} disabledUsername={!user.profileExtras} />
          </div>
        </Section>

        <Section icon={Route} title="Jalur latihan" delay={80}>
          {user.onboarding && !user.onboarding.skipped ? (
            <dl className="grid gap-3 sm:grid-cols-2">
              <PlanItem label="Mulai di tingkat" value={LEVEL_LABELS[plan.level]} />
              <PlanItem
                label="Target harian"
                value={plan.dailyGoal ? `${plan.dailyGoal} soal` : "Tanpa target"}
              />
              {QUESTIONS.filter((q) => q.id === "focus" || q.id === "experience").map((q) => (
                <PlanItem
                  key={q.id}
                  label={q.id === "focus" ? "Fokus pair" : "Pengalaman"}
                  value={answerLabel(q.id, user.onboarding?.answers[q.id]) ?? "—"}
                />
              ))}
            </dl>
          ) : (
            <p className="text-sm text-muted-foreground">
              {user.onboarding?.skipped
                ? "Kamu melewati kuis awal, jadi latihan memakai pengaturan standar."
                : "Kamu belum mengisi kuis awal."}
            </p>
          )}
          <Link href="/start?ulang=1&next=/akun" className="btn btn-ghost btn-sm mt-5">
            <RotateCcw className="h-4 w-4" /> Ulangi kuis awal
          </Link>
        </Section>

        <Section icon={Mail} title="Email" delay={120}>
          <EmailForm current={user.email} />
        </Section>

        <Section icon={KeyRound} title="Password" delay={160}>
          <PasswordForm />
        </Section>

        <div className="mt-4 flex justify-center border-t border-border pt-4">
          <ResetProgress />
        </div>
      </div>
    </div>
  )
}

function Section({
  icon: Icon,
  title,
  delay,
  children,
}: {
  icon: React.ElementType
  title: string
  delay: number
  children: React.ReactNode
}) {
  return (
    <Card className="enter sm:p-7" style={{ "--enter-delay": `${delay}ms` } as React.CSSProperties}>
      <h2 className="mb-5 flex items-center gap-2 text-base font-semibold">
        <Icon className="h-4 w-4 text-primary" aria-hidden="true" /> {title}
      </h2>
      {children}
    </Card>
  )
}

function PlanItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-inset px-4 py-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-semibold">{value}</dd>
    </div>
  )
}
