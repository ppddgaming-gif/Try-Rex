"use client"

import type { ReactNode } from "react"
import { Check, Monitor, Moon, PanelLeft, PanelLeftClose, Sparkles, Sun, Waves } from "lucide-react"
import { Card } from "@/components/card"
import type { Font, Motion, Preferences, SidebarState, TextSize, Theme } from "@/lib/preferences"
import { setPreference, usePreferences } from "@/lib/use-preferences"

/**
 * Settings > Tampilan. Every change applies at once (html data-* attributes)
 * and is remembered on this device. Available to guests too.
 */
export function AppearanceSettings() {
  const prefs = usePreferences()

  return (
    <>
      <Section title="Tema" hint="Sistem mengikuti pengaturan terang/gelap perangkatmu.">
        <div role="radiogroup" aria-label="Tema" className="grid gap-3 sm:grid-cols-3">
          <ThemeOption value="dark" current={prefs.theme} icon={<Moon className="h-4 w-4" />} label="Gelap" />
          <ThemeOption value="light" current={prefs.theme} icon={<Sun className="h-4 w-4" />} label="Terang" />
          <ThemeOption value="system" current={prefs.theme} icon={<Monitor className="h-4 w-4" />} label="Sistem" />
        </div>
      </Section>

      <Section
        title="Huruf"
        hint="OpenDyslexic memberi bobot di bagian bawah huruf agar tidak terbalik-balik. Atkinson Hyperlegible dibuat supaya huruf mirip (I, l, 1) mudah dibedakan."
      >
        <div role="radiogroup" aria-label="Huruf" className="grid gap-3 sm:grid-cols-3">
          <Choice<Font>
            name="font"
            value="default"
            current={prefs.font}
            label="Standar"
            sub="Plus Jakarta Sans"
            preview={<span style={{ fontFamily: "var(--font-sans)" }}>Aa Bb 123</span>}
          />
          <Choice<Font>
            name="font"
            value="dyslexic"
            current={prefs.font}
            label="Ramah disleksia"
            sub="OpenDyslexic"
            preview={<span style={{ fontFamily: "var(--font-dyslexic)" }}>Aa Bb 123</span>}
          />
          <Choice<Font>
            name="font"
            value="readable"
            current={prefs.font}
            label="Mudah dibaca"
            sub="Atkinson Hyperlegible"
            preview={<span style={{ fontFamily: "var(--font-readable)" }}>Il1 O0 rn</span>}
          />
        </div>
      </Section>

      <Section title="Ukuran teks">
        <div role="radiogroup" aria-label="Ukuran teks" className="grid grid-cols-3 gap-3">
          {(
            [
              ["normal", "Normal", "text-base"],
              ["large", "Besar", "text-lg"],
              ["xlarge", "Lebih besar", "text-xl"],
            ] as const
          ).map(([value, label, size]) => (
            <Choice<TextSize>
              key={value}
              name="size"
              value={value}
              current={prefs.size}
              label={label}
              preview={<span className={`font-display font-bold ${size}`}>Aa</span>}
            />
          ))}
        </div>
      </Section>

      <Section title="Gerakan" hint="Kurangi mematikan animasi di situs ini saja, tanpa mengubah pengaturan perangkatmu.">
        <div role="radiogroup" aria-label="Gerakan" className="grid gap-3 sm:grid-cols-2">
          <Choice<Motion>
            name="motion"
            value="system"
            current={prefs.motion}
            label="Ikuti sistem"
            sub="Animasi penuh, kecuali perangkat minta dikurangi"
            preview={<Sparkles className="h-5 w-5 text-primary" />}
          />
          <Choice<Motion>
            name="motion"
            value="reduce"
            current={prefs.motion}
            label="Kurangi"
            sub="Tanpa animasi dan transisi"
            preview={<Waves className="h-5 w-5 text-muted-foreground" />}
          />
        </div>
      </Section>

      <Section title="Sidebar" hint="Hanya di layar lebar. Bisa juga lewat tombol di atas sidebar.">
        <div role="radiogroup" aria-label="Sidebar" className="grid gap-3 sm:grid-cols-2">
          <Choice<SidebarState>
            name="sidebar"
            value="expanded"
            current={prefs.sidebar}
            label="Lebar"
            sub="Ikon dan nama menu"
            preview={<PanelLeft className="h-5 w-5 text-primary" />}
          />
          <Choice<SidebarState>
            name="sidebar"
            value="collapsed"
            current={prefs.sidebar}
            label="Ciut"
            sub="Ikon saja, lebih banyak ruang"
            preview={<PanelLeftClose className="h-5 w-5 text-primary" />}
          />
        </div>
      </Section>
    </>
  )
}

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <Card className="sm:p-7">
      <h2 className="text-base font-semibold">{title}</h2>
      {hint && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{hint}</p>}
      <div className="mt-5">{children}</div>
    </Card>
  )
}

