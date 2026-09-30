import { BookOpen, BrainCircuit, Home, LineChart, Settings } from "lucide-react"

// Single source of truth for the app-shell nav: rendered by both the desktop
// sidebar and the mobile drawer. Register new /app routes here. `match` marks
// a section whose sub-pages keep it highlighted (/belajar/…).
export const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/trading-game", label: "Trading Game", icon: LineChart },
  { href: "/ai-evaluation", label: "AI Evaluation", icon: BrainCircuit },
  { href: "/belajar", label: "Belajar 101", icon: BookOpen, match: "prefix" as const },
  { href: "/pengaturan", label: "Pengaturan", icon: Settings },
]
