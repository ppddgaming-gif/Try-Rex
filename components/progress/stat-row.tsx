import type { LucideIcon } from "lucide-react"
import { Star, Target, Trophy } from "lucide-react"
import { accuracy, totalChallenges } from "@/lib/progress/derive"
import type { Progress } from "@/lib/progress/types"
import { Card } from "@/components/card"
import { Skeleton } from "@/components/progress/skeleton"

/**
 * Headline numbers, all counted from the attempts. A zero never shows as a
 * big number: it reads "—" with a one-line hint instead.
 */
export function StatRow({ progress }: { progress: Progress | null }) {
  const total = progress ? totalChallenges(progress) : 0
  const acc = progress ? accuracy(progress) : null

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Stat icon={Trophy} label="Soal selesai" loading={!progress} value={total > 0 ? String(total) : null} hint="Jawab soal pertamamu" />
      <Stat
        icon={Target}
        label="Akurasi"
        loading={!progress}
        value={acc !== null && acc > 0 ? `${Math.round(acc * 100)}%` : null}
        hint={acc === null ? "Belum ada jawaban" : "Belum ada jawaban tepat"}
        sub={acc !== null && acc > 0 ? "dari semua jawabanmu" : undefined}
      />
      <Stat
        icon={Star}
        label="Total XP"
        loading={!progress}
        value={progress && progress.xp > 0 ? String(progress.xp) : null}
        hint="Jawaban tepat memberi XP"
      />
    </div>
  )
}

function Stat({
  icon: Icon,
  label,
  value,
  hint,
  sub,
  loading,
}: {
  icon: LucideIcon
  label: string
  /** null renders "—" plus the hint. */
  value: string | null
  hint: string
  sub?: string
  loading: boolean
}) {
  return (
    <Card>
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
        {label}
      </p>
      {loading ? (
        <>
          <Skeleton className="mt-3 h-9 w-16" />
          <Skeleton className="mt-2 h-4 w-32" />
        </>
      ) : (
        <>
          <p className={`mt-3 h-9 font-mono text-3xl font-bold tabular-nums ${value ? "" : "text-muted-foreground"}`}>
            {value ?? "—"}
          </p>
          <p className="mt-2 h-4 text-xs leading-4 text-muted-foreground">{value ? (sub ?? "") : hint}</p>
        </>
      )}
    </Card>
  )
}
