import { Check, X } from "lucide-react"
import { type Decision } from "@/lib/mock-data"

// Idle options sit on a neutral line so none of them looks pre-selected.
// Picking one tints it in its own market colour and gives it a matching
// bottom edge. WAIT uses the blue-grey `wait` tone so it reads as a real
// answer rather than an absence of one.
const actions = [
  {
    id: "buy" as const,
    label: "BUY",
    sub: "Harga naik",
    text: "text-success",
    selected: "border-success bg-success/13 shadow-[0_4px_0_color-mix(in_srgb,var(--success)_20%,transparent)]",
    outline: "focus-visible:outline-success",
  },
  {
    id: "sell" as const,
    label: "SELL",
    sub: "Harga turun",
    text: "text-danger",
    selected: "border-danger bg-danger/13 shadow-[0_4px_0_color-mix(in_srgb,var(--danger)_20%,transparent)]",
    outline: "focus-visible:outline-danger",
  },
  {
    id: "wait" as const,
    label: "WAIT",
    sub: "Tunggu dulu",
    text: "text-wait",
    selected: "border-wait bg-wait/13 shadow-[0_4px_0_color-mix(in_srgb,var(--wait)_20%,transparent)]",
    outline: "focus-visible:outline-wait",
  },
]

const idle = "border-border bg-white/[0.02] shadow-[0_4px_0_var(--inset)]"

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
    <div role="radiogroup" aria-label="Keputusan trading" className="grid grid-cols-3 gap-2.5">
      {actions.map((a) => {
        const selected = value === a.id
        const isAnswer = answer === a.id
        const wrongPick = revealed && selected && !isAnswer

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
              "relative flex flex-col items-center rounded-[13px] border-[1.5px] py-3.5 text-center font-display text-[19px] font-extrabold tracking-[0.02em]",
              "transition-[transform,box-shadow,background-color,border-color] duration-75",
              "focus-visible:outline-2 focus-visible:outline-offset-2",
              a.text,
              a.outline,
              selected ? a.selected : idle,
              disabled ? "cursor-default" : "active:translate-y-[3px] active:shadow-[0_1px_0_var(--inset)]",
              revealed && !isAnswer && !selected ? "opacity-40" : "",
            ].join(" ")}
          >
            {a.label}
            <span className="mt-0.5 font-sans text-[11px] font-medium tracking-normal text-muted-foreground">
              <span className="sr-only">, </span>
              {a.sub}
            </span>
            {isAnswer && (
              <Check className="absolute right-1.5 top-1.5 h-4 w-4" strokeWidth={2.2} aria-label="Jawaban benar" />
            )}
            {wrongPick && (
              <X className="absolute right-1.5 top-1.5 h-4 w-4" strokeWidth={2.2} aria-label="Pilihanmu salah" />
            )}
          </button>
        )
      })}
    </div>
  )
}
