import type { Lesson } from "@/lib/learn/types"
import { tx } from "@/lib/learn/lessons/tx"

// From "L5-1_Suku_Bunga_Bank_Sentral.pdf". Left out: the snapshot of world
// rates on 30 October 2026 and the worked reading of the 28 October 2026
// FOMC meeting (dated figures that go stale and are checked elsewhere), QE
// and the other tools, and the pre-meeting template.

export const interestRates: Lesson = {
  slug: "suku-bunga",
  level: 5,
  minutes: 8,
  title: tx("Suku bunga bank sentral", "Central bank interest rates"),
  summary: tx(
    "Mengapa satu angka dari bank sentral bisa menggerakkan seluruh pasar mata uang, dan cara membacanya tanpa latar belakang ekonomi.",
    "Why one number from a central bank can move the whole currency market, and how to read it without an economics background.",
  ),
  material: ["L5-1_Suku_Bunga_Bank_Sentral.pdf"],
  blocks: [
    {
      kind: "callout",
      tone: "note",
      title: tx("Isi materi ini dalam satu paragraf", "This lesson in one paragraph"),
      text: tx(
        "Bank sentral menetapkan \"harga uang\" di negaranya. Harga ini memengaruhi bunga tabungan, bunga kredit, dan imbal hasil obligasi. Uang besar mengalir ke tempat yang memberi imbal hasil lebih baik, dan untuk berpindah tempat uang itu harus ditukar ke mata uang setempat. Karena itu suku bunga yang lebih tinggi cenderung menguatkan mata uang. Tetapi pasar selalu bergerak lebih dulu berdasarkan perkiraan, sehingga yang menggerakkan harga bukan angkanya, melainkan kejutannya.",
        "A central bank sets the \"price of money\" in its country. That price affects savings rates, loan rates and bond yields. Big money flows to where returns are better, and to move there it has to be changed into the local currency. That's why higher interest rates tend to strengthen a currency. But markets always move first on expectations, so what moves price is not the number but the surprise.",
      ),
    },

    { kind: "heading", text: tx("Apa itu suku bunga bank sentral?", "What is a central bank interest rate?") },
    {
      kind: "p",
      text: tx(
        "Setiap negara (atau kawasan) punya satu bank sentral: Federal Reserve (The Fed) di Amerika Serikat, European Central Bank (ECB) untuk zona euro, Bank of England (BoE), Bank of Japan (BoJ), dan seterusnya. Salah satu tugas utamanya adalah menetapkan suku bunga kebijakan (policy rate): harga untuk meminjam uang pada level paling atas sistem keuangan. Dari titik ini, efeknya menjalar ke bawah seperti air yang mengalir: bunga antarbank, imbal hasil obligasi, bunga kredit dan deposito, lalu belanja, investasi, harga barang, dan mata uang.",
        "Every country (or region) has one central bank: the Federal Reserve (the Fed) in the United States, the European Central Bank (ECB) for the euro zone, the Bank of England (BoE), the Bank of Japan (BoJ) and so on. One of its main jobs is setting the policy rate: the price of borrowing money at the very top of the financial system. From there the effect flows down like water: interbank rates, bond yields, loan and deposit rates, then spending, investment, prices and the currency.",
      ),
    },
    {
      kind: "p",
      text: tx(
        "Mata uang ikut terpengaruh bukan karena bank sentral \"mengatur kurs\" secara langsung (itu hanya terjadi di sistem kurs tetap), melainkan karena perubahan bunga mengubah daya tarik menyimpan uang di mata uang tersebut.",
        "The currency is affected not because the central bank \"sets the exchange rate\" directly (that only happens under a fixed exchange rate), but because a change in rates changes how attractive it is to hold money in that currency.",
      ),
    },
    {
      kind: "table",
      head: [tx("Bank sentral", "Central bank"), tx("Nama suku bunga yang dipantau pasar", "The rate the market watches")],
      rows: [
        [tx("Federal Reserve (AS)", "Federal Reserve (US)"), tx("Federal funds rate (target berupa rentang)", "Federal funds rate (the target is a range)")],
        [tx("ECB (zona euro)", "ECB (euro zone)"), tx("Deposit facility rate", "Deposit facility rate")],
        [tx("Bank of England (Inggris)", "Bank of England (UK)"), tx("Bank Rate", "Bank Rate")],
        [tx("Bank of Japan (Jepang)", "Bank of Japan"), tx("Suku bunga kebijakan jangka pendek", "Short-term policy rate")],
        [tx("Bank Indonesia", "Bank Indonesia"), tx("BI-Rate", "BI-Rate")],
      ],
    },

    { kind: "heading", text: tx("Pedal gas dan pedal rem untuk ekonomi", "The accelerator and the brake of the economy") },
    {
      kind: "p",
      text: tx(
        "Bank sentral umumnya diberi dua tugas besar: menjaga harga barang tetap stabil (inflasi rendah dan terkendali) dan mendukung lapangan kerja yang kuat. Alat utamanya adalah suku bunga, yang berfungsi seperti pedal gas dan rem pada mobil.",
        "Central banks usually have two big jobs: keeping prices stable (low, controlled inflation) and supporting strong employment. Their main tool is the interest rate, which works like a car's accelerator and brake.",
      ),
    },
    {
      kind: "table",
      head: [tx("Kondisi ekonomi", "Economic condition"), tx("Tindakan bank sentral", "Central bank action"), tx("Cara kerjanya", "How it works")],
      rows: [
        [tx("Harga naik terlalu cepat (inflasi tinggi), ekonomi \"panas\"", "Prices rising too fast (high inflation), an \"overheating\" economy"), tx("Menaikkan bunga (rem)", "Raise rates (brake)"), tx("Pinjaman jadi mahal, belanja tertunda, harga mereda", "Borrowing gets expensive, spending is delayed, prices cool")],
        [tx("Ekonomi lesu, banyak PHK, inflasi sangat rendah", "A sluggish economy, many layoffs, very low inflation"), tx("Menurunkan bunga (gas)", "Cut rates (accelerator)"), tx("Pinjaman jadi murah, belanja dan investasi terdorong", "Borrowing gets cheap, spending and investment pick up")],
        [tx("Inflasi dan lapangan kerja mendekati target", "Inflation and employment near target"), tx("Menahan bunga", "Hold rates"), tx("Menunggu data baru sebelum bergerak", "Wait for new data before moving")],
      ],
    },
    {
      kind: "callout",
      tone: "tip",
      title: tx("Contoh sehari-hari: toko kue", "An everyday example: a cake shop"),
      text: tx(
        "Pemilik toko kue ingin membeli oven Rp100 juta dengan pinjaman. Jika bunga 5% per tahun, bunganya Rp5 juta per tahun; jika naik jadi 12%, bunganya Rp12 juta. Pada 12% banyak pemilik usaha menunda membeli oven. Kalau jutaan pemilik usaha melakukan hal yang sama, permintaan melambat dan tekanan kenaikan harga ikut mereda. Efek perubahan bunga biasanya baru terasa berbulan-bulan kemudian.",
        "A cake shop owner wants to buy a Rp100 million oven on credit. At 5% a year the interest is Rp5 million a year; at 12% it is Rp12 million. At 12% many business owners put off buying the oven. When millions do the same, demand slows and the pressure on prices eases. The effect of a rate change usually takes months to be felt.",
      ),
    },

    { kind: "heading", text: tx("Dari suku bunga ke nilai mata uang", "From interest rates to the value of a currency") },
    {
      kind: "steps",
      items: [
        tx("Imbal hasil. Bunga yang lebih tinggi membuat menyimpan uang di negara itu (deposito, obligasi pemerintah) lebih menguntungkan.", "Returns. Higher rates make holding money in that country (deposits, government bonds) more rewarding."),
        tx("Arus modal. Investor besar memindahkan uang ke tempat yang memberi hasil lebih baik, selama risikonya dianggap wajar.", "Capital flows. Big investors move money to where returns are better, as long as the risk seems reasonable."),
        tx("Permintaan mata uang. Untuk membeli obligasi AS, investor asing harus lebih dulu membeli dolar AS, sehingga nilai dolar terdorong naik.", "Demand for the currency. To buy US bonds, foreign investors must first buy US dollars, which pushes the dollar up."),
      ],
    },
    {
      kind: "p",
      text: tx(
        "Di forex, kamu selalu membandingkan dua mata uang. Pertanyaan yang tepat bukan \"apakah bunga Amerika tinggi?\", tetapi \"seberapa tinggi dibandingkan negara pasangannya, dan ke mana arahnya?\". Tren yang kuat dan panjang biasanya muncul saat arah kebijakan dua bank sentral berbeda (policy divergence): satu mengetatkan, satu masih longgar.",
        "In forex you always compare two currencies. The right question isn't \"are US rates high?\" but \"how high compared with the partner country, and which way are they heading?\". Strong, long trends usually appear when two central banks head in different directions (policy divergence): one tightening, the other still loose.",
      ),
    },

    { kind: "heading", text: tx("Ekspektasi lawan kenyataan", "Expectations versus reality") },
    {
      kind: "p",
      text: tx(
        "Jauh sebelum rapat bank sentral, harga mata uang sudah bergerak mengikuti tebakan mayoritas. Ketika keputusan diumumkan, sebagian besar kabar sudah \"masuk harga\" (priced in).",
        "Long before a central bank meeting, the currency has already moved with the majority's guess. When the decision is announced, most of the news is already \"priced in\".",
      ),
    },
    {
      kind: "table",
      head: [tx("Yang diperkirakan pasar", "What the market expected"), tx("Yang terjadi", "What happened"), tx("Reaksi mata uang yang umum", "Typical currency reaction")],
      rows: [
        [tx("Bunga naik", "A hike"), tx("Bunga ditahan", "A hold"), tx("Cenderung melemah (kecewa)", "Tends to weaken (disappointment)")],
        [tx("Bunga turun", "A cut"), tx("Bunga ditahan", "A hold"), tx("Cenderung menguat (lega)", "Tends to strengthen (relief)")],
        [tx("Bunga ditahan", "A hold"), tx("Bunga naik", "A hike"), tx("Cenderung menguat (kejutan)", "Tends to strengthen (surprise)")],
        [tx("Bunga ditahan", "A hold"), tx("Bunga turun", "A cut"), tx("Cenderung melemah (kejutan)", "Tends to weaken (surprise)")],
        [tx("Bunga naik 0,25%", "A 0.25% hike"), tx("Bunga naik 0,25%", "A 0.25% hike"), tx("Sering datar atau bergerak kecil (sudah priced in)", "Often flat or a small move (already priced in)")],
      ],
      note: tx("Ini kecenderungan, bukan hukum.", "These are tendencies, not laws."),
    },

    { kind: "heading", text: tx("Hawkish dan dovish", "Hawkish and dovish") },
    {
      kind: "table",
      head: [tx("Istilah", "Term"), tx("Arti sederhana", "Plain meaning"), tx("Contoh isyarat", "Example signal"), tx("Dampak umum", "Typical effect")],
      rows: [
        [tx("Hawkish (elang)", "Hawkish"), tx("Condong mengetatkan: bunga tinggi atau naik", "Leaning to tighten: rates high or rising"), tx("\"Inflasi masih terlalu tinggi\"", "\"Inflation is still too high\""), tx("Cenderung menguat", "Tends to strengthen")],
        [tx("Dovish (merpati)", "Dovish"), tx("Condong melonggarkan: bunga rendah atau turun", "Leaning to loosen: rates low or falling"), tx("\"Ada ruang untuk menurunkan bunga\"", "\"There is room to cut rates\""), tx("Cenderung melemah", "Tends to weaken")],
        [tx("Netral", "Neutral"), tx("Menunggu data", "Waiting for data"), tx("\"Keputusan bergantung pada data\"", "\"Decisions depend on the data\""), tx("Reaksi kecil", "A small reaction")],
      ],
      note: tx(
        "Forward guidance adalah petunjuk bank sentral tentang arah kebijakan di masa depan. Bank sentral yang menahan bunga tetapi memberi sinyal akan mengetatkan nanti bisa membuat mata uangnya menguat saat itu juga.",
        "Forward guidance is the central bank's hint about future policy. A central bank that holds rates but signals it will tighten later can make its currency strengthen right away.",
      ),
    },

    { kind: "heading", text: tx("Kapan bunga naik justru tidak menguatkan mata uang?", "When doesn't a rate hike strengthen the currency?") },
    {
      kind: "points",
      items: [
        tx("Sudah priced in: kenaikan sudah diperkirakan sejak lama, sehingga saat diumumkan harga bisa datar atau malah turun.", "Already priced in: the hike was expected for a long time, so on the day price can be flat or even fall."),
        tx("Bunga naik tetapi nadanya dovish, misalnya \"ini kenaikan terakhir\". Pasar fokus pada masa depan.", "A hike with a dovish tone, for example \"this is the last hike\". The market focuses on the future."),
        tx("Ekonomi diperkirakan resesi, sehingga kenaikan bunga dianggap mencekik ekonomi.", "A recession is expected, so the hike is seen as strangling the economy."),
        tx("Pasar panik (risk-off): mata uang \"aman\" seperti JPY, CHF, atau USD cenderung menguat meski bunganya rendah.", "The market panics (risk-off): \"safe\" currencies like JPY, CHF or USD tend to strengthen even with low rates."),
        tx("Bunga riil negatif: bunga naik tetapi inflasi lebih tinggi lagi. Bunga riil = bunga nominal dikurangi inflasi.", "Negative real rates: rates rise but inflation is higher still. Real rate = nominal rate minus inflation."),
      ],
    },
    {
      kind: "callout",
      tone: "warning",
      title: tx("Carry trade: bunga tinggi bukan alasan yang cukup", "Carry trade: a high rate isn't reason enough"),
      text: tx(
        "Carry trade berarti meminjam di mata uang berbunga rendah lalu menaruhnya di mata uang berbunga tinggi. Contoh: selisih bunga 3,35% per tahun, tetapi mata uang berbunga tinggi turun 5%: hasil bersih = 3,35% − 5% = −1,65%. Dengan leverage 10 kali, menjadi sekitar −16,5% dari modal. Ketika pasar panik, banyak orang menutup posisi bersamaan dan mata uang berbunga tinggi bisa jatuh tajam.",
        "A carry trade means borrowing in a low-rate currency and putting the money in a high-rate currency. Example: a 3.35% a year rate gap, but the high-rate currency falls 5%: net result = 3.35% − 5% = −1.65%. With 10 times leverage, that becomes about −16.5% of capital. When markets panic, many close positions at once and the high-rate currency can fall sharply.",
      ),
    },

    {
      kind: "steps",
      title: tx("Cara memakai pengetahuan ini dengan aman", "Using this knowledge safely"),
      items: [
        tx("Tentukan dua bank sentral di pair kamu. EUR/USD berarti ECB dan The Fed. USD/JPY berarti The Fed dan BoJ.", "Name the two central banks in your pair. EUR/USD means the ECB and the Fed. USD/JPY means the Fed and the BoJ."),
        tx("Catat arah dan nada masing-masing: menaikkan, menahan, atau menurunkan; hawkish atau dovish.", "Note each one's direction and tone: hiking, holding or cutting; hawkish or dovish."),
        tx("Bandingkan. Mata uang yang arah kebijakannya lebih ketat dibanding dugaan pasar adalah kandidat untuk menguat.", "Compare. The currency whose policy is tighter than the market expected is a candidate to strengthen."),
        tx("Cek tanggal rapat berikutnya di kalender ekonomi dan hindari membuka posisi besar tepat sebelum rapat tanpa rencana.", "Check the next meeting date on the economic calendar and avoid opening large positions just before it without a plan."),
        tx("Gabungkan dengan chart. Fundamental menjelaskan mengapa harga mungkin bergerak; analisis teknikal membantu menentukan kapan, di mana, dan di mana salahnya.", "Combine it with the chart. Fundamentals explain why price may move; technical analysis helps decide when, where, and where you're wrong."),
      ],
    },
    {
      kind: "callout",
      tone: "note",
      title: tx("Catatan untuk Akun Demo TRY-REX", "A note for the TRY-REX Demo Account"),
      text: tx(
        "Di Akun Demo, periode data historis sengaja disembunyikan supaya kamu tidak menghafal kejadian. Artinya analisis fundamental seperti ini tidak bisa dipakai langsung untuk chart latihan; ini bekal untuk memahami pasar nyata dan membaca berita.",
        "In the Demo Account, the period of the historical data is hidden on purpose so you can't remember what happened. So fundamental analysis like this can't be applied directly to the practice chart; it's background for understanding real markets and reading the news.",
      ),
    },
    {
      kind: "check",
      items: [
        { q: tx("Mengapa investor yang membeli obligasi AS ikut menaikkan permintaan dolar AS?", "Why do investors buying US bonds raise demand for the dollar?"), a: tx("Karena obligasi AS dibeli dengan dolar; investor asing harus menukar mata uangnya ke dolar dulu.", "Because US bonds are bought with dollars; foreign investors must change their currency into dollars first.") },
        { q: tx("Pasar memperkirakan kenaikan 0,25 poin; bank sentral menaikkan 0,25 poin dan berkata \"ini kenaikan terakhir\". Menguat atau melemah?", "The market expected a 0.25-point hike; the central bank hikes 0.25 and says \"this is the last hike\". Stronger or weaker?"), a: tx("Kemungkinan melemah atau naik tipis lalu berbalik: kenaikan sudah priced in dan nadanya dovish.", "Probably weaker, or a small rise then a turn: the hike was priced in and the tone is dovish.") },
        { q: tx("Mengapa selisih suku bunga lebih penting daripada bunga satu negara?", "Why does the rate gap matter more than one country's rate?"), a: tx("Forex memperdagangkan dua mata uang sekaligus; arus modal mengikuti imbal hasil relatif.", "Forex trades two currencies at once; capital follows relative returns.") },
      ],
    },
  ],
  sources: [
    { title: "Central banks and interest rates: why monetary policy drives currencies", publisher: "FXStreet", url: "https://www.fxstreet.com/education/central-banks-and-interest-rates-why-monetary-policy-drives-currencies-202512290224" },
    { title: "Interest rates and the forex market", publisher: "IG Academy", url: "https://www.ig.com/ae/ig-academy/beginners-guide-to-forex-trading/interest-rates-and-the-forex-market" },
    { title: "The FOMC conducts monetary policy", publisher: "St. Louis Fed", url: "https://www.stlouisfed.org/in-plain-english/the-fomc-conducts-monetary-policy" },
  ],
}
