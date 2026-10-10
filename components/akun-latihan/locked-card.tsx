import Link from "next/link"
import { Lock, LineChart } from "lucide-react"
import { useTranslations } from "next-intl"
import { Card } from "@/components/card"
import { Rex } from "@/components/rex-mascot"
import type { Unlock } from "@/lib/demo/access"

/** Guests: sign in first. */
export function GuestLockedCard() {
  const t = useTranslations("demo.ui.locked")
  return (
    <Card className="glow-card flex flex-col items-center py-12 text-center sm:p-12">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 ring-1 ring-primary/30">
        <Lock className="h-6 w-6 text-primary" aria-hidden="true" />
      </span>
      <h2 className="mt-5 text-xl font-bold">{t("guestTitle")}</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{t("guestBody")}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/login?next=/akun-latihan" className="btn btn-sm">
          {t("signIn")}
        </Link>
        <Link href="/signup" className="btn btn-ghost btn-sm">
          {t("signUp")}
        </Link>
      </div>
    </Card>
  )
}

/** Signed in, but the Trading Game sessions aren't done yet. */
export function SessionsLockedCard({ unlock }: { unlock: Unlock }) {
  const t = useTranslations("demo.ui.locked")
  const td = useTranslations("demo")
  const counts = { sessions: unlock.sessions, needed: unlock.needed }
  return (
    <Card className="glow-card flex flex-col items-center py-12 text-center sm:p-12">
      <Rex size={84} mood="thinking" className="float" />
      <h2 className="mt-5 text-xl font-bold">{t("sessionsTitle")}</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{td("unlock.hint", counts)}</p>

      <ol className="mt-6 flex gap-2" aria-label={t("sessionsAria", counts)}>
        {Array.from({ length: unlock.needed }, (_, i) => (
          <li
            key={i}
            aria-hidden="true"
            className={`h-2 w-12 rounded-full ${i < unlock.sessions ? "bg-primary" : "bg-inset ring-1 ring-border"}`}
          />
        ))}
      </ol>
      <p className="mt-2 font-mono text-xs text-muted-foreground">
        {t("sessionsCount", counts)}
      </p>

      <Link href="/trading-game" className="btn mt-6">
        <LineChart className="h-4 w-4" /> {t("play")}
      </Link>
      <p className="mt-3 max-w-sm text-xs text-faint">{t("oneSession")}</p>
    </Card>
  )
}
