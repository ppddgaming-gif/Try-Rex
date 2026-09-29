import { Home, LineChart, BrainCircuit } from "lucide-react"

// Single source of truth for the app-shell nav: rendered by both the desktop
// sidebar and the mobile drawer. Register new /app routes here.
export const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/trading-game", label: "Trading Game", icon: LineChart },
  { href: "/ai-evaluation", label: "AI Evaluation", icon: BrainCircuit },
]
