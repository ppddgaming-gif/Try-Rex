import { ACCOUNT, UNLOCK } from "@/lib/demo/config"
import { FUTURE } from "@/lib/game-logic"
import { EXAM } from "@/lib/learn/exam/engine"
import { msg, type Msg } from "@/lib/i18n/translator"

// Every guided tour, in one place. Pure and client-safe: components/tour/
// renders them. A step points at elements by their data-tour attribute;
// `targets` lists fallbacks in order (the sidebar link, then the phone's menu
// button), and the first one visible on screen wins. A step with no visible
// target is skipped, never shown as an empty highlight. The words live in the
// tours catalogue (messages/*/tours.json): <tour>.title, <tour>.description,
// <tour>.finish and <tour>.steps.<step>.title / .text. Rex speaks: at most
// two short sentences per step.

export type TourId = "welcome" | "trading-game" | "dashboard" | "belajar" | "akun-latihan" | "pengaturan"

/** What a step's text may mention about the player. */
export type TourContext = {
  /** Display name, or null for a guest. */
  name: string | null
  /** Akun Demo's unlock: finished game sessions out of those needed; null for a guest. */
  unlock: { sessions: number; needed: number; open: boolean } | null
}

export type TourStep = {
  /** Names the step's copy in the catalogue. */
  id: string
  /** data-tour values, first visible wins. Empty: a card in the middle with no highlight. */
  targets: string[]
  /** Copy that depends on the player or on a number: replaces the default messages. */
  copy?: (ctx: TourContext) => { title?: Msg; text?: Msg }
}

export type Tour = {
  id: TourId
  /** Where a replay opens it; null means it runs on whatever app page is open. */
  page: string | null
  /** Pages that start it the first time they're opened; empty for the welcome tour. */
  paths: string[]
  /** Its page needs an account. */
  account: boolean
  steps: TourStep[]
  /** Where the last step's button goes instead of just closing (label: <tour>.finish). */
  finish?: { href: string }
}

/** At most this many steps in one tour. */
export const MAX_STEPS = 7
/** The format every stored tour id must have (the database checks it too). */
export const TOUR_ID_RULE = /^[a-z0-9-]{1,40}$/
/** The database keeps at most this many. */
export const MAX_SEEN = 32

/** The sidebar link, or the menu button on a phone, where the sidebar is hidden. */
const nav = (id: string) => [`nav-${id}`, "nav-menu"]

