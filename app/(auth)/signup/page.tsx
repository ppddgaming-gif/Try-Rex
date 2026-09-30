import type { Metadata } from "next"
import Link from "next/link"
import { SignupForm } from "@/components/auth/signup-form"

export const metadata: Metadata = { title: "Daftar" }

export default function SignupPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-extrabold">Buat akun</h1>
        <p className="text-sm text-muted-foreground">Simpan progres latihanmu dan lihat perkembangannya.</p>
      </div>
      <SignupForm />
      <p className="text-center text-sm text-muted-foreground">
        Sudah punya akun?{" "}
        <Link href="/login" className="inline-flex min-h-11 items-center font-semibold text-primary hover:text-primary-hi">
          Masuk
        </Link>
      </p>
    </div>
  )
}
