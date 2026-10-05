import { BookOpen, BrainCircuit, Home, LineChart, Settings, Wallet } from "lucide-react"

// Single source of truth for the app-shell nav: rendered by both the desktop
// sidebar and the mobile drawer. Register new /app routes here. `match` marks
// a section whose sub-pages keep it highlighted (/belajar/…). Akun Latihan
// follows the Trading Game because it opens after it. `tour` is the
// data-tour value the guided tours point at (lib/tours.ts).
export const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home, tour: "nav-dashboard" },
  { href: "/trading-game", label: "Trading Game", icon: LineChart, tour: "nav-trading-game" },
  { href: "/akun-latihan", label: "Akun Latihan", icon: Wallet, match: "prefix" as const, tour: "nav-akun-latihan" },
  { href: "/ai-evaluation", label: "AI Evaluation", icon: BrainCircuit, tour: "nav-ai-evaluation" },
  { href: "/belajar", label: "Belajar 101", icon: BookOpen, match: "prefix" as const, tour: "nav-belajar" },
  { href: "/pengaturan", label: "Pengaturan", icon: Settings, tour: "nav-pengaturan" },
]
