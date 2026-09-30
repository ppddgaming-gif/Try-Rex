"use client"

import { useEffect } from "react"

/**
 * One pointer listener for the whole page: it tells whichever `.spotlight`
 * card is under the cursor where the cursor is (--mx / --my), and CSS draws
 * the glow. Mounted once per layout; renders nothing. Mouse and pen only.
 */
export function SpotlightRoot() {
  useEffect(() => {
    let frame = 0
    function onMove(e: PointerEvent) {
      if (e.pointerType === "touch") return
      const el = (e.target as Element | null)?.closest?.<HTMLElement>(".spotlight")
      if (!el) return
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect()
        el.style.setProperty("--mx", `${e.clientX - r.left}px`)
        el.style.setProperty("--my", `${e.clientY - r.top}px`)
      })
    }
    document.addEventListener("pointermove", onMove, { passive: true })
    return () => {
      document.removeEventListener("pointermove", onMove)
      cancelAnimationFrame(frame)
    }
  }, [])
  return null
}
