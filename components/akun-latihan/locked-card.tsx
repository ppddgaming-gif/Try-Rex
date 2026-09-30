import Link from "next/link"
import { Lock, LineChart } from "lucide-react"
import { Card } from "@/components/card"
import { Rex } from "@/components/rex-mascot"
import type { Unlock } from "@/lib/demo/access"

/** Guests: sign in first. */
export function GuestLockedCard() {
  return (
    <Card className="glow-card flex flex-col items-center py-12 text-center sm:p-12">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 ring-1 ring-primary/30">
        <Lock className="h-6 w-6 text-primary" aria-hidden="true" />
      </span>
      <h2 className="mt-5 text-xl font-bold">Masuk untuk membuka Akun Latihan</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Akun Latihan menyimpan saldo virtual, trade, dan jurnalmu di akun, jadi kamu perlu masuk dulu.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/login?next=/akun-latihan" className="btn btn-sm">
          Masuk
        </Link>
        <Link href="/signup" className="btn btn-ghost btn-sm">
          Daftar gratis
        </Link>
      </div>
    </Card>
  )
}

/** Signed in, but the Trading Game sessions aren't done yet. */
export function SessionsLockedCard({ unlock }: { unlock: Unlock }) {
  return (
    <Card className="glow-card flex flex-col items-center py-12 text-center sm:p-12">
      <Rex size={84} mood="thinking" className="float" />
      <h2 className="mt-5 text-xl font-bold">Akun Latihan masih terkunci</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{unlock.hint}</p>

      <ol className="mt-6 flex gap-2" aria-label={`${unlock.sessions} dari ${unlock.needed} sesi selesai`}>
        {Array.from({ length: unlock.needed }, (_, i) => (
          <li
            key={i}
            aria-hidden="true"
            className={`h-2 w-12 rounded-full ${i < unlock.sessions ? "bg-primary" : "bg-inset ring-1 ring-border"}`}
          />
        ))}
      </ol>
      <p className="mt-2 font-mono text-xs text-muted-foreground">
        {unlock.sessions}/{unlock.needed} sesi
      </p>

      <Link href="/trading-game" className="btn mt-6">
        <LineChart className="h-4 w-4" /> Main Trading Game
      </Link>
      <p className="mt-3 max-w-sm text-xs text-faint">Satu sesi = satu ronde 5 soal, tercatat di akunmu.</p>
    </Card>
  )
}
