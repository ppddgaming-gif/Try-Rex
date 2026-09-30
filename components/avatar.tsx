import Image from "next/image"
import { initials } from "@/lib/profile-rules"

/**
 * The player's photo, or their initials on an amber-tinted disc. Guests get
 * Rex instead (pass `fallback`). A thin glass ring keeps it crisp on any
 * surface.
 */
export function Avatar({
  src,
  name,
  size = 40,
  fallback,
  className = "",
}: {
  src: string | null
  name: string
  size?: number
  fallback?: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/15 ring-1 ring-foreground/10 ${className}`}
      style={{ width: size, height: size }}
    >
      {src ? (
        <Image
          src={src}
          alt={`Foto profil ${name}`}
          width={size}
          height={size}
          sizes={`${size}px`}
          // A local preview (blob:) can't go through the image optimizer.
          unoptimized={src.startsWith("blob:")}
          className="h-full w-full object-cover"
        />
      ) : fallback ? (
        fallback
      ) : (
        <span aria-hidden="true" className="font-display font-extrabold text-primary" style={{ fontSize: size * 0.38 }}>
          {initials(name)}
        </span>
      )}
    </span>
  )
}
