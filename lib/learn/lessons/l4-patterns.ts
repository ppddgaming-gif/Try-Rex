import type { Lesson } from "@/lib/learn/types"
import { tx } from "@/lib/learn/lessons/tx"

// From "11_Pola_Harga_Chart_Pattern.pdf". Left out for beginners: the stop
// loss option tables, the USD/JPY example, failed patterns as signals and
// the case study. The handout's pattern figures are illustrations, so no
// chart is shown here: none is drawn by hand.

export const patterns: Lesson = {
  slug: "pola-harga",
  level: 4,
  minutes: 8,
  title: tx("Pola pergerakan harga (chart pattern)", "Price patterns (chart patterns)"),
  summary: tx(
    "Bentuk-bentuk yang berulang di chart: cara mengenali, memverifikasi, dan memakainya tanpa tertipu imajinasi sendiri.",
    "Shapes that repeat on a chart: how to recognise, verify and use them without being fooled by your own imagination.",
  ),
  material: ["11_Pola_Harga_Chart_Pattern.pdf"],
  blocks: [
    {
      kind: "p",
      text: tx(
        "Pasar digerakkan oleh keputusan manusia. Ketika banyak orang menghadapi situasi serupa, misalnya harga berulang kali ditolak di level yang sama, perilaku mereka cenderung serupa, dan jejaknya tampak sebagai bentuk di chart. Trader menamai bentuk-bentuk yang sering muncul itu chart pattern atau pola harga.",
        "Markets are moved by human decisions. When many people face a similar situation, for example price repeatedly rejected at the same level, they tend to behave alike, and the trace shows up as a shape on the chart. Traders name these recurring shapes chart patterns or price patterns.",
      ),
    },
    {
      kind: "p",
      text: tx(
        "Pola harga bukan bola kristal. Nilai terbesar sebuah pola ada pada titik invalidasinya yang jelas dan target kasar yang bisa dihitung, sehingga rencana risiko-imbalan bisa dibuat sebelum masuk.",
        "A price pattern is not a crystal ball. Its greatest value is a clear invalidation point and a rough target you can calculate, so a risk-reward plan can be made before you enter.",
      ),
    },
    {
      kind: "callout",
      tone: "warning",
      title: tx("Dua peringatan sejak awal", "Two warnings up front"),
      text: tx(
        "Pola bersifat subjektif: dua orang bisa melihat chart yang sama dan hanya satu yang menemukan pola. Otak manusia pandai menemukan bentuk, bahkan pada data acak, jadi aturan yang tegas lebih penting daripada \"terlihat mirip\". Klaim akurasi pola juga harus dicurigai: angka seperti \"pola ini 80% berhasil\" jarang bisa diverifikasi. Ukur sendiri dengan jurnal.",
        "Patterns are subjective: two people can look at the same chart and only one finds a pattern. The human brain is good at finding shapes, even in random data, so firm rules matter more than \"looks similar\". Claims about a pattern's accuracy should also be doubted: figures like \"this pattern works 80% of the time\" can rarely be verified. Measure it yourself with a journal.",
      ),
    },

    { kind: "heading", text: tx("Dua keluarga besar pola", "Two big families of patterns") },
    {
      kind: "table",
      head: [tx("Keluarga", "Family"), tx("Arti", "Meaning"), tx("Contoh", "Examples"), tx("Yang diharapkan", "What's expected")],
      rows: [
        [tx("Reversal (pembalikan)", "Reversal"), tx("Tren yang berjalan mulai kehabisan tenaga", "The current trend is running out of steam"), tx("Double top/bottom, head and shoulders", "Double top/bottom, head and shoulders"), tx("Tren berbalik arah setelah pola selesai", "The trend reverses once the pattern completes")],
        [tx("Continuation (kelanjutan)", "Continuation"), tx("Jeda atau konsolidasi di tengah tren", "A pause or consolidation within a trend"), tx("Triangle, flag, pennant, rectangle", "Triangle, flag, pennant, rectangle"), tx("Tren melanjutkan arah semula setelah breakout", "The trend continues its direction after the breakout")],
      ],
    },
    {
      kind: "points",
      title: tx("Elemen yang dimiliki setiap pola", "What every pattern has"),
      items: [
        tx("Konteks: tren sebelumnya.", "Context: the trend before it."),
        tx("Bentuk: titik-titik swing.", "Shape: the swing points."),
        tx("Garis kunci: neckline atau batas pola.", "Key line: the neckline or the pattern's boundary."),
        tx("Konfirmasi: close menembus garis kunci.", "Confirmation: a close through the key line."),
        tx("Invalidasi: harga yang membatalkan pola.", "Invalidation: the price that cancels the pattern."),
        tx("Target kasar: umumnya diukur dari tinggi pola.", "Rough target: usually measured from the pattern's height."),
      ],
    },

    { kind: "heading", text: tx("Double top dan double bottom", "Double top and double bottom") },
    {
      kind: "callout",
      tone: "definition",
      title: tx("Double top", "Double top"),
      text: tx(
        "Dua puncak dengan ketinggian hampir sama, dipisah satu lembah. Menandakan pembeli gagal dua kali menembus level yang sama. Pola dianggap selesai setelah harga menutup di bawah neckline (low lembah). Double bottom adalah cerminannya.",
        "Two peaks of almost the same height, separated by a trough. It shows buyers failing twice to break the same level. The pattern counts as complete once price closes below the neckline (the trough's low). A double bottom is its mirror image.",
      ),
    },
    {
      kind: "calc",
      title: tx("Double top EUR/USD (angka dibulatkan untuk pembelajaran)", "An EUR/USD double top (numbers rounded for learning)"),
      lines: [
        tx("Puncak 1 = 1,0900 ; puncak 2 = 1,0897 ; neckline (low lembah) = 1,0822", "Peak 1 = 1.0900 ; peak 2 = 1.0897 ; neckline (trough low) = 1.0822"),
        tx("Tinggi pola = 1,0900 − 1,0822 = 78 pip", "Pattern height = 1.0900 − 1.0822 = 78 pips"),
        tx("Target kasar = 1,0822 − 0,0078 = 1,0744", "Rough target = 1.0822 − 0.0078 = 1.0744"),
        tx("Sinyal: close di bawah neckline", "Signal: a close below the neckline"),
      ],
      note: tx(
        "Invalidasi: harga menutup di atas puncak tertinggi. Kalau stop loss yang masuk akal membuat RR di bawah 1, lewati saja; tidak setiap pola layak dimainkan.",
        "Invalidation: price closes above the highest peak. If a sensible stop loss gives an RR below 1, skip it; not every pattern is worth trading.",
      ),
    },

    { kind: "heading", text: tx("Head and shoulders", "Head and shoulders") },
    {
      kind: "callout",
      tone: "definition",
      title: tx("Head and shoulders", "Head and shoulders"),
      text: tx(
        "Tiga puncak: bahu kiri, kepala (paling tinggi), dan bahu kanan (kira-kira setinggi bahu kiri), dengan dua lembah di antaranya yang dihubungkan menjadi neckline. Setelah tren naik, pola ini menandakan pembeli kehilangan dorongan. Inverse head and shoulders adalah cerminannya setelah tren turun.",
        "Three peaks: a left shoulder, a head (the highest) and a right shoulder (about as high as the left), with two troughs between them joined to form the neckline. After an uptrend, it shows buyers losing momentum. An inverse head and shoulders is its mirror after a downtrend.",
      ),
    },
    {
      kind: "calc",
      title: tx("Head and shoulders EUR/USD", "An EUR/USD head and shoulders"),
      lines: [
        tx("Bahu kiri 1,0880 ; kepala 1,0930 ; bahu kanan 1,0885 ; neckline ≈ 1,0834", "Left shoulder 1.0880 ; head 1.0930 ; right shoulder 1.0885 ; neckline ≈ 1.0834"),
        tx("Tinggi pola = 1,0930 − 1,0834 = 96 pip", "Pattern height = 1.0930 − 1.0834 = 96 pips"),
        tx("Target kasar = 1,0834 − 0,0096 = 1,0738", "Rough target = 1.0834 − 0.0096 = 1.0738"),
      ],
    },

    { kind: "heading", text: tx("Segitiga, flag, pennant, rectangle", "Triangles, flags, pennants, rectangles") },
    {
      kind: "table",
      head: [tx("Segitiga", "Triangle"), tx("Batas atas", "Upper edge"), tx("Batas bawah", "Lower edge"), tx("Kecenderungan", "Tendency")],
      rows: [
        [tx("Ascending", "Ascending"), tx("Datar (resistance)", "Flat (resistance)"), tx("Naik (higher lows)", "Rising (higher lows)"), tx("Tekanan beli; breakout ke atas lebih sering diharapkan", "Buying pressure; an upward breakout is more often expected")],
        [tx("Descending", "Descending"), tx("Turun (lower highs)", "Falling (lower highs)"), tx("Datar (support)", "Flat (support)"), tx("Tekanan jual; breakout ke bawah lebih sering diharapkan", "Selling pressure; a downward breakout is more often expected")],
        [tx("Symmetrical", "Symmetrical"), tx("Turun (lower highs)", "Falling (lower highs)"), tx("Naik (higher lows)", "Rising (higher lows)"), tx("Arah belum pasti; ikuti sisi breakout", "Direction unclear; follow the side that breaks")],
      ],
      note: tx(
        "Kata \"kecenderungan\" berarti tidak pasti. Ascending triangle bisa jebol ke bawah. Yang menentukan adalah close yang menembus, bukan nama pola.",
        "\"Tendency\" means not certain. An ascending triangle can break down. What decides is the close that breaks through, not the pattern's name.",
      ),
    },
    {
      kind: "table",
      head: [tx("Pola", "Pattern"), tx("Bentuk", "Shape"), tx("Target kasar", "Rough target")],
      rows: [
        [tx("Flag", "Flag"), tx("Dorongan tajam (tiang), lalu koreksi kecil berbentuk saluran miring berlawanan arah", "A sharp push (the pole), then a small correction shaped like a channel sloping the other way"), tx("Titik breakout flag + panjang tiang", "The flag's breakout point + the pole's length")],
        [tx("Pennant", "Pennant"), tx("Seperti flag tetapi koreksinya segitiga kecil", "Like a flag but the correction is a small triangle"), tx("Titik breakout + panjang tiang", "The breakout point + the pole's length")],
        [tx("Rectangle", "Rectangle"), tx("Harga bergerak di antara support dan resistance datar", "Price moves between flat support and resistance"), tx("Breakout + tinggi rectangle", "Breakout + the rectangle's height")],
      ],
    },
    {
      kind: "steps",
      title: tx("Langkah memverifikasi sebuah pola", "Steps to verify a pattern"),
      items: [
        tx("Tentukan timeframe dan jangan berganti sampai penilaian selesai.", "Pick a timeframe and don't switch until the assessment is done."),
        tx("Cek konteks: pola reversal butuh tren sebelumnya; pola kelanjutan butuh dorongan sebelumnya.", "Check the context: a reversal pattern needs a prior trend; a continuation pattern needs a prior push."),
        tx("Tarik garis kunci dan hitung tinggi pola.", "Draw the key line and measure the pattern's height."),
        tx("Tunggu konfirmasi: close menembus garis kunci.", "Wait for confirmation: a close through the key line."),
        tx("Tulis rencana: entry, SL, target, RR. Jika RR tidak layak, lewati.", "Write the plan: entry, SL, target, RR. If the RR isn't worth it, skip."),
      ],
    },
    {
      kind: "points",
      title: tx("Kesalahan umum", "Common mistakes"),
      items: [
        tx("Menjual atau membeli sebelum pola selesai. Pola baru sah setelah close menembus garis kunci.", "Selling or buying before the pattern completes. A pattern only counts after a close through the key line."),
        tx("Memaksa bentuk. Jika harus menyipitkan mata untuk melihat polanya, polanya tidak ada.", "Forcing the shape. If you have to squint to see the pattern, it isn't there."),
        tx("Mengabaikan konteks. Double top di tengah range bukan sinyal pembalikan tren.", "Ignoring context. A double top in the middle of a range is not a reversal signal."),
        tx("Menganggap nama pola sebagai arah pasti.", "Treating the pattern's name as a sure direction."),
      ],
    },
    {
      kind: "check",
      items: [
        { q: tx("Kapan double top dianggap selesai?", "When is a double top complete?"), a: tx("Setelah close di bawah neckline (low lembah).", "After a close below the neckline (the trough's low).") },
        { q: tx("Puncak 1,2050 ; neckline 1,1950. Target kasar double top?", "Peak 1.2050 ; neckline 1.1950. The double top's rough target?"), a: tx("Tinggi 100 pip; target 1,1950 − 0,0100 = 1,1850.", "Height 100 pips; target 1.1950 − 0.0100 = 1.1850.") },
        { q: tx("Tiang flag 80 pip, breakout di 1,1000. Target kasar?", "Flag pole 80 pips, breakout at 1.1000. Rough target?"), a: tx("1,1000 + 0,0080 = 1,1080.", "1.1000 + 0.0080 = 1.1080.") },
        { q: tx("Apa beda reversal dan continuation pattern?", "The difference between reversal and continuation patterns?"), a: tx("Reversal menandakan pembalikan tren; continuation menandakan jeda sebelum lanjut.", "Reversal signals a trend reversal; continuation signals a pause before carrying on.") },
      ],
    },
  ],
  sources: [
    { title: "Price Patterns", publisher: "Fyers School of Stocks" },
    { title: "Price Patterns", publisher: "Medium (Eight Beginners Section)" },
    { title: "Market Structure (Price Action)", publisher: "CrossTrade", url: "https://crosstrade.io/learn/price-action/market-structure" },
  ],
}
