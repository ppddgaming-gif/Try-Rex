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
  // Pages set a short `title`; the template adds the brand once.
  title: { default: "TRY-REX | AI Trading Mentor", template: "%s | TRY-REX" },
  description:
    "Belajar trading lewat latihan harian dengan data harga asli, evaluasi AI, dan progres yang terukur bersama TRY-REX, mentor trading AI-mu.",
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
      lang="id"
      className={`${bricolage.variable} ${jakarta.variable} ${jetbrains.variable} bg-background`}
    >
      <body className="text-foreground">{children}</body>
    </html>
  )
}
