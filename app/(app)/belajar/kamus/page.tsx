import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { DraftNote } from "@/components/learn/draft-note"
import { GlossaryBrowser } from "@/components/learn/glossary-browser"

export const metadata: Metadata = { title: "Kamus Trading" }

export default function GlossaryPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-6 lg:px-8">
      <Link
        href="/belajar"
        className="enter inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Belajar 101
      </Link>
      <header className="mt-2">
        <p className="eyebrow enter">Kamus</p>
        <h1 className="enter-focus mt-3 text-3xl font-extrabold sm:text-4xl">Kamus Trading</h1>
        <p className="enter mt-3 max-w-xl text-muted-foreground">
          Istilah yang sering muncul di chart dan di soal, dijelaskan singkat. Di Trading Game, istilah bergaris bisa
          diketuk untuk membuka penjelasan yang sama.
        </p>
      </header>
      <div className="mt-6">
        <DraftNote />
      </div>
      <div className="mt-6">
        <GlossaryBrowser />
      </div>
    </div>
  )
}
