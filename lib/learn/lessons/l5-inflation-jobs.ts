import type { Lesson } from "@/lib/learn/types"
import { tx } from "@/lib/learn/lessons/tx"

// From "L5-2_Inflasi_dan_Data_Tenaga_Kerja.pdf". Left out: the September
// 2026 case study (dated figures), the other countries' report table, two
// of the three practice cases and the release-day template.

export const inflationJobs: Lesson = {
  slug: "inflasi-tenaga-kerja",
  level: 5,
  minutes: 8,
  title: tx("Inflasi dan data tenaga kerja", "Inflation and jobs data"),
  summary: tx(
    "Cara membaca CPI, core CPI, NFP, dan pengangguran, dan mengapa selisih dari konsensus lebih penting daripada angkanya sendiri.",
    "How to read CPI, core CPI, NFP and unemployment, and why the gap from consensus matters more than the number itself.",
  ),
  material: ["L5-2_Inflasi_dan_Data_Tenaga_Kerja.pdf"],
  blocks: [
    {
      kind: "callout",
      tone: "note",
      title: tx("Rumus berpikir yang akan kamu pakai berulang kali", "The way of thinking you'll use again and again"),
      text: tx(
        "Data ekonomi → perkiraan arah suku bunga → mata uang. Data yang membuat pasar menduga bunga akan lebih tinggi (inflasi panas, pekerjaan kuat) cenderung menguatkan mata uang. Data yang membuat pasar menduga bunga akan lebih rendah (inflasi dingin, pekerjaan melemah) cenderung melemahkannya. Yang menggerakkan harga bukan angka mentahnya, tetapi selisihnya dari perkiraan para ekonom.",
        "Economic data → expected direction of interest rates → the currency. Data that makes the market expect higher rates (hot inflation, strong jobs) tends to strengthen the currency. Data that makes it expect lower rates (cool inflation, weakening jobs) tends to weaken it. What moves price isn't the raw number but its gap from economists' forecasts.",
      ),
    },

    { kind: "heading", text: tx("Inflasi dalam bahasa sehari-hari", "Inflation in everyday language") },
    {
      kind: "p",
      text: tx(
        "Inflasi adalah kenaikan harga barang dan jasa secara umum dari waktu ke waktu. Kalau tahun lalu seporsi nasi goreng Rp20.000 dan sekarang Rp21.000, harga itu naik 5%. Jika hampir semua harga ikut naik, uangmu membeli lebih sedikit daripada sebelumnya. Sedikit inflasi dianggap sehat; banyak bank sentral besar, termasuk The Fed, menargetkan inflasi sekitar 2% per tahun dalam jangka panjang.",
        "Inflation is the general rise in the prices of goods and services over time. If a plate of fried rice cost Rp20,000 last year and Rp21,000 now, it rose 5%. If almost all prices rise, your money buys less than before. A little inflation is considered healthy; many big central banks, including the Fed, target about 2% a year over the long run.",
      ),
    },
    {
      kind: "table",
      head: [tx("Ukuran", "Measure"), tx("Yang dihitung", "What it counts"), tx("Kegunaan untuk trader", "Use for traders")],
      rows: [
        [tx("CPI headline", "Headline CPI"), tx("Semua barang dan jasa di \"keranjang belanja\" konsumen", "All goods and services in the consumer \"basket\""), tx("Judul berita; reaksi pertama pasar", "The headline; the market's first reaction")],
        [tx("Core CPI", "Core CPI"), tx("CPI tanpa makanan dan energi", "CPI without food and energy"), tx("Tekanan harga yang lebih menetap; sering lebih dipantau bank sentral", "Stickier price pressure; often watched more by central banks")],
        [tx("PCE", "PCE"), tx("Pengeluaran konsumsi pribadi (ukuran lain)", "Personal consumption expenditures (another measure)"), tx("Ukuran resmi target 2% The Fed", "The Fed's official measure for its 2% target")],
        [tx("PPI", "PPI"), tx("Harga di tingkat produsen", "Prices at the producer level"), tx("Indikasi dini tekanan biaya yang bisa menular ke konsumen", "An early sign of cost pressure that can pass to consumers")],
      ],
    },
    {
      kind: "table",
      head: [tx("Singkatan", "Abbreviation"), tx("Artinya", "Meaning")],
      rows: [
        [tx("m/m (month on month)", "m/m (month on month)"), tx("Perubahan dibanding bulan sebelumnya", "Change from the previous month")],
        [tx("y/y (year on year)", "y/y (year on year)"), tx("Perubahan dibanding bulan yang sama tahun lalu", "Change from the same month last year")],
      ],
    },
    {
      kind: "calc",
      title: tx("Contoh hitungan y/y", "A y/y calculation"),
      lines: [
        tx("Indeks harga setahun lalu = 300,0 ; sekarang = 311,1", "Price index a year ago = 300.0 ; now = 311.1"),
        tx("Inflasi y/y = (311,1 − 300,0) ÷ 300,0 = 3,7%", "y/y inflation = (311.1 − 300.0) ÷ 300.0 = 3.7%"),
      ],
    },
    {
      kind: "table",
      head: [tx("Laju bulanan (m/m)", "Monthly rate (m/m)"), tx("Jika terulang 12 bulan", "If repeated for 12 months"), tx("Terhadap target 2%", "Against the 2% target")],
      rows: [
        [tx("0,2%", "0.2%"), tx("≈ 2,4% per tahun", "≈ 2.4% a year"), tx("Mendekati target", "Near target")],
        [tx("0,3%", "0.3%"), tx("≈ 3,7% per tahun", "≈ 3.7% a year"), tx("Di atas target", "Above target")],
        [tx("0,4%", "0.4%"), tx("≈ 4,9% per tahun", "≈ 4.9% a year"), tx("Jauh di atas target", "Well above target")],
      ],
      note: tx(
        "Angka bulanan kecil, kalau terulang setiap bulan, berlipat ganda dalam setahun. Jangan hanya melihat y/y (bisa turun karena bulan yang sama tahun lalu sangat tinggi), dan jangan menyamakan headline dengan core.",
        "A small monthly figure, repeated every month, compounds over a year. Don't look only at y/y (it can fall because the same month last year was very high), and don't confuse headline with core.",
      ),
    },

    { kind: "heading", text: tx("Mengapa inflasi menggerakkan mata uang?", "Why does inflation move currencies?") },
    {
      kind: "p",
      text: tx(
        "Jalurnya lewat suku bunga, bukan langsung: inflasi lebih tinggi dari dugaan → pasar menduga bank sentral menaikkan bunga (atau menunda penurunan) → imbal hasil obligasi naik, investor tertarik → permintaan mata uang naik. Bagi rumah tangga inflasi tinggi itu buruk, tetapi bagi nilai mata uang dalam jangka pendek inflasi yang lebih tinggi dari dugaan sering berarti mata uangnya menguat.",
        "The path runs through interest rates, not directly: inflation above expectations → the market expects the central bank to raise rates (or delay cuts) → bond yields rise, investors are drawn in → demand for the currency rises. For households high inflation is bad, but for a currency's value in the short run, inflation above expectations often means the currency strengthens.",
      ),
    },
    {
      kind: "table",
      head: [tx("Hasil CPI vs dugaan", "CPI result vs expectations"), tx("Pembacaan pasar", "Market reading"), tx("Reaksi USD yang umum", "Typical USD reaction")],
      rows: [
        [tx("Lebih tinggi dari dugaan", "Above expectations"), tx("Bank sentral mungkin lebih ketat", "The central bank may be tighter"), tx("Cenderung menguat", "Tends to strengthen")],
        [tx("Sesuai dugaan", "In line"), tx("Tidak ada kejutan", "No surprise"), tx("Reaksi kecil atau acak", "A small or random reaction")],
        [tx("Lebih rendah dari dugaan", "Below expectations"), tx("Bank sentral lebih longgar", "The central bank looser"), tx("Cenderung melemah", "Tends to weaken")],
      ],
      note: tx(
        "Pola ini tidak berlaku bila inflasi sangat tinggi dan bank sentral dianggap tertinggal, atau bila inflasi tinggi disertai ekonomi melemah (stagflasi).",
        "This pattern breaks down when inflation is very high and the central bank is seen as behind, or when high inflation comes with a weakening economy (stagflation).",
      ),
    },

    { kind: "heading", text: tx("Data tenaga kerja: apa saja yang dibaca?", "Jobs data: what gets read?") },
    {
      kind: "p",
      text: tx(
        "Kalau banyak orang bekerja dan upah naik, belanja naik dan perusahaan menaikkan harga. Itu menambah tekanan inflasi, sehingga bank sentral cenderung mempertahankan atau menaikkan bunga. Kalau lapangan kerja melemah, inflasi mereda dan bank sentral cenderung melonggarkan kebijakan.",
        "If many people are working and wages rise, spending rises and companies raise prices. That adds to inflation pressure, so the central bank tends to hold or raise rates. If jobs weaken, inflation eases and the central bank tends to loosen policy.",
      ),
    },
    {
      kind: "table",
      head: [tx("Indikator", "Indicator"), tx("Apa itu", "What it is"), tx("Cara membaca", "How to read it")],
      rows: [
        [tx("Nonfarm Payrolls (NFP)", "Nonfarm Payrolls (NFP)"), tx("Tambahan pekerjaan di luar sektor pertanian bulan itu (laporan bulanan AS)", "Jobs added outside farming that month (a monthly US report)"), tx("Semakin besar dari dugaan, semakin kuat ekonomi; periksa juga revisi", "The more above expectations, the stronger the economy; check revisions too")],
        [tx("Tingkat pengangguran", "Unemployment rate"), tx("Persentase angkatan kerja yang mencari kerja tetapi belum bekerja", "The share of the labour force looking for work without a job"), tx("Naik = melemah, tetapi lihat konteksnya", "Rising = weakening, but look at the context")],
        [tx("Upah per jam rata-rata", "Average hourly earnings"), tx("Rata-rata kenaikan upah", "The average rise in pay"), tx("Upah naik cepat = potensi inflasi naik = nuansa hawkish", "Fast-rising pay = possible higher inflation = a hawkish tone")],
        [tx("Klaim pengangguran mingguan", "Weekly jobless claims"), tx("Orang yang baru mengajukan tunjangan pengangguran", "People newly filing for unemployment benefit"), tx("Data cepat untuk melihat titik balik", "Fast data for spotting turning points")],
      ],
    },

    { kind: "heading", text: tx("Kejutan lawan konsensus", "Surprise versus consensus") },
    {
      kind: "p",
      text: tx(
        "Sebelum setiap laporan, ekonom membuat perkiraan; rata-ratanya disebut konsensus atau forecast. Pasar sudah \"berdagang\" berdasarkan konsensus, sehingga yang menggerakkan harga adalah selisih antara angka sebenarnya (actual) dan konsensus.",
        "Before every report, economists make forecasts; their average is called the consensus or forecast. The market has already \"traded\" on the consensus, so what moves price is the gap between the actual figure and the consensus.",
      ),
    },
    {
      kind: "calc",
      title: tx("Dua laporan dengan angka positif, reaksi berbeda", "Two positive reports, different reactions"),
      lines: [
        tx("Laporan A: konsensus NFP +150 ribu, hasil +160 ribu → selisih kecil, reaksi biasanya kecil", "Report A: NFP consensus +150k, result +160k → a small gap, usually a small reaction"),
        tx("Laporan B: konsensus NFP +90 ribu, hasil +30 ribu → selisih −60 ribu, kejutan besar ke bawah", "Report B: NFP consensus +90k, result +30k → a −60k gap, a big downside surprise"),
      ],
      note: tx(
        "Laporan bulanan juga sering merevisi angka bulan-bulan sebelumnya. Revisi ke bawah bisa memperburuk kesan angka utama.",
        "Monthly reports also often revise earlier months. A downward revision can make the headline look worse.",
      ),
    },
    {
      kind: "table",
      head: [tx("", ""), tx("Inflasi lebih panas dari dugaan", "Inflation hotter than expected"), tx("Inflasi lebih dingin dari dugaan", "Inflation cooler than expected")],
      rows: [
        [tx("Kerja lebih kuat dari dugaan", "Jobs stronger than expected"), tx("Bank sentral cenderung hawkish; mata uang cenderung kuat", "Central bank leans hawkish; currency tends to be strong"), tx("Arah tidak jelas; reaksi campuran", "Direction unclear; mixed reaction")],
        [tx("Kerja lebih lemah dari dugaan", "Jobs weaker than expected"), tx("Dilema; reaksi bisa berubah-ubah", "A dilemma; the reaction may swing"), tx("Bank sentral cenderung dovish; mata uang cenderung lemah", "Central bank leans dovish; currency tends to be weak")],
      ],
    },
    {
      kind: "points",
      title: tx("Jebakan yang sering membuat pemula salah baca", "Traps that trip up beginners"),
      items: [
        tx("Hanya membaca judul berita. Pasar membaca komponen: core, upah, revisi.", "Reading only the headline. The market reads the components: core, wages, revisions."),
        tx("Mengabaikan konsensus. Angka \"bagus\" yang sesuai dugaan tidak menggerakkan pasar.", "Ignoring the consensus. A \"good\" number in line with expectations doesn't move the market."),
        tx("Mengira reaksi pertama selalu benar. Gerakan di menit pertama sering berbalik.", "Assuming the first reaction is always right. Moves in the first minute often reverse."),
        tx("Lupa pasangan mata uangnya. Dolar menguat tidak otomatis berarti EUR/USD turun jika euro juga menerima kabar baik.", "Forgetting the pair. A stronger dollar doesn't automatically mean EUR/USD falls if the euro also gets good news."),
      ],
    },
    {
      kind: "callout",
      tone: "warning",
      title: tx("Aturan keselamatan", "A safety rule"),
      text: tx(
        "Pada saat rilis NFP atau CPI, spread bisa membesar dan eksekusi bisa meleset jauh. Pemula sebaiknya tidak membuka posisi tepat saat rilis. \"Tidak trading\" adalah keputusan trading yang sah.",
        "When NFP or CPI is released, spreads can widen and fills can slip far. Beginners shouldn't open positions right at the release. \"Not trading\" is a valid trading decision.",
      ),
    },
    {
      kind: "check",
      items: [
        { q: tx("Indeks harga setahun lalu 250,0 dan sekarang 258,5. Inflasi y/y?", "Price index 250.0 a year ago and 258.5 now. y/y inflation?"), a: tx("8,5 ÷ 250 = 3,4%.", "8.5 ÷ 250 = 3.4%.") },
        { q: tx("Mengapa trader memperhatikan core CPI?", "Why do traders watch core CPI?"), a: tx("Makanan dan energi sering naik-turun karena faktor sementara; core memberi gambaran tekanan harga yang lebih menetap.", "Food and energy often swing on temporary factors; core shows the stickier price pressure.") },
        { q: tx("Upah naik 3,0% y/y dan inflasi 3,7% y/y. Upah riil?", "Pay up 3.0% y/y and inflation 3.7% y/y. Real pay?"), a: tx("Sekitar −0,7%: daya beli pekerja turun.", "About −0.7%: workers' purchasing power fell.") },
      ],
    },
  ],
  sources: [
    { title: "Consumer Price Index: Questions and Answers", publisher: "BLS", url: "https://www.bls.gov/cpi/questions-and-answers.htm" },
    { title: "Why you should use employment data to trade forex", publisher: "FXStreet" },
    { title: "How does the Fed interpret and pursue the dual mandate?", publisher: "St. Louis Fed" },
  ],
}
