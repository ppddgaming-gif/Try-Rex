// Display preferences: theme, reading font, text size, motion, and whether the
// sidebar is collapsed. They belong to the device, not the account (a phone
// and a laptop can differ), so they live in localStorage and are applied as
// data-* attributes on <html>. PREFS_BOOT applies them before first paint;
// lib/use-preferences.ts changes them afterwards. CSS in globals.css reads
// the attributes. Pure and client-safe.

export type Theme = "system" | "light" | "dark"
export type Font = "default" | "dyslexic" | "readable"
export type TextSize = "normal" | "large" | "xlarge"
export type Motion = "system" | "reduce"
export type SidebarState = "expanded" | "collapsed"

export type Preferences = {
  theme: Theme
  font: Font
  size: TextSize
  motion: Motion
  sidebar: SidebarState
}

export const PREFS_KEY = "tryrex:prefs:v1"

/** Dark is the brand's home: new visitors see it until they choose otherwise. */
export const DEFAULT_PREFS: Preferences = {
  theme: "dark",
  font: "default",
  size: "normal",
  motion: "system",
  sidebar: "expanded",
}

const ALLOWED: { [K in keyof Preferences]: readonly Preferences[K][] } = {
  theme: ["system", "light", "dark"],
  font: ["default", "dyslexic", "readable"],
  size: ["normal", "large", "xlarge"],
  motion: ["system", "reduce"],
  sidebar: ["expanded", "collapsed"],
}

/** Keeps only known keys and values; anything else falls back to the default. */
export function parsePrefs(input: unknown): Preferences {
  const out: Preferences = { ...DEFAULT_PREFS }
  if (!input || typeof input !== "object") return out
  const raw = input as Record<string, unknown>
  for (const key of Object.keys(ALLOWED) as (keyof Preferences)[]) {
    const v = raw[key]
    if (typeof v === "string" && (ALLOWED[key] as readonly string[]).includes(v)) {
      ;(out as Record<string, string>)[key] = v
    }
  }
  return out
}

/** The attributes the server renders, matching DEFAULT_PREFS. */
export const DEFAULT_HTML_ATTRS = {
  "data-theme": "dark",
  "data-theme-pref": "dark",
  "data-font": "default",
  "data-size": "normal",
  "data-motion": "system",
  "data-sidebar": "expanded",
} as const

/**
 * Runs in <head> before the body is parsed: reads the saved preferences and
 * sets the attributes, so a light-mode reader never sees a dark flash. Also
 * follows the OS when the theme is "system", including live changes.
 * Kept tiny and dependency-free; mirrors applyPrefs() below.
 */
export const PREFS_BOOT = `(function(){try{var d=document.documentElement,p={};try{p=JSON.parse(localStorage.getItem(${JSON.stringify(PREFS_KEY)})||"{}")||{}}catch(e){}
var ok={theme:["system","light","dark"],font:["default","dyslexic","readable"],size:["normal","large","xlarge"],motion:["system","reduce"],sidebar:["expanded","collapsed"]},def=${JSON.stringify(DEFAULT_PREFS)};
function v(k){return ok[k].indexOf(p[k])>-1?p[k]:def[k]}
var mq=window.matchMedia("(prefers-color-scheme: light)");
function theme(){var t=d.getAttribute("data-theme-pref");var r=t==="system"?(mq.matches?"light":"dark"):t;d.setAttribute("data-theme",r);d.style.colorScheme=r}
d.setAttribute("data-theme-pref",v("theme"));d.setAttribute("data-font",v("font"));d.setAttribute("data-size",v("size"));d.setAttribute("data-motion",v("motion"));d.setAttribute("data-sidebar",v("sidebar"));theme();
mq.addEventListener("change",theme)}catch(e){}})()`

/** Applies preferences to <html> after the page has loaded (settings changes). */
export function applyPrefs(p: Preferences) {
  const d = document.documentElement
  const resolved =
    p.theme === "system" ? (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark") : p.theme
  d.setAttribute("data-theme-pref", p.theme)
  d.setAttribute("data-theme", resolved)
  d.style.colorScheme = resolved
  d.setAttribute("data-font", p.font)
  d.setAttribute("data-size", p.size)
  d.setAttribute("data-motion", p.motion)
  d.setAttribute("data-sidebar", p.sidebar)
}
