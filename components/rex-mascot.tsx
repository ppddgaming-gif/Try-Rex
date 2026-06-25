export function RexMascot({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none select-none ${className}`} aria-hidden="true">
      <span className="text-[120px] leading-none drop-shadow-[0_8px_20px_rgba(0,0,0,0.5)]">🦖</span>
    </div>
  )
}
