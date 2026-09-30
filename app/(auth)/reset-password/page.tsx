import type { Metadata } from "next"
import Link from "next/link"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"
import { getCurrentUser } from "@/lib/auth"

export const metadata: Metadata = { title: "Password baru" }

// Reached from the reset email via /auth/callback, which signs the user in
// with a recovery session. Without that session there is nothing to update.
export default async function ResetPasswordPage() {
  const user = await getCurrentUser()

  if (!user) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-extrabold">Link sudah tidak berlaku</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Buka halaman ini dari link di email reset password. Kalau link-nya sudah kedaluwarsa, minta yang baru.
        </p>
        <Link href="/lupa-password" className="btn w-full">
          Minta link baru
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-extrabold">Buat password baru</h1>
        <p className="text-sm text-muted-foreground">Untuk akun {user.email}.</p>
      </div>
      <ResetPasswordForm />
    </div>
  )
}
