"use client"

import { useRef, useSyncExternalStore, type ReactNode } from "react"

/** `icon` is a rendered element: components can't cross from server to client. */
export type SettingsTab = { id: string; label: string; icon: ReactNode; panel: ReactNode }

function subscribe(onChange: () => void) {
  window.addEventListener("hashchange", onChange)
  return () => window.removeEventListener("hashchange", onChange)
}

/**
 * Tabs driven by the URL hash (#tampilan, #profil …), so a tab can be linked
 * to. The panels arrive from the server as props; only the active one is
 * mounted (the server shows the first). Arrow keys move between tabs, as a
 * tablist should.
 */
export function SettingsTabs({ tabs, label }: { tabs: SettingsTab[]; label: string }) {
  const hash = useSyncExternalStore(
    subscribe,
    () => window.location.hash.slice(1),
    () => "",
  )
  const active = tabs.find((t) => t.id === hash)?.id ?? tabs[0].id
  const activeIndex = tabs.findIndex((t) => t.id === active)
  const list = useRef<HTMLDivElement>(null)

  function select(id: string, focus = false) {
    // replaceState keeps the history clean; hashchange isn't fired by it,
    // so dispatch one for the store.
    history.replaceState(null, "", `#${id}`)
    window.dispatchEvent(new HashChangeEvent("hashchange"))
    if (focus) list.current?.querySelector<HTMLButtonElement>(`#tab-${id}`)?.focus()
  }

  return (
    <div>
      <div
        ref={list}
        role="tablist"
        aria-label={label}
        className="glass-card glass-strong sticky top-[4.5rem] z-10 flex gap-1 overflow-x-auto rounded-2xl p-1.5 lg:top-4"
      >
        {tabs.map((t, i) => {
          const selected = t.id === active
          return (
            <button
              key={t.id}
              id={`tab-${t.id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`panel-${t.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => select(t.id)}
              onKeyDown={(e) => {
                if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return
                e.preventDefault()
                const next = tabs[(i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length]
                select(next.id, true)
              }}
              className={[
                "relative isolate flex min-h-11 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 text-sm font-semibold transition-colors",
                selected ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {selected && (
                <span
                  key={activeIndex}
                  aria-hidden="true"
                  className="pop-in absolute inset-0 -z-10 rounded-xl bg-primary shadow-[0_3px_0_var(--primary-dim)]"
                />
              )}
              {t.icon}
              {t.label}
            </button>
          )
        })}
      </div>

      {tabs.map((t) => (
        <div
          key={t.id}
          id={`panel-${t.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${t.id}`}
          hidden={t.id !== active}
          className="mt-6"
        >
          {t.id === active && <div className="step-forward flex flex-col gap-4">{t.panel}</div>}
        </div>
      ))}
    </div>
  )
}
