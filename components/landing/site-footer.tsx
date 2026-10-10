import Link from "next/link"
import { Rex } from "@/components/rex-mascot"
import { useTranslations } from "next-intl"

// Labels: landing.footer.<key>.
const cols = [
  {
    title: "product",
    links: [
      { key: "dashboard", href: "/dashboard" },
      { key: "game", href: "/trading-game" },
      { key: "evaluation", href: "/ai-evaluation" },
    ],
  },
  {
    title: "resources",
    links: [
      { key: "learn", href: "/belajar" },
      { key: "glossary", href: "/belajar/kamus" },
      { key: "how", href: "/#how" },
      { key: "features", href: "/#features" },
    ],
  },
  {
    title: "legal",
    links: [
      { key: "privacy", href: "/privacy" },
      { key: "terms", href: "/terms" },
      { key: "disclaimer", href: "/disclaimer" },
    ],
  },
]

export function SiteFooter() {
  const t = useTranslations("landing.footer")
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        {/* Three short link columns fit side by side even on a phone. */}
        <div className="grid grid-cols-3 gap-x-6 gap-y-10 lg:grid-cols-5">
          <div className="col-span-3 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <Rex size={30} />
              <span className="font-display text-[17px] font-extrabold tracking-[-0.02em]">TRY-REX</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {t("tagline")}
            </p>
          </div>

          {cols.map((c) => (
            <div key={c.title}>
              <p className="text-sm font-semibold">{t(c.title)}</p>
              <ul className="mt-2 flex flex-col">
                {c.links.map((l) => (
                  <li key={l.key}>
                    <Link
                      href={l.href}
                      className="inline-flex min-h-11 items-center rounded text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {t(l.key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            {t("rights", { year: new Date().getFullYear() })}
          </p>
          <p className="text-xs text-muted-foreground">
            {t("risk")}
          </p>
        </div>
      </div>
    </footer>
  )
}
