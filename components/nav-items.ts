import { BookOpen, BrainCircuit, Home, LineChart, Settings, Wallet } from "lucide-react"

// Single source of truth for the app-shell nav: rendered by both the desktop
// sidebar and the mobile drawer. Register new /app routes here. `match` marks
// a section whose sub-pages keep it highlighted (/belajar/…). Akun Latihan
// follows the Trading Game because it opens after it. `key` names the label
// in the nav catalogue (messages/*/nav.json, items.*).
export const navItems = [
  { href: "/dashboard", key: "dashboard", icon: Home },
  { href: "/trading-game", key: "tradingGame", icon: LineChart },
  { href: "/akun-latihan", key: "akunLatihan", icon: Wallet, match: "prefix" as const },
  { href: "/ai-evaluation", key: "aiEvaluation", icon: BrainCircuit },
  { href: "/belajar", key: "belajar", icon: BookOpen, match: "prefix" as const },
  { href: "/pengaturan", key: "pengaturan", icon: Settings },
]
