import Link from "next/link"

const cols = [
  {
    title: "Produk",
    links: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Trading Game", href: "/trading-game" },
      { label: "AI Evaluation", href: "/ai-evaluation" },
    ],
  },
  {
    title: "Sumber",
    links: [
      { label: "Cara Kerja", href: "#how" },
      { label: "Fitur", href: "#features" },
      { label: "Testimoni", href: "#testimonials" },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/30">
                <span className="text-lg" aria-hidden="true">
                  🦖
                </span>
              </div>
              <span className="text-base font-extrabold tracking-tight">
                TRY<span className="text-primary">-REX</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              AI Trading Mentor yang membantumu belajar trading dengan cara yang aman, terukur, dan menyenangkan.
            </p>
          </div>

          {cols.map((c) => (
            <div key={c.title}>
              <p className="text-sm font-semibold">{c.title}</p>
              <ul className="mt-4 flex flex-col gap-2.5">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="rounded text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} TRY-REX. Semua hak dilindungi.
          </p>
          <p className="text-xs text-muted-foreground">
            Trading mengandung risiko. Konten bersifat edukasi, bukan saran finansial.
          </p>
        </div>
      </div>
    </footer>
  )
}