export const TOURS: Tour[] = [
  {
    id: "welcome",
    page: null,
    paths: [],
    account: false,
    finish: { href: "/trading-game" },
    steps: [
      {
        id: "hello",
        targets: nav("dashboard"),
        copy: (c) => (c.name ? { title: msg("welcome.steps.hello.titleNamed", { name: c.name }) } : {}),
      },
      { id: "game", targets: nav("trading-game") },
      {
        id: "demo",
        targets: nav("akun-latihan"),
        copy: (c) => {
          const balance = ACCOUNT.STARTING_BALANCE
          if (!c.unlock) return { text: msg("welcome.steps.demo.textGuest", { balance, sessions: UNLOCK.GAME_SESSIONS }) }
          if (c.unlock.open) return { text: msg("welcome.steps.demo.textOpen", { balance }) }
          return { text: msg("welcome.steps.demo.textLocked", { balance, sessions: c.unlock.sessions, needed: c.unlock.needed }) }
        },
      },
      { id: "learn", targets: nav("belajar") },
      { id: "settings", targets: nav("pengaturan") },
      { id: "help", targets: ["tour-help", "tour-help-mobile"] },
    ],
  },
  {
    id: "trading-game",
    page: "/trading-game",
    paths: ["/trading-game"],
    account: false,
    steps: [
      { id: "pair", targets: ["game-pair"] },
      { id: "chart", targets: ["game-chart"] },
      { id: "situation", targets: ["game-situation"] },
      { id: "decision", targets: ["game-decision"] },
      { id: "submit", targets: ["game-submit"], copy: () => ({ text: msg("trading-game.steps.submit.text", { n: FUTURE }) }) },
      { id: "progress", targets: ["game-progress"] },
      { id: "level", targets: ["game-level"] },
    ],
  },
  {
    id: "dashboard",
    page: "/dashboard",
    paths: ["/dashboard"],
    account: true,
    steps: [
      { id: "stats", targets: ["dash-stats"] },
      { id: "goal", targets: ["dash-goal"] },
      { id: "streak", targets: ["dash-streak", "dash-streak-mobile"] },
      { id: "calendar", targets: ["dash-calendar"] },
      { id: "skills", targets: ["dash-skills"] },
      { id: "activity", targets: ["dash-activity"] },
      { id: "challenge", targets: ["dash-challenge"] },
    ],
  },
  {
    id: "belajar",
    page: "/belajar",
    paths: ["/belajar"],
    account: false,
    steps: [
      { id: "level", targets: ["learn-level"] },
      { id: "lesson", targets: ["learn-lesson"] },
      {
        id: "exam",
        targets: ["learn-exam"],
        copy: () => ({ text: msg("belajar.steps.exam.text", { pass: EXAM.PASS, q: EXAM.QUESTIONS }) }),
      },
      { id: "kamus", targets: ["learn-kamus"] },
    ],
  },
  {
    id: "akun-latihan",
    page: "/akun-latihan",
    paths: ["/akun-latihan"],
    account: true,
    steps: [
      { id: "akun", targets: ["demo-tab-akun"] },
      { id: "trading", targets: ["demo-tab-trading"] },
      { id: "jurnal", targets: ["demo-tab-jurnal"] },
      { id: "riwayat", targets: ["demo-tab-riwayat"] },
      { id: "kalkulator", targets: ["demo-tab-kalkulator"] },
      { id: "tips", targets: ["demo-tab-tips"] },
    ],
  },
  {
    id: "pengaturan",
    page: "/pengaturan#tampilan",
    paths: ["/pengaturan"],
    account: false,
    steps: [
      { id: "language", targets: ["settings-language"] },
      { id: "theme", targets: ["settings-theme"] },
      { id: "font", targets: ["settings-font"] },
      { id: "motion", targets: ["settings-motion"] },
      { id: "profil", targets: ["settings-tab-profil"] },
      { id: "keamanan", targets: ["settings-tab-keamanan"] },
      { id: "latihan", targets: ["settings-tab-latihan"] },
    ],
  },
]

export const TOUR_IDS = TOURS.map((t) => t.id)

export const tourById = (id: string) => TOURS.find((t) => t.id === id) ?? null

/** The page tour for a path (exact match, so /belajar's tour isn't run on a lesson). */
export const tourForPath = (path: string) => TOURS.find((t) => t.paths.includes(path)) ?? null

/** A step's title and text as messages in the tours catalogue. */
export function stepCopy(tour: Tour, step: TourStep, ctx: TourContext): { title: Msg; text: Msg } {
  const own = step.copy?.(ctx) ?? {}
  const base = `${tour.id}.steps.${step.id}`
  return { title: own.title ?? msg(`${base}.title`), text: own.text ?? msg(`${base}.text`) }
}

/** Seen tour ids from outside (localStorage, the profile): known ids only, no repeats. */
export function parseSeen(input: unknown): TourId[] {
  if (!Array.isArray(input)) return []
  const out: TourId[] = []
  for (const v of input) {
    if (typeof v === "string" && TOUR_ID_RULE.test(v) && (TOUR_IDS as string[]).includes(v) && !out.includes(v as TourId)) {
      out.push(v as TourId)
    }
  }
  return out.slice(0, MAX_SEEN)
}

/** Union of two seen lists, in first-seen order. */
export const mergeSeen = (a: readonly string[], b: readonly string[]) => parseSeen([...a, ...b])

/** Ids in `local` the account doesn't have yet: what a sign-in has to upload. */
export const unsynced = (local: readonly string[], account: readonly string[]) =>
  parseSeen(local).filter((id) => !account.includes(id))
