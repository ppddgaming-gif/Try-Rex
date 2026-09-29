import { ArrowDown, ArrowUpRight, Check, Pause, X } from "lucide-react"
import { type Decision } from "@/lib/mock-data"

const actions = [
  {
    id: "buy" as const,
    label: "BUY",
    sub: "Harga akan naik",
    Icon: ArrowUpRight,
    tone: "border-success/40 bg-success/10 text-success",
    hover: "hover:bg-success/20",
    ring: "ring-2 ring-success",
    outline: "focus-visible:outline-success",
  },
  {
    id: "sell" as const,
    label: "SELL",
    sub: "Harga akan turun",
    Icon: ArrowDown,
    tone: "border-danger/40 bg-danger/10 text-danger",
    hover: "hover:bg-danger/20",
    ring: "ring-2 ring-danger",
    outline: "focus-visible:outline-danger",
  },
  {
    id: "wait" as const,
    label: "WAIT",
    sub: "Tunggu konfirmasi",
    Icon: Pause,
    tone: "border-warning/40 bg-warning/10 text-warning",
    hover: "hover:bg-warning/20",
    ring: "ring-2 ring-warning",
    outline: "focus-visible:outline-warning",
  },
]

/**
 * A radiogroup rather than three buttons: arrow keys move between options and
 * only the selected one is a tab stop, which is what screen readers expect for
 * a single-choice answer.
 */
export function DecisionButtons({
  value,
  onChange,
  disabled = false,
  answer,
}: {
  value: Decision | null
  onChange: (d: Decision) => void
  disabled?: boolean
  /** Once supplied, the correct option is revealed and the group locks. */
  answer?: Decision
}) {
  const revealed = answer !== undefined

  return (
    <div role="radiogroup" aria-label="Keputusan trading" className="flex flex-col gap-3">
      {actions.map((a) => {
        const selected = value === a.id
        const isAnswer = answer === a.id
        const wrongPick = revealed && selected && !isAnswer
        const Icon = a.Icon

        return (
          <button
            key={a.id}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected || (!value && a.id === "buy") ? 0 : -1}
            disabled={disabled}
            onClick={() => onChange(a.id)}
            onKeyDown={(e) => {
              if (disabled) return
              if (e.key !== "ArrowDown" && e.key !== "ArrowUp" && e.key !== "ArrowRight" && e.key !== "ArrowLeft") return
              e.preventDefault()
              const step = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : -1
              const from = actions.findIndex((x) => x.id === a.id)
              onChange(actions[(from + step + actions.length) % actions.length].id)
            }}
            className={[
              "flex items-center gap-4 rounded-xl border px-5 py-4 text-left transition-all",
              "focus-visible:outline-2 focus-visible:outline-offset-2",
              a.tone,
              a.outline,
              disabled ? "cursor-default" : a.hover,
              selected ? a.ring : "",
              revealed && !isAnswer && !selected ? "opacity-40" : "",
            ].join(" ")}
          >
            <Icon className="h-7 w-7 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-lg font-extrabold leading-none">{a.label}</p>
              <p className="mt-1 text-xs opacity-80">{a.sub}</p>
            </div>
            {isAnswer && <Check className="h-5 w-5 shrink-0" aria-label="Jawaban benar" />}
            {wrongPick && <X className="h-5 w-5 shrink-0" aria-label="Pilihanmu salah" />}
          </button>
        )
      })}
    </div>
  )
}
