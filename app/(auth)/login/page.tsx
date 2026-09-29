import type { Metadata } from "next"
import Link from "next/link"
import { LoginForm } from "@/components/auth/login-form"
import { safeNext } from "@/lib/auth-rules"

export const metadata: Metadata = { title: "Masuk | TRY-REX" }

const LINK_ERROR = "Link konfirmasi atau reset tidak valid, sudah dipakai, atau kedaluwarsa. Coba lagi."

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-extrabold">Masuk</h1>
        <p className="text-sm text-muted-foreground">Lanjutkan latihanmu.</p>
      </div>
      <LoginForm next={safeNext(next)} initialError={error === "link" ? LINK_ERROR : undefined} />
      <p className="text-center text-sm text-muted-foreground">
        Belum punya akun?{" "}
        <Link href="/signup" className="inline-flex min-h-11 items-center font-semibold text-primary hover:text-primary-hi">
          Daftar gratis
        </Link>
      </p>
    </div>
  )
}
