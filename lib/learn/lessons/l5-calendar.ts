import type { Lesson } from "@/lib/learn/types"
import { tx } from "@/lib/learn/lessons/tx"

// From "L5-4_Kalender_Ekonomi.pdf". Left out: the dated October 2026
// examples and clock-change dates, the European release times, the weekly
// pattern, the example week, unscheduled news and the supporting
// indicators table.

export const calendar: Lesson = {
  slug: "kalender-ekonomi",
  level: 5,
  minutes: 7,
  title: tx("Kalender ekonomi", "The economic calendar"),
  summary: tx(
    "Cara membaca jadwal rilis data, menerjemahkan jamnya ke WIB, dan menyusun rencana mingguan supaya tidak terkejut oleh pergerakan harga.",
    "How to read the release schedule, convert its times to WIB, and plan your week so price moves don't catch you off guard.",
  ),
  material: ["L5-4_Kalender_Ekonomi.pdf"],
  blocks: [
    {
      kind: "p",
      text: tx(
        "Bayangkan mengendarai mobil di jalan yang tidak kamu kenal tanpa papan peringatan. Trading tanpa kalender ekonomi mirip seperti itu. Kalender ekonomi adalah daftar jadwal rilis data dan peristiwa penting yang diketahui jauh-jauh hari, sehingga kamu tahu kapan pasar kemungkinan \"bergetar\".",
        "Imagine driving an unfamiliar road with no warning signs. Trading without an economic calendar is like that. The economic calendar is a schedule of data releases and important events known well in advance, so you know when the market is likely to \"shake\".",
      ),
    },
    {
      kind: "points",
      title: tx("Mengapa kamu butuh kalender", "Why you need the calendar"),
      items: [
        tx("Mengetahui kapan volatilitas biasanya melonjak. Harga sering bergerak tajam pada saat rilis penting.", "Knowing when volatility usually jumps. Price often moves sharply on important releases."),
        tx("Menghindari kejutan. Pemula sering heran mengapa harga tiba-tiba melompat dan stop loss terkena; jawabannya sering ada di kalender.", "Avoiding surprises. Beginners often wonder why price suddenly jumped and hit their stop loss; the answer is often in the calendar."),
        tx("Memahami penyebab gerakan. Ketika harga bergerak besar, kamu bisa mencocokkannya dengan rilis data dan belajar dari situ.", "Understanding the cause of a move. When price moves a lot, you can match it with a data release and learn from it."),
      ],
    },
    {
      kind: "callout",
      tone: "warning",
      title: tx("Kalender bukan sinyal beli atau jual", "The calendar isn't a buy or sell signal"),
      text: tx(
        "Kalender memberi tahu kapan sesuatu akan terjadi, bukan ke mana harga akan pergi. Pemula disarankan berlatih di akun demo terlebih dahulu dan mempertimbangkan untuk menghindari rilis seperti Nonfarm Payrolls, karena reaksinya bisa tidak terduga.",
        "The calendar tells you when something will happen, not where price will go. Beginners are advised to practise on a demo account first and to consider avoiding releases like Nonfarm Payrolls, because the reaction can be unpredictable.",
      ),
    },

    { kind: "heading", text: tx("Anatomi satu baris kalender", "Anatomy of a calendar row") },
    {
      kind: "table",
      head: [tx("Kolom", "Column"), tx("Isinya", "Contents"), tx("Cara membaca", "How to read it")],
      rows: [
        [tx("Waktu", "Time"), tx("Jam rilis", "Release time"), tx("Cek zona waktu kalendermu: waktu perangkat atau waktu server broker", "Check your calendar's time zone: device time or broker server time")],
        [tx("Mata uang", "Currency"), tx("USD, EUR, GBP, JPY, dan seterusnya", "USD, EUR, GBP, JPY and so on"), tx("Mata uang yang paling terdampak oleh rilis itu", "The currency most affected by the release")],
        [tx("Dampak (impact)", "Impact"), tx("Merah, oranye, kuning", "Red, orange, yellow"), tx("Merah = tinggi; oranye = menengah; kuning = rendah", "Red = high; orange = medium; yellow = low")],
        [tx("Actual", "Actual"), tx("Angka yang baru dirilis", "The figure just released"), tx("Muncul setelah rilis; sering hijau (lebih baik dari forecast) atau merah (lebih buruk)", "Appears after release; often green (better than forecast) or red (worse)")],
        [tx("Forecast", "Forecast"), tx("Konsensus perkiraan ekonom", "The economists' consensus"), tx("Patokan yang sudah \"masuk harga\"", "The benchmark already \"priced in\"")],
        [tx("Previous / Revised", "Previous / Revised"), tx("Angka periode sebelumnya, dan setelah diperbarui", "The previous period's figure, and after any update"), tx("Revisi bisa memperbaiki atau memperburuk kesan angka utama", "A revision can improve or worsen the headline's impression")],
      ],
    },
    {
      kind: "table",
      head: [tx("Jenis data", "Kind of data"), tx("Jika lebih tinggi dari forecast", "If higher than forecast"), tx("Kecenderungan reaksi mata uang", "Typical currency reaction")],
      rows: [
        [tx("Pekerjaan baru (NFP)", "New jobs (NFP)"), tx("Pekerjaan lebih kuat", "Stronger jobs"), tx("Menguat", "Strengthens")],
        [tx("Tingkat pengangguran", "Unemployment rate"), tx("Pasar kerja lebih lemah", "A weaker jobs market"), tx("Melemah", "Weakens")],
        [tx("Inflasi (CPI)", "Inflation (CPI)"), tx("Pasar menduga bunga lebih tinggi", "The market expects higher rates"), tx("Sering menguat (kasus khusus)", "Often strengthens (a special case)")],
        [tx("Pertumbuhan ekonomi (GDP)", "Economic growth (GDP)"), tx("Ekonomi lebih kuat", "A stronger economy"), tx("Menguat", "Strengthens")],
        [tx("Survei bisnis (PMI)", "Business survey (PMI)"), tx("Di atas 50 menandakan ekspansi", "Above 50 signals expansion"), tx("Menguat bila lebih tinggi dari dugaan", "Strengthens if above expectations")],
        [tx("Keputusan bunga", "Rate decision"), tx("Lebih tinggi dari dugaan", "Higher than expected"), tx("Menguat", "Strengthens")],
      ],
      note: tx(
        "\"Lebih baik\" bergantung pada jenis datanya, jadi jangan mengandalkan warna saja. Reaksi pasar juga bukan mesin hitung.",
        "\"Better\" depends on the kind of data, so don't rely on the colour alone. The market's reaction isn't a calculator either.",
      ),
    },

    { kind: "heading", text: tx("Zona waktu: menerjemahkan ke WIB", "Time zones: converting to WIB") },
    {
      kind: "p",
      text: tx(
        "Banyak rilis penting diumumkan pada jam lokal negaranya. Amerika dan Eropa memakai waktu musim panas (DST) yang mengubah jam sebanyak satu jam, sedangkan Indonesia tidak. Akibatnya selisih jam antara WIB dan New York berubah dua kali setahun.",
        "Many important releases are announced in their country's local time. The US and Europe use summer time (DST), which shifts the clock by an hour, while Indonesia doesn't. So the gap between WIB and New York changes twice a year.",
      ),
    },
    {
      kind: "table",
      head: [tx("Rilis", "Release"), tx("Jam lokal", "Local time"), tx("WIB saat AS musim panas (EDT)", "WIB in US summer time (EDT)"), tx("WIB saat AS musim dingin (EST)", "WIB in US winter time (EST)")],
      rows: [
        [tx("Data AS pagi (NFP, CPI, klaim, penjualan ritel)", "Morning US data (NFP, CPI, claims, retail sales)"), tx("08.30 New York", "08:30 New York"), tx("19.30", "19:30"), tx("20.30", "20:30")],
        [tx("Keputusan FOMC (pernyataan)", "FOMC decision (statement)"), tx("14.00 New York", "14:00 New York"), tx("01.00 (hari berikutnya)", "01:00 (next day)"), tx("02.00 (hari berikutnya)", "02:00 (next day)")],
      ],
      note: tx(
        "Jadwal FOMC yang tertulis Rabu berarti di Indonesia keputusan terbit Kamis dini hari. Selalu hitung tanggal dan jam, bukan hanya jam. Beberapa platform memakai waktu server broker; sebelum rilis besar, pastikan jam kalender dan jam chart sepakat.",
        "An FOMC meeting listed for Wednesday means the decision lands early Thursday in Indonesia. Always work out the date and the time, not just the time. Some platforms use broker server time; before a big release, make sure the calendar and the chart agree.",
      ),
    },

    { kind: "heading", text: tx("Menyusun rencana mingguan", "Planning your week") },
    {
      kind: "steps",
      items: [
        tx("Atur filter: tampilkan hanya data dampak tinggi (merah) dan mata uang yang relevan dengan pair-mu.", "Set the filter: show only high-impact (red) data and the currencies relevant to your pair."),
        tx("Tandai tanggal dan jam WIB untuk setiap peristiwa berdampak tinggi pekan ini.", "Mark the date and WIB time of every high-impact event this week."),
        tx("Pasangkan dengan pair. Peristiwa USD memengaruhi EUR/USD, GBP/USD, USD/JPY; peristiwa EUR memengaruhi EUR/USD dan EUR/JPY.", "Match them to pairs. USD events affect EUR/USD, GBP/USD, USD/JPY; EUR events affect EUR/USD and EUR/JPY."),
        tx("Tentukan sikap untuk tiap peristiwa: menghindar, menutup posisi sebelum rilis, atau menunggu hingga pasar tenang.", "Decide your stance for each: stay away, close before the release, or wait until the market calms."),
        tx("Evaluasi di akhir pekan: apakah skenariomu sesuai kenyataan?", "Review at the weekend: did your scenarios match reality?"),
      ],
    },
    {
      kind: "calc",
      title: tx("Spread melebar mengubah rasio risiko-imbalan", "A wider spread changes the risk-reward ratio"),
      lines: [
        tx("Buy dengan SL 20 pip dan target 40 pip (RRR 1:2 pada chart)", "A buy with a 20-pip SL and a 40-pip target (1:2 RRR on the chart)"),
        tx("Spread normal 1 pip: risiko efektif 21 pip, imbalan 39 pip → RRR sekitar 1 : 1,86", "Normal 1-pip spread: effective risk 21 pips, reward 39 pips → RRR about 1 : 1.86"),
        tx("Spread melebar 8 pip saat berita: risiko 28 pip, imbalan 32 pip → RRR sekitar 1 : 1,14", "Spread widening to 8 pips on news: risk 28 pips, reward 32 pips → RRR about 1 : 1.14"),
      ],
      note: tx(
        "Itu belum menghitung slippage. Rencana yang tadinya bagus bisa menjadi hampir impas hanya karena masuk pada saat yang salah.",
        "That's before slippage. A good plan can become close to break-even just from entering at the wrong moment.",
      ),
    },
    {
      kind: "table",
      head: [tx("Pair", "Pair"), tx("Mata uang dan bank sentral", "Currencies and central banks"), tx("Data yang sering diperhatikan", "Data often watched")],
      rows: [
        [tx("EUR/USD", "EUR/USD"), tx("EUR (ECB), USD (The Fed)", "EUR (ECB), USD (Fed)"), tx("Inflasi dan PMI zona euro; CPI, NFP, dan FOMC AS", "Euro-zone inflation and PMI; US CPI, NFP and FOMC")],
        [tx("GBP/USD", "GBP/USD"), tx("GBP (Bank of England), USD", "GBP (Bank of England), USD"), tx("CPI dan data tenaga kerja Inggris; data AS", "UK CPI and jobs data; US data")],
        [tx("AUD/USD", "AUD/USD"), tx("AUD (RBA), USD", "AUD (RBA), USD"), tx("CPI dan tenaga kerja Australia; kabar ekonomi Tiongkok", "Australian CPI and jobs; China's economic news")],
        [tx("USD/JPY", "USD/JPY"), tx("USD, JPY (Bank of Japan)", "USD, JPY (Bank of Japan)"), tx("Data AS; keputusan BoJ; sentimen risiko", "US data; BoJ decisions; risk sentiment")],
        [tx("USD/CAD", "USD/CAD"), tx("USD, CAD (Bank of Canada)", "USD, CAD (Bank of Canada)"), tx("Data AS; tenaga kerja Kanada; harga minyak", "US data; Canadian jobs; oil prices")],
      ],
      note: tx(
        "Setiap pair menggabungkan dua ekonomi, jadi rilis dari kedua negaranya sama-sama relevan.",
        "Every pair combines two economies, so releases from both countries matter.",
      ),
    },
    {
      kind: "points",
      title: tx("Kesalahan umum", "Common mistakes"),
      items: [
        tx("Tidak melihat kalender sama sekali, lalu bingung mengapa harga melompat.", "Not looking at the calendar at all, then wondering why price jumped."),
        tx("Salah zona waktu: menyangka rilis nanti malam padahal sudah lewat, atau sebaliknya.", "Getting the time zone wrong: thinking a release is tonight when it's already passed, or the reverse."),
        tx("Mengabaikan forecast: hanya melihat apakah actual \"bagus\" tanpa membandingkan dengan dugaan.", "Ignoring the forecast: only checking whether the actual is \"good\" without comparing it with expectations."),
        tx("Tidak membuat rencana tertulis. Keputusan impulsif saat rilis hampir selalu lebih buruk.", "Not writing a plan. Impulsive decisions at a release are almost always worse."),
      ],
    },
    {
      kind: "check",
      items: [
        { q: tx("NFP dirilis 08.30 New York saat AS musim dingin (EST). Jam berapa WIB?", "NFP is released at 08:30 New York in US winter time (EST). What time in WIB?"), a: tx("20.30 WIB pada hari yang sama.", "20:30 WIB the same day.") },
        { q: tx("Mengapa tingkat pengangguran yang lebih tinggi dari forecast cenderung melemahkan mata uang?", "Why does a higher-than-forecast unemployment rate tend to weaken the currency?"), a: tx("Menandakan pasar kerja lebih lemah, bank sentral cenderung lebih longgar, dan permintaan mata uang berkurang.", "It signals a weaker jobs market, a looser central bank, and less demand for the currency.") },
        { q: tx("Posisi beli: SL 20 pip, TP 40 pip. Spread berita 5 pip. RRR efektif?", "A buy: SL 20 pips, TP 40 pips. News spread 5 pips. Effective RRR?"), a: tx("Risiko 25 pip, imbalan 35 pip → sekitar 1 : 1,4.", "Risk 25 pips, reward 35 pips → about 1 : 1.4.") },
      ],
    },
  ],
  sources: [
    { title: "Economic calendar: five things you need to know to begin trading the news", publisher: "FXStreet", url: "https://www.fxstreet.com/education/economic-calendar-five-things-you-need-to-know-to-begin-trading-the-news-202205180843" },
    { title: "Meeting calendars", publisher: "Federal Reserve", url: "https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm" },
  ],
}
