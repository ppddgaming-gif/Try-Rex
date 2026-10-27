import Image from "next/image"

/** The four faces the small SVG Rex can draw (logo and chrome). */
export type RexMood = "neutral" | "happy" | "grimace" | "thinking"

/**
 * Rex's illustrated expressions (public/maskot/rexy-*.webp, 600×600,
 * transparent). Used wherever Rex reacts; the SVG `Rex` stays for the logo
 * and anything under ~40px, where a full-body drawing can't be read.
 */
export type RexArtMood = RexMood | "sad" | "angry" | "dizzy" | "tired" | "explain"

const ART: Record<RexArtMood, string> = {
  happy: "rexy-senang",
  sad: "rexy-sedih",
  angry: "rexy-marah",
  thinking: "rexy-berpikir",
  dizzy: "rexy-pusing",
  grimace: "rexy-pusing",
  tired: "rexy-lelah",
  explain: "rexy-menjelaskan",
  neutral: "rexy-menjelaskan",
}

/**
 * Rex as an illustration, in a fixed square box (no layout shift while it
 * loads). Decorative unless `label` is given. The drawing leaves room around
 * the body, so pick a size about a third larger than the SVG would need.
 */
export function RexArt({
  mood = "neutral",
  size = 96,
  label,
  className = "",
  priority = false,
  fluid = false,
}: {
  mood?: RexArtMood
  size?: number
  label?: string
  className?: string
  /** Above the fold on its page: load it right away. */
  priority?: boolean
  /** The box size comes from `className` (responsive sizes); `size` is only the largest it gets. */
  fluid?: boolean
}) {
  return (
    <Image
      src={`/maskot/${ART[mood]}.webp`}
      width={size}
      height={size}
      alt={label ?? ""}
      aria-hidden={label ? undefined : true}
      priority={priority}
      draggable={false}
      className={`shrink-0 select-none object-contain ${className}`}
      style={fluid ? undefined : { width: size, height: size }}
    />
  )
}

// Paths are taken as-is from the design's component sheet on a 72-unit grid.
// Rex reacts to results rather than sitting there as a static logo: neutral
// for chrome and idle screens, happy for a good score, a grimace for a risky
// decision, thinking while an answer or evaluation is pending.
function Face({ mood }: { mood: RexMood }) {
  switch (mood) {
    case "happy":
      return (
        <>
          <path d="M40 41l3.2 5 3.2-5z" fill="var(--rex-tooth)" />
          <path d="M50 41l3.2 5 3.2-5z" fill="var(--rex-tooth)" />
          <path d="M25 21.5c3-3 10-3 13 0" stroke="var(--rex-shade)" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M27 30c1.6-2.4 5.4-2.4 7 0" stroke="var(--rex-eye)" strokeWidth="3.6" strokeLinecap="round" fill="none" />
        </>
      )
    case "grimace":
      return (
        <>
          <path d="M42 41v8M50 41v8M58 41v8" stroke="var(--rex-tooth)" strokeWidth="2.4" />
          <path d="M25 24c3-2.6 10-2.6 13 0" stroke="var(--rex-shade)" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M26 29.5h9" stroke="var(--rex-eye)" strokeWidth="4" strokeLinecap="round" />
        </>
      )
    case "thinking":
      return (
        <>
          <path d="M40 41l3.2 5 3.2-5z" fill="var(--rex-tooth)" />
          <path d="M22 20.5l15 3.5" stroke="var(--rex-shade)" strokeWidth="4" strokeLinecap="round" />
          <circle cx="31" cy="29.5" r="5" fill="var(--rex-eye)" />
          <circle cx="33" cy="28" r="1.8" fill="var(--rex-tooth)" />
          <path
            d="M56 16c3.6 0 5.6 2.2 5.6 4.6 0 3-3.8 3.2-3.8 5.8"
            stroke="var(--rex-shade)"
            strokeWidth="3.4"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="57.8" cy="30.6" r="1.9" fill="var(--rex-shade)" />
        </>
      )
    default:
      return (
        <>
          <path d="M40 41l3.2 5 3.2-5z" fill="var(--rex-tooth)" />
          <path d="M50 41l3.2 5 3.2-5z" fill="var(--rex-tooth)" />
          <rect x="24" y="19" width="15" height="4.5" rx="2.2" fill="var(--rex-shade)" />
          <circle cx="31" cy="29" r="5" fill="var(--rex-eye)" />
          <circle cx="32.8" cy="27.2" r="1.8" fill="var(--rex-tooth)" />
        </>
      )
  }
}

/**
 * Rex, drawn in SVG. Decorative unless `label` is given, in which case it is
 * exposed to assistive tech as an image with that name.
 */
export function Rex({
  mood = "neutral",
  size = 72,
  label,
  className = "",
}: {
  mood?: RexMood
  size?: number
  label?: string
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 72 72"
      width={size}
      height={size}
      className={`shrink-0 ${className}`}
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
    >
      <path d="M20 16l-4-8 10 3zM31 13l-3-8 9 4z" fill="var(--rex-shade)" />
      <rect x="10" y="14" width="36" height="36" rx="15" fill="var(--primary)" />
      <rect x="34" y="27" width="30" height="21" rx="9" fill="var(--primary)" />
      <path d="M34 41h27a3 3 0 0 1 3 3v1a4 4 0 0 1-4 4H38a4 4 0 0 1-4-4z" fill="var(--rex-mouth)" />
      <Face mood={mood} />
    </svg>
  )
}

/** Rex as a large decorative figure tucked into the corner of a card. */
export function RexMascot({ mood = "neutral", className = "" }: { mood?: RexArtMood; className?: string }) {
  return (
    <div className={`pointer-events-none select-none ${className}`}>
      <RexArt mood={mood} size={136} />
    </div>
  )
}
