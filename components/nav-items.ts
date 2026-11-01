import { BookOpen, BrainCircuit, ClipboardList, Home, LineChart, Settings, Wallet, type LucideIcon } from "lucide-react"

// Single source of truth for the app-shell nav: rendered by both the desktop
// sidebar and the mobile drawer. Register new /app routes here. `match` marks
// a section whose sub-pages keep it highlighted (/belajar/…). Akun Latihan
// follows the Trading Game because it opens after it. `key` names the label
// in the nav catalogue (messages/*/nav.json, items.*). `children` are listed
// under their parent behind an arrow (Asesmen under Belajar 101).
export type NavChild = { href: string; key: string; icon: LucideIcon }
export type NavItem = NavChild & { match?: "prefix"; children?: NavChild[] }

export const navItems: NavItem[] = [
  { href: "/dashboard", key: "dashboard", icon: Home },
  { href: "/trading-game", key: "tradingGame", icon: LineChart },
  { href: "/akun-latihan", key: "akunLatihan", icon: Wallet, match: "prefix" },
  { href: "/ai-evaluation", key: "aiEvaluation", icon: BrainCircuit },
  {
    href: "/belajar",
    key: "belajar",
    icon: BookOpen,
    match: "prefix",
    children: [{ href: "/belajar/asesmen", key: "asesmen", icon: ClipboardList }],
  },
  { href: "/pengaturan", key: "pengaturan", icon: Settings },
]