/** Shared look for every option tile: a card that lights up amber when chosen. */
function tileClass(selected: boolean) {
  return [
    "option relative flex min-h-11 w-full flex-col rounded-2xl border p-4 text-left",
    selected ? "border-primary bg-primary/10" : "border-border bg-inset hover:border-faint",
  ].join(" ")
}

/** The corner check. Theme tiles put it by the label so it never covers the preview. */
function Tick({ on, low = false }: { on: boolean; low?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={[
        low ? "absolute bottom-4 right-3" : "absolute right-3 top-3",
        "flex h-5 w-5 items-center justify-center rounded-full transition-colors",
        on ? "bg-primary text-primary-foreground" : "border border-border",
      ].join(" ")}
    >
      {on && <Check className="pop-in h-3 w-3" strokeWidth={3} />}
    </span>
  )
}

function Choice<T extends Preferences[keyof Preferences]>({
  name,
  value,
  current,
  label,
  sub,
  preview,
}: {
  name: keyof Preferences
  value: T
  current: T
  label: string
  sub?: string
  preview: ReactNode
}) {
  const selected = value === current
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={() => setPreference(name, value as never)}
      className={tileClass(selected)}
    >
      <Tick on={selected} />
      <span className="flex h-10 items-center">{preview}</span>
      <span className="mt-2 text-sm font-semibold">{label}</span>
      {sub && <span className="mt-0.5 text-xs text-muted-foreground">{sub}</span>}
    </button>
  )
}

/** A tiny window drawn in the theme's own colours. System shows both halves. */
function ThemeOption({ value, current, icon, label }: { value: Theme; current: Theme; icon: ReactNode; label: string }) {
  const selected = value === current
  const dark = { bg: "#0a0e0b", card: "#111710", line: "#25301f", ink: "#eaf2e6", accent: "#f2a03d" }
  const light = { bg: "#f6f4ee", card: "#ffffff", line: "#dcdcd1", ink: "#161b13", accent: "#c47508" }

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={() => setPreference("theme", value)}
      className={tileClass(selected)}
    >
      <Tick on={selected} low />
      <span aria-hidden="true" className="relative block h-20 w-full overflow-hidden rounded-xl border border-border">
        {value === "system" ? (
          <>
            <Mini palette={dark} className="absolute inset-0" />
            <Mini palette={light} className="absolute inset-0 [clip-path:polygon(55%_0,100%_0,100%_100%,45%_100%)]" />
          </>
        ) : (
          <Mini palette={value === "dark" ? dark : light} className="absolute inset-0" />
        )}
      </span>
      <span className="mt-3 flex items-center gap-2 text-sm font-semibold">
        {icon} {label}
      </span>
    </button>
  )
}

// The preview swatches are fixed colours on purpose: they show each theme,
// not the one currently active.
function Mini({
  palette,
  className,
}: {
  palette: { bg: string; card: string; line: string; ink: string; accent: string }
  className: string
}) {
  return (
    <span className={`flex gap-1.5 p-2 ${className}`} style={{ background: palette.bg }}>
      <span className="w-5 rounded" style={{ background: palette.card, border: `1px solid ${palette.line}` }} />
      <span className="flex flex-1 flex-col gap-1.5 rounded p-1.5" style={{ background: palette.card, border: `1px solid ${palette.line}` }}>
        <span className="h-1.5 w-2/3 rounded-full" style={{ background: palette.ink }} />
        <span className="h-1.5 w-1/2 rounded-full opacity-50" style={{ background: palette.ink }} />
        <span className="mt-auto h-3 w-10 rounded" style={{ background: palette.accent }} />
      </span>
    </span>
  )
}
