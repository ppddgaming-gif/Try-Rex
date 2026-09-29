import type { Metadata } from "next"
import Link from "next/link"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"

export const metadata: Metadata = { title: "Lupa password | TRY-REX" }

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-extrabold">Lupa password</h1>
        <p className="text-sm text-muted-foreground">
          Masukkan email akunmu. Kami kirim link untuk membuat password baru.
        </p>
      </div>
      <ForgotPasswordForm />
      <p className="text-center text-sm text-muted-foreground">
        Ingat passwordnya?{" "}
        <Link href="/login" className="inline-flex min-h-11 items-center font-semibold text-primary hover:text-primary-hi">
          Kembali ke Masuk
        </Link>
      </p>
    </div>
  )
}
