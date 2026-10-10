import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { DemoDisclaimer } from "@/components/akun-latihan/disclaimer"

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("demo.ui.meta"))("section") }
}

// Every Akun Latihan screen: the same header and the virtual-balance line.
export default async function AkunLatihanLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("demo.ui.layout")
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-5 lg:px-8">
      <header className="enter">
        <p className="eyebrow">{t("eyebrow")}</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">{t("title")}</h1>
        <div className="mt-3">
          <DemoDisclaimer />
        </div>
      </header>
      <div className="enter mt-6" style={{ "--enter-delay": "60ms" } as React.CSSProperties}>
        {children}
      </div>
    </div>
  )
}
