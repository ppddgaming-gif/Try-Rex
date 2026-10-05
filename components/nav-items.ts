import { BookOpen, BrainCircuit, Home, LineChart, Settings, Wallet } from "lucide-react"

// Single source of truth for the app-shell nav: rendered by both the desktop
// sidebar and the mobile drawer. Register new /app routes here. `match` marks
// a section whose sub-pages keep it highlighted (/belajar/…). Akun Latihan
// follows the Trading Game because it opens after it.
export const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/trading-game", label: "Trading Game", icon: LineChart },
  { href: "/akun-latihan", label: "Akun Latihan", icon: Wallet, match: "prefix" as const },
  { href: "/ai-evaluation", label: "AI Evaluation", icon: BrainCircuit },
  { href: "/belajar", label: "Belajar 101", icon: BookOpen, match: "prefix" as const },
  { href: "/pengaturan", label: "Pengaturan", icon: Settings },
]
