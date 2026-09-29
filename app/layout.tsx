import type { Metadata, Viewport } from "next"
import { Bricolage_Grotesque, JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google"
import "./globals.css"

// Headings. The optical-size axis keeps large display type tight and small
// titles open, as the design specifies.
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-bricolage",
})

// Body text.
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
})

// Prices, percentages, XP: anything that has to line up.
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
})

export const metadata: Metadata = {
  title: "TRY-REX | AI Trading Mentor",
  description:
    "Learn trading through gamified challenges, AI evaluation, and real-time market simulations with TRY-REX, your AI trading mentor.",
}

export const viewport: Viewport = {
  themeColor: "#0a0e0b",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${jakarta.variable} ${jetbrains.variable} bg-background`}
    >
      <body className="bg-background text-foreground">{children}</body>
    </html>
  )
}
