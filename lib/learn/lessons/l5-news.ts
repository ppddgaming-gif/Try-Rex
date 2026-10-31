import type { Lesson } from "@/lib/learn/types"
import { tx } from "@/lib/learn/lessons/tx"

// From "L5-5_Berita_Ekonomi_Berdampak_Tinggi.pdf". Left out: the October
// 2026 cases (dated figures), the SNB 2015 episode (the handout itself
// didn't re-verify it), the "both directions" pending-order walk-through,
// the order-type table and two of the three decision scenarios.

export const news: Lesson = {
  slug: "berita-berdampak-tinggi",
  level: 5,
  minutes: 7,
  title: tx("Berita ekonomi berdampak tinggi", "High-impact economic news"),
  summary: tx(
    "Apa yang terjadi pada harga saat berita besar dirilis, mengapa risikonya berbeda, dan cara bersikap yang aman untuk pemula.",
    "What happens to price when big news is released, why the risk is different, and how beginners can handle it safely.",
  ),
  material: ["L5-5_Berita_Ekonomi_Berdampak_Tinggi.pdf"],
  blocks: [
    {
      kind: "callout",
      tone: "note",
      title: tx("Pesan inti", "The core message"),
      text: tx(
        "Berita besar bukan peluang gratis dan juga bukan sesuatu yang harus selalu dihindari. Ia adalah kondisi pasar yang berbeda: lebih cepat, lebih mahal untuk ditransaksikan, dan lebih sulit ditebak. Trader yang bertahan bukan yang paling berani, melainkan yang punya aturan tertulis untuk saat-saat seperti ini.",
        "Big news is neither a free opportunity nor something to always avoid. It is a different market condition: faster, more expensive to trade and harder to predict. The traders who last aren't the bravest but the ones with written rules for these moments.",
      ),
    },
    {
      kind: "points",
      title: tx("Yang membuat berita menjadi \"berdampak tinggi\"", "What makes news \"high impact\""),
      items: [
        tx("Mengubah dugaan suku bunga. Apa pun yang menggeser dugaan tentang suku bunga akan menggeser nilai mata uang.", "It changes rate expectations. Anything that shifts expectations about interest rates shifts the currency's value."),
        tx("Banyak pelaku pasar memperhatikannya sekaligus, sehingga volume dan kecepatan melonjak.", "Many market players watch it at once, so volume and speed jump."),
        tx("Sering menghasilkan kejutan: selisih dari dugaan menimbulkan gerakan besar.", "It often brings surprises: the gap from expectations causes big moves."),
      ],
    },
    {
      kind: "table",
      head: [tx("Berita", "News"), tx("Mengapa penting", "Why it matters")],
      rows: [
        [tx("Keputusan suku bunga bank sentral", "Central bank rate decisions"), tx("Langsung menentukan harga uang; dua gerakan: saat keputusan, lalu saat konferensi pers", "Directly sets the price of money; two moves: at the decision, then at the press conference")],
        [tx("Laporan tenaga kerja AS (NFP)", "US jobs report (NFP)"), tx("Cermin kekuatan ekonomi terbesar dunia dan petunjuk arah bunga The Fed", "A mirror of the world's biggest economy and a hint of the Fed's rate path")],
        [tx("Inflasi (CPI, PCE)", "Inflation (CPI, PCE)"), tx("Inti dari keputusan bunga; core dan m/m sering lebih penting dari headline", "The heart of rate decisions; core and m/m often matter more than the headline")],
        [tx("GDP, penjualan ritel, PMI", "GDP, retail sales, PMI"), tx("Ukuran pertumbuhan, belanja konsumen, dan kondisi bisnis", "Measures of growth, consumer spending and business conditions")],
        [tx("Pidato pejabat bank sentral", "Central bank officials' speeches"), tx("Bisa menggeser dugaan arah kebijakan; ketua lebih berbobot", "Can shift policy expectations; the chair carries more weight")],
        [tx("Peristiwa geopolitik dan keputusan mendadak", "Geopolitical events and sudden decisions"), tx("Mengubah sentimen risiko dalam sekejap; tidak ada di kalender", "Change risk sentiment in an instant; not on the calendar")],
      ],
    },

    { kind: "heading", text: tx("Anatomi reaksi pasar", "Anatomy of the market's reaction") },
    {
      kind: "table",
      head: [tx("Fase", "Phase"), tx("Yang terjadi", "What happens"), tx("Risiko utama", "Main risk")],
      rows: [
        [tx("1. Sebelum rilis", "1. Before the release"), tx("Banyak trader menahan diri; likuiditas bisa menipis; harga berkonsolidasi", "Many traders hold back; liquidity can thin; price consolidates"), tx("Posisi besar yang ditahan tanpa rencana", "A big position held without a plan")],
        [tx("2. Detik pertama", "2. The first seconds"), tx("Algoritma bereaksi pada angka headline; harga melompat dan spread melebar", "Algorithms react to the headline; price jumps and spreads widen"), tx("Slippage besar; order terisi jauh dari harga yang diinginkan", "Large slippage; orders filled far from the wanted price")],
        [tx("3. Beberapa menit", "3. A few minutes"), tx("Pasar membaca komponen lain (revisi, core, upah); harga bisa berbalik arah", "The market reads the other components (revisions, core, wages); price can reverse"), tx("Whipsaw: stop terkena di dua sisi", "Whipsaw: stops hit on both sides")],
        [tx("4. Jam-jam berikut", "4. The following hours"), tx("Spread kembali normal; arah yang lebih stabil mulai terbentuk bila ada", "Spreads return to normal; a steadier direction forms, if any"), tx("Memaksa trade karena merasa tertinggal", "Forcing a trade from fear of missing out")],
      ],
    },

    { kind: "heading", text: tx("Empat risiko khusus saat berita besar", "Four special risks around big news") },
    {
      kind: "points",
      items: [
        tx("Spread melebar. Saat rilis besar, penyedia likuiditas menarik diri sehingga spread bisa melebar beberapa kali lipat.", "Wider spreads. On big releases, liquidity providers pull back, so spreads can widen several times over."),
        tx("Slippage: selisih antara harga yang diinginkan dan harga yang benar-benar terisi. Pada stop loss, slippage membuat kerugian lebih besar dari rencana.", "Slippage: the gap between the price you wanted and the price you actually got. On a stop loss, slippage makes the loss bigger than planned."),
        tx("Whipsaw: harga naik tajam lalu turun tajam dalam hitungan menit; stop di dua sisi bisa terkena.", "Whipsaw: price spikes up then down within minutes; stops on both sides can be hit."),
        tx("Leverage dan likuidasi: jika margin menipis, broker bisa menutup posisi otomatis (stop out) pada harga yang buruk.", "Leverage and liquidation: if margin runs thin, the broker can close positions automatically (stop out) at a bad price."),
      ],
    },
    {
      kind: "calc",
      title: tx("Hitungan slippage pada stop loss", "Slippage on a stop loss"),
      lines: [
        tx("Akun $2.000, risiko 1% = $20. Stop loss 20 pip, 0,1 lot ($1 per pip) → rencana rugi $20", "A $2,000 account, 1% risk = $20. A 20-pip stop loss, 0.1 lot ($1 per pip) → planned loss $20"),
        tx("Saat berita, stop terisi 10 pip lebih buruk: rugi 30 pip × $1 = $30", "On the news, the stop fills 10 pips worse: a loss of 30 pips × $1 = $30"),
        tx("Itu 1,5% akun, bukan 1%: 1,5 kali dari rencana, tanpa kamu berbuat salah.", "That's 1.5% of the account, not 1%: 1.5 times the plan, without you doing anything wrong."),
      ],
    },
    {
      kind: "callout",
      tone: "warning",
      title: tx("Jangan mengandalkan stop loss saja", "Don't rely on the stop loss alone"),
      text: tx(
        "Stop loss adalah perintah yang dieksekusi di harga pasar ketika level tercapai, bukan jaminan harga tertentu. Pada lonjakan ekstrem atau gap, harga eksekusi bisa jauh dari level yang kamu tetapkan.",
        "A stop loss is an order filled at the market price once its level is reached, not a guarantee of a particular price. In an extreme spike or a gap, the fill can be far from your level.",
      ),
    },

    { kind: "heading", text: tx("Tiga sikap menghadapi berita", "Three ways to face the news") },
    {
      kind: "table",
      head: [tx("Sikap", "Approach"), tx("Cara kerjanya", "How it works"), tx("Cocok untuk", "Suits")],
      rows: [
        [tx("A. Menghindar", "A. Stay away"), tx("Tidak membuka posisi baru sekitar rilis; menutup posisi lama sebelum rilis", "No new positions around the release; close old ones before it"), tx("Pemula", "Beginners")],
        [tx("B. Menunggu sesudahnya", "B. Wait for afterwards"), tx("Menunggu spread normal dan arah lebih jelas, lalu mencari setup", "Wait for normal spreads and a clearer direction, then look for a setup"), tx("Pemula yang sudah disiplin", "Disciplined beginners")],
        [tx("C. Memperdagangkan kejutan", "C. Trade the surprise"), tx("Masuk sangat cepat berdasarkan selisih actual dan forecast", "Enter very fast on the gap between actual and forecast"), tx("Trader berpengalaman", "Experienced traders")],
      ],
      note: tx(
        "Sumber-sumber materi ini konsisten mengarah ke sikap A atau B saat kamu baru belajar.",
        "The handout's sources consistently point to A or B while you're still learning.",
      ),
    },
    {
      kind: "calc",
      title: tx("Ukuran posisi di hari berita: stop lebih lebar, posisi lebih kecil", "Position size on news days: a wider stop, a smaller position"),
      lines: [
        tx("Hari biasa: risiko 1% = $20; stop 20 pip; pip $10 per lot → lot = 20 ÷ (20 × 10) = 0,10", "A normal day: 1% risk = $20; 20-pip stop; $10 per pip per lot → lots = 20 ÷ (20 × 10) = 0.10"),
        tx("Hari berita: risiko 0,5% = $10; stop 35 pip → lot = 10 ÷ (35 × 10) = 0,0286 → 0,02", "A news day: 0.5% risk = $10; 35-pip stop → lots = 10 ÷ (35 × 10) = 0.0286 → 0.02"),
        tx("Risiko sebenarnya 0,02 × 35 × $10 = $7, sisa ruang untuk slippage kecil", "Real risk 0.02 × 35 × $10 = $7, leaving room for small slippage"),
      ],
    },
    {
      kind: "table",
      head: [tx("Sebelum (H−1 s.d. T−30 menit)", "Before (D−1 to T−30 min)"), tx("Saat (T−5 s.d. T+15 menit)", "During (T−5 to T+15 min)"), tx("Sesudah (T+15 menit ke atas)", "After (T+15 min onwards)")],
      rows: [
        [tx("Cek kalender; catat jam WIB, forecast, dan previous", "Check the calendar; note the WIB time, forecast and previous"), tx("Jauhi tombol buy/sell jika tidak ikut", "Stay away from buy/sell if you're not taking part"), tx("Tunggu spread normal", "Wait for normal spreads")],
        [tx("Putuskan ikut atau tidak; tutup atau kecilkan posisi", "Decide whether to take part; close or reduce positions"), tx("Jangan mengubah stop loss ke arah yang merugikan", "Don't move the stop loss the losing way"), tx("Cari setup dengan struktur chart", "Look for a setup from chart structure")],
        [tx("Siapkan rencana tertulis; periksa margin dan spread", "Write a plan; check margin and spread"), tx("Jangan menambah posisi karena panik", "Don't add to positions in a panic"), tx("Catat di jurnal: yang terjadi vs dugaan", "Journal it: what happened vs what you expected")],
      ],
    },
    {
      kind: "points",
      title: tx("Kesalahan umum", "Common mistakes"),
      items: [
        tx("Masuk posisi besar beberapa detik sebelum rilis karena \"yakin\".", "Opening a big position seconds before a release because you're \"sure\"."),
        tx("Melonggarkan atau menghapus stop loss saat harga mendekati stop.", "Loosening or removing the stop loss as price nears it."),
        tx("Menambah posisi untuk \"menebus\" kerugian yang baru saja terjadi (revenge trading).", "Adding to positions to \"win back\" a loss just taken (revenge trading)."),
        tx("Mengira gerakan pertama pasti menunjukkan arah akhir.", "Thinking the first move shows the final direction."),
      ],
    },
    {
      kind: "check",
      items: [
        { q: tx("Sebutkan tiga ciri berita berdampak tinggi.", "Name three features of high-impact news."), a: tx("Mengubah dugaan suku bunga; diperhatikan banyak pelaku pasar sekaligus; sering menghasilkan kejutan.", "It changes rate expectations; many market players watch it at once; it often surprises.") },
        { q: tx("Akun $5.000, risiko 0,5%, stop 30 pip, pip $10 per lot. Berapa lot?", "A $5,000 account, 0.5% risk, a 30-pip stop, $10 per pip per lot. How many lots?"), a: tx("$25 ÷ (30 × 10) = 0,0833 → 0,08 lot.", "$25 ÷ (30 × 10) = 0.0833 → 0.08 lots.") },
        { q: tx("Stop 20 pip terkena dengan slippage 8 pip pada 0,1 lot ($1 per pip). Rugi sebenarnya?", "A 20-pip stop is hit with 8 pips of slippage on 0.1 lot ($1 per pip). The real loss?"), a: tx("28 pip × $1 = $28, 1,4 kali dari rencana $20.", "28 pips × $1 = $28, 1.4 times the planned $20.") },
      ],
    },
  ],
  sources: [
    { title: "Forex news trading: what risks does it have", publisher: "Central Trading" },
    { title: "Forex news trading mistakes", publisher: "NewYorkCityServers" },
    { title: "Economic calendar: five things you need to know to begin trading the news", publisher: "FXStreet", url: "https://www.fxstreet.com/education/economic-calendar-five-things-you-need-to-know-to-begin-trading-the-news-202205180843" },
  ],
}
