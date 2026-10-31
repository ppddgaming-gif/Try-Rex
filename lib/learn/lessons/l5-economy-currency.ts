import type { Lesson } from "@/lib/learn/types"
import { tx } from "@/lib/learn/lessons/tx"

// From "L5-6_Kondisi_Ekonomi_dan_Nilai_Mata_Uang.pdf". Left out: the rate
// gap table of the nine pairs and the two fundamental cards built from
// October 2026 data (dated figures), the geopolitics section, the
// four-week routine and two of the three practice situations.

export const economyCurrency: Lesson = {
  slug: "ekonomi-dan-mata-uang",
  level: 5,
  minutes: 8,
  title: tx("Hubungan kondisi ekonomi dengan nilai mata uang", "How economic conditions relate to currency values"),
  summary: tx(
    "Menyatukan bunga, inflasi, pertumbuhan, komoditas, dan sentimen risiko menjadi satu kerangka berpikir untuk membaca pair apa pun.",
    "Bringing rates, inflation, growth, commodities and risk sentiment together into one way of thinking about any pair.",
  ),
  material: ["L5-6_Kondisi_Ekonomi_dan_Nilai_Mata_Uang.pdf"],
  blocks: [
    {
      kind: "callout",
      tone: "note",
      title: tx("Ide utama dalam tiga kalimat", "The main idea in three sentences"),
      text: tx(
        "Mata uang adalah \"harga\" dari sebuah ekonomi, dibandingkan dengan ekonomi lain. Harga itu naik ketika dunia ingin memegang mata uang tersebut (karena bunganya menarik, ekonominya sehat, atau dianggap aman) dan turun ketika orang ingin menjauh. Karena forex selalu membandingkan dua mata uang, yang menentukan arah adalah perbandingan kondisi dua ekonomi dan perubahannya dari dugaan.",
        "A currency is the \"price\" of an economy compared with another economy. It rises when the world wants to hold that currency (because its rates are attractive, its economy healthy, or it's seen as safe) and falls when people want to get away from it. Because forex always compares two currencies, what decides the direction is the comparison of the two economies and how that changes against expectations.",
      ),
    },
    {
      kind: "p",
      text: tx(
        "Kalau kamu ingin membeli barang dari Jepang, penjual meminta pembayaran dalam yen. Kalau investor ingin membeli obligasi pemerintah Amerika, ia membutuhkan dolar. Setiap kebutuhan itu adalah permintaan terhadap sebuah mata uang. Kamu juga tidak pernah melihat harga \"dolar\" sendirian, selalu dolar terhadap sesuatu: kabar baik untuk satu ekonomi belum tentu menaikkan pair-nya jika ekonomi pasangannya mendapat kabar yang sama baiknya.",
        "If you want to buy goods from Japan, the seller asks to be paid in yen. If an investor wants US government bonds, they need dollars. Each of those needs is demand for a currency. You also never see the price of \"the dollar\" alone, only the dollar against something: good news for one economy won't necessarily lift its pair if the partner economy gets equally good news.",
      ),
    },
    {
      kind: "table",
      head: [tx("Faktor", "Factor"), tx("Jalur pengaruh", "How it works"), tx("Arah yang umum", "Usual direction")],
      rows: [
        [tx("Suku bunga dan dugaannya", "Rates and expectations"), tx("Imbal hasil lebih tinggi menarik arus modal", "Higher returns draw in capital"), tx("Bunga atau dugaan bunga naik → menguat", "Rates or rate expectations up → stronger")],
        [tx("Inflasi", "Inflation"), tx("Memengaruhi dugaan bunga dan daya beli", "Affects rate expectations and purchasing power"), tx("Lebih tinggi dari dugaan → sering menguat; tinggi dan tak terkendali lama → melemah", "Above expectations → often stronger; high and uncontrolled for long → weaker")],
        [tx("Pertumbuhan ekonomi (GDP)", "Economic growth (GDP)"), tx("Ekonomi kuat menarik investasi", "A strong economy attracts investment"), tx("Pertumbuhan relatif lebih kuat → menguat", "Relatively stronger growth → stronger")],
        [tx("Lapangan kerja dan upah", "Jobs and wages"), tx("Memengaruhi belanja, inflasi, dan bunga", "Affect spending, inflation and rates"), tx("Kuat → menguat; lemah → melemah", "Strong → stronger; weak → weaker")],
        [tx("Neraca perdagangan", "Trade balance"), tx("Ekspor lebih besar dari impor = permintaan mata uang domestik", "Exports above imports = demand for the domestic currency"), tx("Surplus lebih besar → menguat", "A bigger surplus → stronger")],
        [tx("Harga komoditas", "Commodity prices"), tx("Menentukan pendapatan negara pengekspor komoditas", "Set the income of commodity exporters"), tx("Harga komoditas utama naik → mata uang pengekspornya menguat", "Key commodity prices up → the exporter's currency stronger")],
        [tx("Sentimen risiko", "Risk sentiment"), tx("Investor lari dari atau menuju aset aman", "Investors flee to or from safe assets"), tx("Panik → mata uang \"aman\" menguat", "Panic → \"safe\" currencies stronger")],
      ],
      note: tx("Ini kecenderungan umum. Hubungannya tidak mekanis dan bisa terbalik pada kondisi tertentu.", "These are general tendencies. The links aren't mechanical and can reverse in some conditions."),
    },
    {
      kind: "callout",
      tone: "tip",
      title: tx("Contoh perbandingan rekaan: dua ekonomi", "A made-up comparison: two economies"),
      text: tx(
        "Ekonomi X tumbuh 2,5% setahun dengan bunga yang cenderung naik. Ekonomi Y tumbuh 0,8% dengan bunga yang cenderung turun. Dari sudut pandang investor global, X menawarkan dua hal yang lebih menarik (pertumbuhan dan imbal hasil), sehingga mata uang X cenderung menguat terhadap Y, jika keadaan itu belum sepenuhnya diperkirakan pasar.",
        "Economy X grows 2.5% a year with rates tending to rise. Economy Y grows 0.8% with rates tending to fall. To a global investor, X offers two more attractive things (growth and returns), so X's currency tends to strengthen against Y's, if that isn't already fully expected by the market.",
      ),
    },

    { kind: "heading", text: tx("Mata uang komoditas", "Commodity currencies") },
    {
      kind: "table",
      head: [tx("Mata uang", "Currency"), tx("Pendorong yang sering dipantau", "Drivers often watched")],
      rows: [
        [tx("AUD", "AUD"), tx("Harga bijih besi dan batu bara; permintaan dari Tiongkok", "Iron ore and coal prices; demand from China")],
        [tx("NZD", "NZD"), tx("Harga produk susu dan komoditas pertanian", "Dairy and farm commodity prices")],
        [tx("CAD", "CAD"), tx("Harga minyak mentah", "Crude oil prices")],
      ],
      note: tx(
        "Hubungan harga komoditas dan mata uang tidak selalu stabil; suku bunga dan sentimen risiko bisa mendominasi pada periode tertentu. Gunakan sebagai hipotesis yang dicek di chart, bukan aturan.",
        "The link between commodity prices and currencies isn't always stable; rates and risk sentiment can dominate at times. Use it as a hypothesis to check on the chart, not a rule.",
      ),
    },

    { kind: "heading", text: tx("Sentimen risiko: risk-on dan risk-off", "Risk sentiment: risk-on and risk-off") },
    {
      kind: "table",
      head: [tx("Suasana pasar", "Market mood"), tx("Sering menguat", "Often stronger"), tx("Sering tertekan", "Often weaker")],
      rows: [
        [tx("Risk-off (panik)", "Risk-off (panic)"), tx("JPY, CHF, sering juga USD", "JPY, CHF, often USD too"), tx("AUD, NZD, CAD dan mata uang berimbal hasil tinggi lain", "AUD, NZD, CAD and other high-yield currencies")],
        [tx("Risk-on (optimis)", "Risk-on (optimism)"), tx("AUD, NZD, CAD", "AUD, NZD, CAD"), tx("JPY, CHF", "JPY, CHF")],
      ],
      note: tx(
        "AUD/JPY sering dijadikan \"termometer risiko\": saat pasar panik ia cenderung turun cepat karena dua kekuatan bekerja bersamaan, AUD dijual dan JPY dibeli.",
        "AUD/JPY is often used as a \"risk thermometer\": when markets panic it tends to fall fast, because two forces work together, AUD is sold and JPY bought.",
      ),
    },

    { kind: "heading", text: tx("Hubungan dua arah", "A two-way relationship") },
    {
      kind: "table",
      head: [tx("Kondisi mata uang", "Currency condition"), tx("Dampak pada ekonomi", "Effect on the economy"), tx("Diuntungkan / dirugikan", "Who gains / loses")],
      rows: [
        [tx("Melemah", "Weaker"), tx("Ekspor lebih murah bagi pembeli asing; impor lebih mahal; inflasi impor naik", "Exports cheaper for foreign buyers; imports dearer; imported inflation rises"), tx("Eksportir diuntungkan; importir dan konsumen barang impor dirugikan", "Exporters gain; importers and buyers of imports lose")],
        [tx("Menguat", "Stronger"), tx("Ekspor lebih mahal; impor lebih murah; inflasi impor turun", "Exports dearer; imports cheaper; imported inflation falls"), tx("Importir dan konsumen diuntungkan; eksportir tertekan", "Importers and consumers gain; exporters squeezed")],
      ],
      note: tx(
        "Karena itu otoritas sebuah negara kadang bereaksi ketika mata uangnya bergerak terlalu cepat (intervensi atau perubahan bunga), dan reaksi itu menjadi faktor baru di pasar.",
        "That's why authorities sometimes react when their currency moves too fast (intervention or a rate change), and that reaction becomes a new factor in the market.",
      ),
    },
    {
      kind: "steps",
      title: tx("Kartu fundamental sebuah pair", "A pair's fundamental card"),
      items: [
        tx("Selisih bunga: mana yang bunganya lebih tinggi, dan ke mana arahnya?", "Rate gap: which rate is higher, and which way is it heading?"),
        tx("Nada bank sentral: hawkish atau dovish? Bandingkan keduanya.", "Central bank tone: hawkish or dovish? Compare both."),
        tx("Data terbaru: inflasi, tenaga kerja, pertumbuhan lebih panas atau dingin dari dugaan?", "Latest data: inflation, jobs, growth hotter or cooler than expected?"),
        tx("Sentimen risiko: pasar risk-on atau risk-off?", "Risk sentiment: is the market risk-on or risk-off?"),
        tx("Kesimpulan bersyarat: tulis dalam bentuk \"jika … maka …\", bukan ramalan.", "A conditional conclusion: write it as \"if … then …\", not a forecast."),
        tx("Rencana: analisis teknikal menentukan kapan dan di mana; stop loss dari struktur harga; ukuran posisi dari risiko %.", "The plan: technical analysis decides when and where; the stop loss comes from price structure; the size from your % risk."),
      ],
    },
    {
      kind: "points",
      title: tx("Mengapa teori sering \"tidak cocok\" dengan chart", "Why theory often \"doesn't match\" the chart"),
      items: [
        tx("Faktor bisa bertentangan: kenaikan bunga mendukung mata uang, kekhawatiran resesi melemahkannya.", "Factors can conflict: a rate hike supports a currency while recession fears weaken it."),
        tx("Pasar bergerak karena ekspektasi; kabar yang sudah diperkirakan tidak menggerakkan harga.", "Markets move on expectations; news already expected doesn't move price."),
        tx("Waktu: fundamental bekerja dalam rentang minggu hingga tahun, sementara chart jam bisa bergerak berlawanan lama sekali.", "Timing: fundamentals work over weeks to years, while an hourly chart can go the other way for a long time."),
      ],
    },
    {
      kind: "callout",
      tone: "warning",
      title: tx("Aturan penutup Level 5", "The closing rule of Level 5"),
      text: tx(
        "Fundamental menjawab pertanyaan \"mengapa harga mungkin bergerak?\". Ia tidak menjawab \"kapan masuk, di mana salah, dan berapa lot?\". Tiga pertanyaan terakhir selalu dijawab oleh analisis teknikal dan manajemen risiko.",
        "Fundamentals answer \"why might price move?\". They don't answer \"when to enter, where I'm wrong, and how many lots?\". Those three are always answered by technical analysis and risk management.",
      ),
    },
    {
      kind: "check",
      items: [
        { q: tx("Mengapa pertumbuhan GDP yang kuat cenderung mendukung mata uang?", "Why does strong GDP growth tend to support a currency?"), a: tx("Menarik investasi asing yang membutuhkan mata uang setempat, sehingga permintaan naik.", "It attracts foreign investment that needs the local currency, so demand rises.") },
        { q: tx("Mengapa AUD/JPY sering turun cepat saat pasar panik?", "Why does AUD/JPY often fall fast in a panic?"), a: tx("AUD yang sensitif risiko dijual sementara JPY yang dianggap aman dibeli.", "Risk-sensitive AUD is sold while JPY, seen as safe, is bought.") },
        { q: tx("EUR 2,50% dan AUD 4,60%. Selisih bunga EUR/AUD?", "EUR 2.50% and AUD 4.60%. The EUR/AUD rate gap?"), a: tx("2,50 − 4,60 = −2,10 poin: AUD berbunga lebih tinggi.", "2.50 − 4.60 = −2.10 points: AUD pays more.") },
      ],
    },
  ],
  sources: [
    { title: "Why economic factors are your trading compass", publisher: "FXStreet", url: "https://www.fxstreet.com/education/why-economic-factors-are-your-trading-compass-202505120132" },
    { title: "Central banks and interest rates: why monetary policy drives currencies", publisher: "FXStreet" },
    { title: "Interest rates and the forex market", publisher: "IG Academy" },
  ],
}
