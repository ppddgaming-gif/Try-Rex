import type { Metadata } from "next"
import { DemoDisclaimer } from "@/components/akun-latihan/disclaimer"

export const metadata: Metadata = { title: "Akun Latihan" }

// Every Akun Latihan screen: the same header and the virtual-balance line.
export default function AkunLatihanLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-5xl px-5 py-6 lg:px-8">
      <header className="enter">
        <p className="eyebrow">Akun Latihan</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">Trading dengan rencana, bukan tebakan</h1>
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
