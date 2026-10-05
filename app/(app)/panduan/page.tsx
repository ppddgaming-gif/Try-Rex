import type { Metadata } from "next"
import { GuideList } from "@/components/tour/guide-list"
import { Rex } from "@/components/rex-mascot"
import { getCurrentUser } from "@/lib/auth"
import { getAccess } from "@/lib/demo/server"

export const metadata: Metadata = { title: "Panduan" }

// Every guided tour in one list, with what has been seen and a replay
// button. Linked from the avatar menu, Pengaturan, and the "?" button on
// pages that have no tour of their own.
export default async function GuidePage() {
  const user = await getCurrentUser()
  const access = user ? await getAccess(user.id) : null

  return (
    <div className="mx-auto max-w-3xl px-5 py-6 lg:px-8">
      <header className="enter flex items-center gap-4">
        <Rex size={56} mood="happy" className="shrink-0" />
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight">Panduan</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tur singkat untuk tiap fitur. Putar ulang kapan saja, atau ketuk tombol ? di halaman mana pun.
          </p>
        </div>
      </header>

      <div className="mt-6">
        <GuideList signedIn={Boolean(user)} akunOpen={Boolean(access?.open)} />
      </div>
    </div>
  )
}
