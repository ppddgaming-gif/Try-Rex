import { BookOpen, BrainCircuit, ClipboardList, Home, LineChart, Settings, Wallet, type LucideIcon } from "lucide-react"

// Single source of truth for the app-shell nav: rendered by both the desktop
// sidebar and the mobile drawer. Register new /app routes here. `match` marks
// a section whose sub-pages keep it highlighted (/belajar/…). Akun Latihan
// follows the Trading Game because it opens after it. `key` names the label
// in the nav catalogue (messages/*/nav.json, items.*). `children` are listed
// under their parent behind an arrow (Asesmen under Belajar 101). `tour` is
// the guided tour's target for the link (lib/tours.ts).
export type NavChild = { href: string; key: string; icon: LucideIcon }
export type NavItem = NavChild & { match?: "prefix"; children?: NavChild[]; tour?: string }

export const navItems: NavItem[] = [
  { href: "/dashboard", key: "dashboard", icon: Home, tour: "nav-dashboard" },
  { href: "/trading-game", key: "tradingGame", icon: LineChart, tour: "nav-trading-game" },
  { href: "/akun-latihan", key: "akunLatihan", icon: Wallet, match: "prefix", tour: "nav-akun-latihan" },
  { href: "/ai-evaluation", key: "aiEvaluation", icon: BrainCircuit, tour: "nav-ai-evaluation" },
  {
    href: "/belajar",
    key: "belajar",
    icon: BookOpen,
    match: "prefix",
    tour: "nav-belajar",
    children: [{ href: "/belajar/asesmen", key: "asesmen", icon: ClipboardList }],
  },
  { href: "/pengaturan", key: "pengaturan", icon: Settings, tour: "nav-pengaturan" },
]
