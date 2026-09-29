/**
 * Placeholder block. Size it exactly like the text or bar it replaces (same
 * height as the line box, same width), so nothing shifts when data arrives.
 */
export function Skeleton({ className = "" }: { className?: string }) {
  return <span aria-hidden="true" className={`skeleton ${className}`} />
}
