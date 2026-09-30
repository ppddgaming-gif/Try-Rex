"use client"

import Link from "next/link"
import { RotateCcw } from "lucide-react"
import { Card } from "@/components/card"
import { ResetProgress } from "@/components/progress/reset-progress"
import { Skeleton } from "@/components/progress/skeleton"
import { LEVEL_LABELS, answerLabel, planFrom, type OnboardingRecord } from "@/lib/onboarding"
import { useOnboarding } from "@/lib/use-onboarding"

/**
 * Settings > Latihan: what the /start quiz decided, a way to retake it, and
 * the reset. Accounts pass their record; guests read the device.
 */
export function TrainingPlan({ serverRecord }: { serverRecord?: OnboardingRecord | null }) {
  const record = useOnboarding(serverRecord)
  const plan = planFrom(record ?? null)

  return (
    <>
      <Card className="sm:p-7">
        <h2 className="text-base font-semibold">Jalur latihan</h2>
        <p className="mt-1 text-sm text-muted-foreground">Diatur dari jawaban kuis awalmu.</p>
        {record === undefined ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[62px] rounded-xl" />
            ))}
          </div>
        ) : record && !record.skipped ? (
          <dl className="mt-5 grid gap-3 sm:grid-cols-2">
            <Item label="Mulai di tingkat" value={LEVEL_LABELS[plan.level]} />
            <Item label="Target harian" value={plan.dailyGoal ? `${plan.dailyGoal} soal` : "Tanpa target"} />
            <Item label="Fokus pair" value={answerLabel("focus", record.answers.focus) ?? "Semua pair"} />
            <Item label="Pengalaman" value={answerLabel("experience", record.answers.experience) ?? "—"} />
          </dl>
        ) : (
          <p className="mt-5 text-sm text-muted-foreground">
            {record?.skipped
              ? "Kamu melewati kuis awal, jadi latihan memakai pengaturan standar."
              : "Kamu belum mengisi kuis awal."}
          </p>
        )}
        <Link href="/start?ulang=1&next=/pengaturan%23latihan" className="btn btn-ghost btn-sm mt-5">
          <RotateCcw className="h-4 w-4" /> Ulangi kuis awal
        </Link>
      </Card>

      <Card className="sm:p-7">
        <h2 className="text-base font-semibold">Data latihan</h2>
        <p className="mt-1 text-sm text-muted-foreground">Menghapus XP, streak, dan riwayat jawabanmu.</p>
        <div className="mt-3">
          <ResetProgress />
        </div>
      </Card>
    </>
  )
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-inset px-4 py-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-semibold">{value}</dd>
    </div>
  )
}
