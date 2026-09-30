import type { Metadata, Viewport } from "next"
import { Atkinson_Hyperlegible, Bricolage_Grotesque, JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google"
import localFont from "next/font/local"
import { SpotlightRoot } from "@/components/spotlight-root"
import { DEFAULT_HTML_ATTRS, PREFS_BOOT } from "@/lib/preferences"
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

// Reading fonts from Settings. Not preloaded: the browser only downloads one
// when a player switches it on (html[data-font] in globals.css).
const dyslexic = localFont({
  src: [
    { path: "../node_modules/@fontsource/opendyslexic/files/opendyslexic-latin-400-normal.woff2", weight: "400" },
    { path: "../node_modules/@fontsource/opendyslexic/files/opendyslexic-latin-700-normal.woff2", weight: "700" },
  ],
  variable: "--font-dyslexic",
  preload: false,
  display: "swap",
})
const readable = Atkinson_Hyperlegible({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-readable",
  preload: false,
})

export const metadata: Metadata = {
  // Pages set a short `title`; the template adds the brand once.
  title: { default: "TRY-REX | AI Trading Mentor", template: "%s | TRY-REX" },
  description:
    "Belajar trading lewat latihan harian dengan data harga asli, evaluasi AI, dan progres yang terukur bersama TRY-REX, mentor trading AI-mu.",
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0e0b" },
    { media: "(prefers-color-scheme: light)", color: "#f6f4ee" },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // The server renders the default preferences; PREFS_BOOT swaps in the
    // saved ones before first paint, so <html> legitimately differs from the
    // server HTML. suppressHydrationWarning covers <html>'s attributes only.
    <html
      lang="id"
      {...DEFAULT_HTML_ATTRS}
      className={`${bricolage.variable} ${jakarta.variable} ${jetbrains.variable} ${dyslexic.variable} ${readable.variable} bg-background`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: PREFS_BOOT }} />
      </head>
      <body className="text-foreground">
        {children}
        <SpotlightRoot />
      </body>
    </html>
  )
}
