const quotes = [
  {
    body: "Dulu aku sering entry kecepatan. Setelah pakai TRY-REX, aku belajar nunggu konfirmasi dan win rate-ku naik signifikan.",
    name: "Dimas Pratama",
    role: "Trader Pemula",
  },
  {
    body: "Evaluasinya detail banget. Bukan cuma bilang salah, tapi jelasin kenapa dan apa yang harus diperbaiki.",
    name: "Sarah Wijaya",
    role: "Swing Trader",
  },
  {
    body: "Trading Game-nya bikin nagih. Belajar trading jadi terasa kayak main game, tapi ilmunya beneran nempel.",
    name: "Rian Hidayat",
    role: "Mahasiswa",
  },
  {
    body: "Fitur progress per aspek membantuku tahu persis kelemahanku di risk management. Sekarang jauh lebih disiplin.",
    name: "Putri Anggraini",
    role: "Part-time Trader",
  },
  {
    body: "Mentor AI yang sabar dan selalu ada. Setiap keputusan dapat feedback instan, nggak perlu nunggu komunitas.",
    name: "Bayu Santoso",
    role: "Day Trader",
  },
  {
    body: "Dalam sebulan latihan harian, pemahamanku soal market structure naik dari 50% ke 78%. Worth it banget.",
    name: "Nadia Kusuma",
    role: "Forex Enthusiast",
  },
]

export function Testimonials() {
  return (
    <section id="testimonials" className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
          Apa kata para trader
        </h2>
        <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
          Ribuan trader pemula meningkatkan konsistensi mereka bersama TRY-REX.
        </p>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {quotes.map((q) => (
          <figure key={q.name} className="flex flex-col rounded-2xl border border-border bg-card p-6">
            <blockquote className="flex-1 text-sm leading-relaxed text-pretty">{`"${q.body}"`}</blockquote>
            <figcaption className="mt-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary ring-1 ring-primary/30">
                {q.name.charAt(0)}
              </div>
              <div className="leading-tight">
                <p className="text-sm font-semibold">{q.name}</p>
                <p className="text-xs text-muted-foreground">{q.role}</p>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
