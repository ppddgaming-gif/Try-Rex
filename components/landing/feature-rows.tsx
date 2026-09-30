import { GlowPanel, AspectMockup, RevealMockup, ChatMockup } from "./showcase"

type Feature = {
  eyebrow: string
  title: string
  body: string
  mockup: React.ReactNode
  reverse?: boolean
}

const features: Feature[] = [
  {
    eyebrow: "AI Evaluation",
    title: "Setiap keputusan dievaluasi secara mendalam",
    body: "TRY-REX membedah entry, timing, dan manajemen risikomu lalu memberi skor, alasan yang jelas, dan saran konkret—seperti punya mentor pribadi di setiap trade.",
    mockup: <ChatMockup />,
  },
  {
    eyebrow: "Trading Game",
    title: "Latih insting lewat simulasi market nyata",
    body: "Setiap soal adalah chart forex historis asli dengan 15 candle berikutnya disembunyikan. Pilih BUY, SELL, atau WAIT, lalu lihat apa yang benar-benar terjadi. 5 soal per sesi, tanpa risiko uang.",
    mockup: <RevealMockup />,
    reverse: true,
  },
  {
    eyebrow: "Progress Tracking",
    title: "Pantau perkembangan di setiap aspek trading",
    body: "Dari trend reading sampai market structure, lihat kekuatan dan kelemahanmu dalam grafik yang mudah dibaca, dan naik level seiring konsistensimu.",
    mockup: <AspectMockup />,
  },
]

export function FeatureRows() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-5 pb-16 pt-4 lg:px-8 lg:pb-24 lg:pt-8">
      <div className="flex flex-col gap-16 lg:gap-28">
        {features.map((f) => (
          <div
            key={f.title}
            className="reveal grid items-center gap-8 lg:grid-cols-2 lg:gap-16"
          >
            <div className={f.reverse ? "lg:order-2" : ""}>
              <p className="eyebrow">{f.eyebrow}</p>
              <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
                {f.title}
              </h2>
              <p className="mt-4 max-w-md text-pretty leading-relaxed text-muted-foreground">
                {f.body}
              </p>
            </div>
            <div className={f.reverse ? "lg:order-1" : ""}>
              <GlowPanel>{f.mockup}</GlowPanel>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
