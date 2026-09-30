import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, BookA, BookOpen, Bitcoin, Brain, CandlestickChart, Clock, ShieldCheck } from "lucide-react"
import { Card } from "@/components/card"
import { DraftNote } from "@/components/learn/draft-note"
import { LearnProgressRing, LessonStatus } from "@/components/learn/lesson-done"
import { Rex } from "@/components/rex-mascot"
import { GLOSSARY } from "@/lib/glossary"
import { LESSONS, TRACKS, lessonBySlug } from "@/lib/learn/content"
import type { TrackId } from "@/lib/learn/types"

export const metadata: Metadata = { title: "Belajar 101" }

const TRACK_ICONS: Record<TrackId, React.ElementType> = {
  dasar: BookOpen,
  chart: CandlestickChart,
  risiko: ShieldCheck,
  crypto: Bitcoin,
  psikologi: Brain,
}

export default function LearnPage() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-6 lg:px-8">
      <header className="glow-card enter relative overflow-hidden rounded-3xl border border-border p-6 sm:p-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1">
            <p className="eyebrow">Belajar 101</p>
            <h1 className="enter-focus mt-3 text-3xl font-extrabold sm:text-4xl">Semua dasar trading, satu tempat.</h1>
            <p className="mt-3 max-w-xl text-muted-foreground">
              Dari cara membaca candle sampai menjaga aset crypto. Materi singkat, contoh dari chart asli, dan satu
              pertanyaan di akhir tiap bab.
            </p>
            <div className="mt-5">
              <LearnProgressRing total={LESSONS.length} />
            </div>
          </div>
          <Rex size={140} mood="thinking" className="float hidden sm:block" />
        </div>
      </header>

      <div className="mt-6">
        <DraftNote />
      </div>

      <Link
        href="/belajar/kamus"
        className="reveal lift spotlight mt-6 flex items-center gap-4 rounded-2xl border border-border bg-card p-5 hover:border-primary/40"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/30">
          <BookA className="h-6 w-6 text-primary" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg font-bold">Kamus Trading</p>
          <p className="text-sm text-muted-foreground">
            <span className="font-mono">{GLOSSARY.length}</span> istilah, dijelaskan dalam satu atau dua kalimat. Istilah
            yang sama bisa diketuk di Trading Game.
          </p>
        </div>
        <ArrowRight className="h-5 w-5 text-primary" aria-hidden="true" />
      </Link>

      <div className="mt-10 flex flex-col gap-10">
        {TRACKS.map((track, ti) => {
          const Icon = TRACK_ICONS[track.id]
          const lessons = track.lessons.map((s) => lessonBySlug.get(s)!).filter(Boolean)
          return (
            <section key={track.id} className="reveal" aria-labelledby={`track-${track.id}`}>
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/30">
                  <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="font-mono text-xs text-faint">Bab {ti + 1}</p>
                  <h2 id={`track-${track.id}`} className="text-xl font-bold">
                    {track.title}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">{track.description}</p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {lessons.map((l) => (
                  <Link
                    key={l.slug}
                    href={`/belajar/${l.slug}`}
                    className="lift spotlight group flex items-start gap-3 rounded-2xl border border-border bg-card p-4 hover:border-primary/40"
                  >
                    <LessonStatus slug={l.slug} />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold leading-snug group-hover:text-primary">{l.title}</p>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{l.summary}</p>
                      <p className="mt-2 flex items-center gap-3 text-xs text-faint">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" aria-hidden="true" /> {l.minutes} menit
                        </span>
                        <span className="capitalize">{l.level}</span>
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )
        })}
      </div>

      <Card className="glow-card mt-12 flex flex-col items-center gap-4 text-center sm:p-10">
        <p className="font-display text-2xl font-bold">Teori sudah, saatnya praktik.</p>
        <p className="max-w-md text-sm text-muted-foreground">
          Setiap soal di Trading Game adalah chart asli. Coba baca trend dan levelnya sendiri.
        </p>
        <Link href="/trading-game" className="btn">
          Buka Trading Game <ArrowRight className="h-4 w-4" />
        </Link>
      </Card>
    </div>
  )
}
