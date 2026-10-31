import type { Lesson } from "@/lib/learn/types"
import { tx } from "@/lib/learn/lessons/tx"

// Level 1, from "Mengenal Dasar Trading Forex- Cara Kerja, Risiko, dan
// Keuntungan.pdf", "Pasar forex dan liquiditas.pdf", "Apa yang di
// transaksikan di Forex.pdf", "01_Base-Quote_Pip_Lot_dan_Contract-Size.pdf",
// "Penjelasan Bid-Ask Spread dan Slippage.pdf" and the session table in
// "14_ATR_Average_True_Range.pdf". Left out: choosing a broker and opening a
// real account, the promotional closing paragraphs, the halal discussion,
// crypto, the market-share percentages the handouts don't source, pip value
// for non-USD quotes, and the DEX parts of the bid-ask article.
// "Jam Perdagangan & Sesi Pasar...pdf" describes the Indonesia Stock
// Exchange's hours, not forex, so it isn't used.

const S01 = "01_Base-Quote_Pip_Lot_dan_Contract-Size.pdf"
const SOURCES_01 = [
  { title: "Pip and Lot Trading", publisher: "FXEmpire" },
  { title: "Pip Value and Calculating Profits and Losses", publisher: "Ingot Brokers" },
  { title: "What Is a Pip in Forex", publisher: "Benzinga" },
]

export const whatIsForex: Lesson = {
  slug: "apa-itu-forex",
  level: 1,
  minutes: 6,
  title: tx("Apa itu forex dan bagaimana pasar bekerja", "What forex is and how the market works"),
  summary: tx(
    "Pasar tempat mata uang dunia dipertukarkan: tanpa gedung, buka 24 jam lima hari seminggu, dengan risiko yang perlu dipahami sejak awal.",
    "The market where the world's currencies are exchanged: no building, open 24 hours five days a week, with risks to understand from day one.",
  ),
  material: ["Mengenal Dasar Trading Forex- Cara Kerja, Risiko, dan Keuntungan.pdf", "Pasar forex dan liquiditas.pdf"],
  blocks: [
    {
      kind: "p",
      text: tx(
        "Sistem kerja forex melibatkan pertukaran satu mata uang dengan mata uang lainnya. Perdagangan ini berlangsung dalam pasangan mata uang, seperti EUR/USD atau GBP/JPY. Saat trading, kamu memperkirakan apakah nilai satu mata uang akan naik atau turun dibandingkan dengan mata uang lainnya.",
        "Forex works by exchanging one currency for another. Trading happens in currency pairs, such as EUR/USD or GBP/JPY. When you trade, you estimate whether one currency's value will rise or fall against the other.",
      ),
    },
    { kind: "heading", text: tx("Pasar tanpa gedung", "A market without a building") },
    {
      kind: "p",
      text: tx(
        "Sebagian besar aksi perdagangan forex terjadi di interbank market: bank-bank besar di seluruh dunia yang bertransaksi mata uang. Pasar forex tidak memiliki tempat fisik yang tetap seperti bursa saham; semua transaksi terjadi secara elektronik, terhubung melalui jaringan bank. Karena itu forex dikenal sebagai pasar over-the-counter (OTC): transaksi dilakukan langsung antara dua pihak, tanpa bursa pusat.",
        "Most forex trading happens in the interbank market: big banks around the world dealing currencies. The forex market has no fixed physical place like a stock exchange; every trade happens electronically, linked through bank networks. That's why forex is called an over-the-counter (OTC) market: trades happen directly between two parties, with no central exchange.",
      ),
    },
    {
      kind: "points",
      items: [
        tx("Pasar ini buka 24 jam sehari, lima hari dalam seminggu, karena tersebar di seluruh dunia: mulai dari pasar Asia, Eropa, hingga Amerika.", "The market is open 24 hours a day, five days a week, because it spans the world: from Asian markets to Europe to America."),
        tx("Dolar AS (USD) memegang peran sentral dan sering muncul sebagai salah satu sisi pasangan mata uang utama, sehingga pergerakannya penting untuk diamati.", "The US dollar (USD) plays a central role and often appears as one side of the major pairs, so its moves are important to watch."),
        tx("Sebagian besar volume perdagangan berasal dari spekulan yang berusaha memanfaatkan fluktuasi harga jangka pendek.", "Most trading volume comes from speculators trying to profit from short-term price swings."),
        tx("Skala pasar membuat likuiditasnya tinggi: transaksi bisa dilakukan dengan cepat. Namun kedalaman pasar bisa berubah tergantung pasangan mata uang dan waktu dalam sehari.", "Its size makes liquidity high: trades can be done quickly. But market depth can change with the pair and the time of day."),
      ],
    },
    {
      kind: "p",
      text: tx(
        "Untuk menghasilkan uang, trader perlu membeli mata uang ketika harganya rendah dan menjualnya ketika harga naik, atau sebaliknya. Trader menganalisis pasar dengan analisis fundamental, teknikal, atau kombinasi keduanya, dan memakai manajemen risiko untuk meminimalkan potensi kerugian.",
        "To make money, a trader buys a currency when its price is low and sells when it rises, or the reverse. Traders analyse the market with fundamental analysis, technical analysis or both, and use risk management to limit potential losses.",
      ),
    },
    {
      kind: "points",
      title: tx("Risiko utama trading forex", "The main risks of forex trading"),
      items: [
        tx("Risiko pasar: pergerakan harga mata uang bisa sangat fluktuatif dan, jika tidak dikelola, menyebabkan kerugian besar.", "Market risk: currency prices can swing sharply and, if unmanaged, cause big losses."),
        tx("Leverage: memungkinkan trading dengan modal kecil, tetapi meningkatkan risiko. Kerugian pun bisa lebih tinggi.", "Leverage: lets you trade with little capital but raises the risk. Losses can be bigger too."),
        tx("Kurangnya pemahaman: trader yang kurang paham mekanisme forex berisiko mengalami kerugian besar.", "Lack of understanding: traders who don't understand how forex works risk big losses."),
        tx("Likuiditas: saat volatilitas meningkat, spread bisa melebar dan terjadi lompatan harga (slippage).", "Liquidity: when volatility rises, spreads can widen and prices can jump (slippage)."),
        tx("Emosi dan psikologi: saat harga tidak sesuai prediksi, emosi bisa memicu keputusan yang kurang bijaksana.", "Emotion and psychology: when price doesn't move as predicted, emotions can trigger unwise decisions."),
      ],
    },
    {
      kind: "callout",
      tone: "definition",
      title: tx("Apa bedanya trading dan judi?", "How is trading different from gambling?"),
      text: tx(
        "Perbedaan utamanya ada pada analisis dan kontrol risiko. Dalam trading, keputusan dibuat berdasarkan analisis pasar yang rasional dan terukur, dan risiko dikelola dengan strategi manajemen modal. Judi cenderung bergantung pada keberuntungan tanpa dasar analisis yang jelas.",
        "The main difference is analysis and risk control. In trading, decisions come from rational, measured market analysis, and risk is managed with a money-management plan. Gambling tends to rely on luck with no clear basis in analysis.",
      ),
    },
    {
      kind: "callout",
      tone: "note",
      title: tx("Regulasi di Indonesia", "Regulation in Indonesia"),
      text: tx(
        "Di Indonesia, trading forex dengan leverage harus difasilitasi oleh pialang yang berizin dari BAPPEBTI dan juga anggota bursa berjangka. Latihan dengan akun demo disarankan sebelum memakai uang sungguhan.",
        "In Indonesia, leveraged forex trading must go through a broker licensed by BAPPEBTI that is also a futures exchange member. Practising on a demo account first is recommended before using real money.",
      ),
    },
    {
      kind: "check",
      items: [
        { q: tx("Mengapa forex disebut pasar OTC?", "Why is forex called an OTC market?"), a: tx("Karena transaksi dilakukan langsung antara dua pihak secara elektronik, tanpa bursa pusat atau tempat fisik.", "Because trades happen directly between two parties electronically, with no central exchange or physical place.") },
        { q: tx("Berapa lama pasar forex buka?", "When is the forex market open?"), a: tx("24 jam sehari, lima hari dalam seminggu.", "24 hours a day, five days a week.") },
        { q: tx("Apa beda trading dan judi?", "How does trading differ from gambling?"), a: tx("Trading memakai analisis dan kontrol risiko; judi bergantung pada keberuntungan.", "Trading uses analysis and risk control; gambling relies on luck.") },
      ],
    },
  ],
  sources: [
    { title: "Mengenal Dasar Trading Forex: Cara Kerja, Risiko, dan Keuntungan", publisher: "Valbury Asia Futures" },
    { title: "Pasar forex dan likuiditas", publisher: "" },
  ],
}

export const currencyPairs: Lesson = {
  slug: "currency-pair",
  level: 1,
  minutes: 5,
  title: tx("Currency pair: EUR/USD, GBP/USD, USD/JPY", "Currency pairs: EUR/USD, GBP/USD, USD/JPY"),
  summary: tx(
    "Yang diperdagangkan di forex adalah nilai satu mata uang terhadap mata uang lain, lewat pasangan mata uang.",
    "What forex trades is one currency's value against another, through currency pairs.",
  ),
  material: ["Apa yang di transaksikan di Forex.pdf", S01],
  blocks: [
    {
      kind: "p",
      text: tx(
        "Di pasar forex, yang diperdagangkan adalah nilai mata uang relatif terhadap mata uang lain. Ini dilakukan melalui pasangan mata uang seperti EUR/USD, USD/CHF, AUD/USD, USD/CAD, dan GBP/USD. Mata uang yang diperdagangkan mencerminkan ekonomi negara yang bersangkutan, sehingga harga sebuah pasangan berfluktuasi berdasarkan persepsi pasar tentang kesehatan ekonomi kedua negara.",
        "In the forex market, what's traded is a currency's value relative to another. This is done through currency pairs such as EUR/USD, USD/CHF, AUD/USD, USD/CAD and GBP/USD. The currencies traded reflect their countries' economies, so a pair's price moves with the market's view of the health of both economies.",
      ),
    },
    {
      kind: "p",
      text: tx(
        "Misalnya, jika kamu berpikir ekonomi Eropa akan membaik dibandingkan dengan ekonomi AS, kamu mungkin memutuskan membeli EUR/USD, berharap nilai euro meningkat relatif terhadap dolar AS. Membeli EUR/USD berarti membeli euro dan menjual dolar AS.",
        "For example, if you think Europe's economy will improve relative to the US economy, you might decide to buy EUR/USD, hoping the euro rises against the US dollar. Buying EUR/USD means buying euros and selling US dollars.",
      ),
    },
    { kind: "diagram", name: "pair-quote" },
    {
      kind: "table",
      head: [tx("Pair", "Pair"), tx("Base", "Base"), tx("Quote", "Quote"), tx("Arti harga (contoh)", "Meaning of the price (example)")],
      rows: [
        [tx("EUR/USD", "EUR/USD"), tx("Euro (EUR)", "Euro (EUR)"), tx("Dolar AS (USD)", "US dollar (USD)"), tx("1 EUR = 1,0850 USD", "1 EUR = 1.0850 USD")],
        [tx("USD/JPY", "USD/JPY"), tx("Dolar AS (USD)", "US dollar (USD)"), tx("Yen Jepang (JPY)", "Japanese yen (JPY)"), tx("1 USD = 150,00 JPY", "1 USD = 150.00 JPY")],
        [tx("USD/CHF", "USD/CHF"), tx("Dolar AS (USD)", "US dollar (USD)"), tx("Franc Swiss (CHF)", "Swiss franc (CHF)"), tx("1 USD = 0,9000 CHF", "1 USD = 0.9000 CHF")],
        [tx("EUR/GBP", "EUR/GBP"), tx("Euro (EUR)", "Euro (EUR)"), tx("Poundsterling (GBP)", "Pound sterling (GBP)"), tx("1 EUR = 0,86 GBP", "1 EUR = 0.86 GBP")],
      ],
      note: tx(
        "Angka harga hanya ilustrasi. Urutan base dan quote ditetapkan konvensi pasar dan tidak bisa dibalik seenaknya.",
        "The prices are only illustrations. The order of base and quote is set by market convention and can't be reversed at will.",
      ),
    },
    { kind: "heading", text: tx("Mata uang utama dan mata uang komoditas", "Major and commodity currencies") },
    {
      kind: "p",
      text: tx(
        "Bagi pemula, biasanya mulai dengan \"mata uang utama\": mata uang yang paling banyak diperdagangkan dan mewakili beberapa ekonomi terbesar di dunia, yaitu USD, EUR, JPY, GBP, dan CHF. Ada juga \"mata uang komoditas\": AUD, NZD, dan CAD, yang sering terkait erat dengan harga komoditas karena ekonomi negaranya punya hubungan kuat dengan industri komoditas.",
        "Beginners usually start with the \"major currencies\": the most traded ones, representing some of the world's biggest economies: USD, EUR, JPY, GBP and CHF. There are also \"commodity currencies\": AUD, NZD and CAD, often closely tied to commodity prices because their economies are strongly linked to commodity industries.",
      ),
    },
    {
      kind: "table",
      head: [tx("Kode", "Code"), tx("Negara", "Country"), tx("Mata uang", "Currency"), tx("Nama panggilan", "Nickname")],
      rows: [
        [tx("USD", "USD"), tx("Amerika Serikat", "United States"), tx("Dolar", "Dollar"), tx("Buck", "Buck")],
        [tx("EUR", "EUR"), tx("Zona euro", "Euro zone"), tx("Euro", "Euro"), tx("Fiber", "Fiber")],
        [tx("JPY", "JPY"), tx("Jepang", "Japan"), tx("Yen", "Yen"), tx("Yen", "Yen")],
        [tx("GBP", "GBP"), tx("Inggris", "Great Britain"), tx("Pound", "Pound"), tx("Cable", "Cable")],
        [tx("CHF", "CHF"), tx("Swiss", "Switzerland"), tx("Franc", "Franc"), tx("Swissy", "Swissy")],
        [tx("CAD", "CAD"), tx("Kanada", "Canada"), tx("Dolar", "Dollar"), tx("Loonie", "Loonie")],
        [tx("AUD", "AUD"), tx("Australia", "Australia"), tx("Dolar", "Dollar"), tx("Aussie", "Aussie")],
        [tx("NZD", "NZD"), tx("Selandia Baru", "New Zealand"), tx("Dolar", "Dollar"), tx("Kiwi", "Kiwi")],
      ],
    },
    {
      kind: "callout",
      tone: "tip",
      title: tx("Membaca kode tiga huruf", "Reading the three-letter codes"),
      text: tx(
        "Setiap simbol mata uang terdiri dari tiga huruf menurut standar ISO 4217: dua huruf pertama biasanya mengidentifikasi negara dan huruf ketiga mata uangnya. Contoh NZD: NZ untuk Selandia Baru, D untuk dolar.",
        "Every currency symbol has three letters under the ISO 4217 standard: the first two usually identify the country and the third the currency. Example NZD: NZ for New Zealand, D for dollar.",
      ),
    },
    {
      kind: "check",
      items: [
        { q: tx("Kamu yakin euro menguat terhadap dolar. Pair apa dan arah apa?", "You believe the euro will strengthen against the dollar. Which pair and which direction?"), a: tx("EUR/USD, Buy.", "EUR/USD, Buy.") },
        { q: tx("Sebutkan tiga mata uang komoditas.", "Name three commodity currencies."), a: tx("AUD, NZD, dan CAD.", "AUD, NZD and CAD.") },
      ],
    },
  ],
  sources: [{ title: "Apa yang di transaksikan di Forex?", publisher: "" }, ...SOURCES_01],
}

export const baseQuote: Lesson = {
  slug: "base-quote",
  level: 1,
  minutes: 4,
  title: tx("Base currency dan quote currency", "Base currency and quote currency"),
  summary: tx(
    "Cara membaca harga forex: berapa unit quote untuk membeli 1 unit base, dan apa artinya harga naik atau turun.",
    "How to read a forex price: how many units of the quote buy 1 unit of the base, and what a rise or fall means.",
  ),
  material: [S01],
  blocks: [
    {
      kind: "p",
      text: tx(
        "Di toko, harga ditulis seperti ini: 1 kg apel = Rp 40.000. Ada barang yang dibeli (apel) dan ada uang untuk membayarnya (rupiah). Harga forex persis seperti itu, hanya saja barangnya juga uang. Jadi yang dibandingkan adalah dua mata uang.",
        "In a shop, a price looks like this: 1 kg of apples = Rp 40,000. There's the thing bought (apples) and the money paying for it (rupiah). A forex price is exactly like that, except the thing is also money. So what's compared is two currencies.",
      ),
    },
    {
      kind: "callout",
      tone: "definition",
      title: tx("Pair = pasangan dua mata uang", "Pair = two currencies together"),
      text: tx(
        "Pair ditulis BASE/QUOTE. Angka harga menjawab: untuk membeli 1 unit BASE, berapa unit QUOTE yang dibayar? Contoh: EUR/USD = 1,0850 artinya 1 euro (base) bernilai 1,0850 dolar AS (quote). Mata uang di sebelah kiri selalu dihitung satu unit, dan mata uang di sebelah kanan adalah alat ukur harganya.",
        "A pair is written BASE/QUOTE. The price answers: to buy 1 unit of the BASE, how many units of the QUOTE do you pay? Example: EUR/USD = 1.0850 means 1 euro (base) is worth 1.0850 US dollars (quote). The left currency always counts as one unit, and the right currency measures its price.",
      ),
    },
    {
      kind: "points",
      title: tx("Apa artinya harga naik atau turun?", "What does a rise or fall mean?"),
      items: [
        tx("Harga pair naik = base menguat terhadap quote. EUR/USD naik dari 1,0850 ke 1,0900 berarti euro makin mahal dibanding dolar.", "The pair rises = the base strengthens against the quote. EUR/USD rising from 1.0850 to 1.0900 means the euro gets dearer against the dollar."),
        tx("Harga pair turun = base melemah terhadap quote (atau quote yang menguat).", "The pair falls = the base weakens against the quote (or the quote strengthens)."),
        tx("Buy (long) EUR/USD = membeli base (EUR) dan sekaligus menjual quote (USD). Untung kalau harga naik.", "Buying (long) EUR/USD = buying the base (EUR) and selling the quote (USD) at once. You profit if the price rises."),
        tx("Sell (short) EUR/USD = menjual base dan membeli quote. Untung kalau harga turun.", "Selling (short) EUR/USD = selling the base and buying the quote. You profit if the price falls."),
      ],
    },
    {
      kind: "callout",
      tone: "tip",
      title: tx("Cara mengingat", "How to remember it"),
      text: tx(
        "Yang kamu beli saat Buy adalah mata uang di kiri (base). Tanya diri sendiri: \"aku yakin mata uang kiri akan menguat terhadap mata uang kanan?\" Kalau ya, Buy. Kalau tidak, Sell.",
        "What you buy with Buy is the left currency (the base). Ask yourself: \"am I confident the left currency will strengthen against the right one?\" If yes, Buy. If not, Sell.",
      ),
    },
    {
      kind: "callout",
      tone: "warning",
      title: tx("Jangan membalik base/quote", "Don't flip base and quote"),
      text: tx(
        "Menjual EUR/USD tidak sama dengan membeli USD/EUR; pair tersebut tidak diperdagangkan.",
        "Selling EUR/USD isn't the same as buying USD/EUR; that pair isn't traded.",
      ),
    },
    {
      kind: "check",
      items: [
        { q: tx("Pada GBP/USD = 1,2700, apa arti angka itu?", "At GBP/USD = 1.2700, what does the number mean?"), a: tx("1 poundsterling (base) = 1,2700 dolar AS (quote).", "1 pound sterling (base) = 1.2700 US dollars (quote).") },
        { q: tx("EUR/USD turun. Mata uang mana yang melemah?", "EUR/USD falls. Which currency weakened?"), a: tx("Euro (base) melemah terhadap dolar, atau dolar menguat.", "The euro (base) weakened against the dollar, or the dollar strengthened.") },
      ],
    },
  ],
  sources: SOURCES_01,
}

export const bidAsk: Lesson = {
  slug: "bid-ask-spread",
  level: 1,
  minutes: 5,
  title: tx("Bid, ask, spread, dan slippage", "Bid, ask, spread and slippage"),
  summary: tx(
    "Dua harga dalam satu pair, biaya tersembunyi di setiap transaksi, dan mengapa harga terisi bisa berbeda dari yang kamu lihat.",
    "Two prices in one pair, the hidden cost in every trade, and why your fill can differ from the price you saw.",
  ),
  material: [S01, "Penjelasan Bid-Ask Spread dan Slippage.pdf"],
  blocks: [
    {
      kind: "p",
      text: tx(
        "Satu pair punya dua harga pada saat yang sama. Bid adalah harga saat kamu menjual ke pasar. Ask adalah harga saat kamu membeli dari pasar. Ask selalu sedikit lebih tinggi dari bid. Selisihnya disebut spread dan itulah biaya masuk posisi (broker mendapat penghasilan dari sini atau dari komisi).",
        "A pair has two prices at the same time. The bid is the price when you sell to the market. The ask is the price when you buy from the market. The ask is always a little higher than the bid. The gap is called the spread, and it's the cost of entering a position (the broker earns from it or from commission).",
      ),
    },
    { kind: "diagram", name: "pair-quote" },
    {
      kind: "calc",
      title: tx("Biaya spread", "The cost of the spread"),
      lines: [
        tx("Bid 1,08500 | Ask 1,08512", "Bid 1.08500 | Ask 1.08512"),
        tx("Spread = (1,08512 − 1,08500) ÷ 0,0001 = 1,2 pip", "Spread = (1.08512 − 1.08500) ÷ 0.0001 = 1.2 pips"),
        tx("Nilai 1 pip untuk 1 lot EUR/USD = $10,00 → biaya spread 1 lot = 1,2 × $10,00 = $12,00", "1 pip for 1 lot of EUR/USD = $10.00 → spread cost for 1 lot = 1.2 × $10.00 = $12.00"),
        tx("Biaya spread 0,1 lot = $1,20", "Spread cost for 0.1 lot = $1.20"),
      ],
      note: tx(
        "Begitu posisi terbuka, kamu langsung berada kira-kira 1,2 pip di bawah titik impas. Itu sebabnya hasil di layar biasanya langsung menunjukkan minus kecil. Itu bukan error, itu spread.",
        "As soon as the position opens, you're about 1.2 pips below break-even. That's why the screen usually shows a small minus straight away. It isn't an error; it's the spread.",
      ),
    },
    {
      kind: "points",
      items: [
        tx("Aset yang lebih likuid cenderung memiliki spread lebih sempit karena lebih banyak pihak yang bersedia bertransaksi dekat harga saat ini; yang kurang likuid sering memiliki spread lebih lebar.", "More liquid assets tend to have narrower spreads because more parties are willing to trade near the current price; less liquid ones often have wider spreads."),
        tx("Market maker menyediakan likuiditas dengan memasang order beli dan jual bersamaan, dan memperoleh keuntungan dari spread.", "Market makers provide liquidity by quoting buy and sell orders at once, and earn from the spread."),
        tx("Untuk membandingkan spread secara adil: (harga ask − harga bid) ÷ harga ask × 100 = persentase spread.", "To compare spreads fairly: (ask − bid) ÷ ask × 100 = the spread as a percentage."),
      ],
    },
    { kind: "heading", text: tx("Slippage", "Slippage") },
    {
      kind: "callout",
      tone: "definition",
      title: tx("Slippage", "Slippage"),
      text: tx(
        "Slippage terjadi ketika sebuah transaksi dieksekusi pada harga yang berbeda dari perkiraan, umumnya di pasar dengan likuiditas rendah atau volatilitas tinggi. Slippage tidak selalu merugikan: slippage positif terjadi ketika order beli terisi di bawah harga yang diperkirakan, atau order jual di atasnya, tetapi lebih jarang terjadi.",
        "Slippage happens when a trade is filled at a different price from the one expected, usually in markets with low liquidity or high volatility. It isn't always bad: positive slippage is when a buy fills below the expected price, or a sell above it, but it's less common.",
      ),
    },
    {
      kind: "points",
      title: tx("Cara mengurangi slippage", "How to reduce slippage"),
      items: [
        tx("Gunakan limit order: hanya tereksekusi pada harga yang kamu tentukan atau lebih baik, meski mungkin harus menunggu lebih lama.", "Use limit orders: they only fill at your price or better, though you may wait longer."),
        tx("Pecah order besar menjadi porsi yang lebih kecil.", "Split large orders into smaller pieces."),
        tx("Pilih pasar yang likuid dan hindari bertransaksi saat volatilitas sedang melonjak.", "Choose liquid markets and avoid trading while volatility spikes."),
      ],
    },
    {
      kind: "points",
      title: tx("Kesalahan umum", "Common mistakes"),
      items: [
        tx("Lupa spread. Target 3 pip dengan spread 1,5 pip hanya menyisakan 1,5 pip.", "Forgetting the spread. A 3-pip target with a 1.5-pip spread leaves only 1.5 pips."),
      ],
    },
    {
      kind: "check",
      items: [
        { q: tx("Saat Buy, kamu membeli di harga apa? Saat Sell?", "When you Buy, at which price? When you Sell?"), a: tx("Buy di ask, Sell di bid.", "Buy at the ask, sell at the bid.") },
        { q: tx("Spread 2 pip pada 0,2 lot EUR/USD. Berapa biayanya?", "A 2-pip spread on 0.2 lots of EUR/USD. What does it cost?"), a: tx("2 × $2 = $4.", "2 × $2 = $4.") },
      ],
    },
  ],
  sources: [...SOURCES_01, { title: "Penjelasan Bid-Ask Spread dan Slippage", publisher: "Binance Academy" }],
}

export const pipLot: Lesson = {
  slug: "pip-lot",
  level: 1,
  minutes: 7,
  title: tx("Pip, lot, dan contract size", "Pips, lots and contract size"),
  summary: tx(
    "Satuan gerak harga, ukuran posisi, dan cara menghitung untung-rugi, termasuk pair berbasis yen (JPY).",
    "The unit of price movement, position size, and how to work out profit and loss, including yen (JPY) pairs.",
  ),
  material: [S01],
  blocks: [
    {
      kind: "p",
      text: tx(
        "Harga forex bergerak sangat kecil, jadi trader tidak bilang \"naik 0,0040\". Mereka bilang \"naik 40 pip\". Pip (percentage in point) adalah satuan standar untuk mengukur perubahan harga.",
        "Forex prices move in tiny amounts, so traders don't say \"up 0.0040\". They say \"up 40 pips\". A pip (percentage in point) is the standard unit for measuring a price change.",
      ),
    },
    {
      kind: "table",
      head: [tx("Jenis pair", "Kind of pair"), tx("Desimal harga di platform", "Decimals on the platform"), tx("1 pip =", "1 pip ="), tx("Contoh gerak 1 pip", "A 1-pip move")],
      rows: [
        [tx("Pair biasa (EUR/USD, GBP/USD, AUD/USD, USD/CAD, ...)", "Most pairs (EUR/USD, GBP/USD, AUD/USD, USD/CAD, ...)"), tx("5 angka di belakang koma", "5 decimal places"), tx("0,0001", "0.0001"), tx("1,08500 → 1,08510", "1.08500 → 1.08510")],
        [tx("Pair yang ada JPY (USD/JPY, EUR/JPY, ...)", "JPY pairs (USD/JPY, EUR/JPY, ...)"), tx("3 angka di belakang koma", "3 decimal places"), tx("0,01", "0.01"), tx("150,000 → 150,010", "150.000 → 150.010")],
      ],
      note: tx(
        "Angka terakhir pada kebanyakan platform adalah pipette (sepersepuluh pip). Yang dihitung sebagai 1 pip adalah angka sebelumnya.",
        "The last digit on most platforms is a pipette (a tenth of a pip). The digit before it is the pip.",
      ),
    },
    {
      kind: "callout",
      tone: "warning",
      title: tx("Kenapa JPY berbeda?", "Why is JPY different?"),
      text: tx(
        "Nilai 1 yen sangat kecil dibanding 1 dolar, sehingga harga USD/JPY berada di kisaran puluhan sampai ratusan (misalnya 150,00), bukan sekitar 1. Karena itu, pergerakan yang \"bermakna\" ada di desimal ke-2, bukan ke-4. Kalau kamu memakai 0,0001 untuk pair JPY, hitunganmu meleset 100 kali.",
        "One yen is worth very little next to one dollar, so USD/JPY trades in the tens to hundreds (for example 150.00), not around 1. That's why the \"meaningful\" move is in the 2nd decimal, not the 4th. Use 0.0001 for a JPY pair and you're off by 100 times.",
      ),
    },
    {
      kind: "calc",
      title: tx("Latihan membaca jarak dalam pip", "Practice: distance in pips"),
      lines: [
        tx("EUR/USD dari 1,0850 ke 1,0890: selisih 0,0040 ÷ 0,0001 = 40 pip", "EUR/USD from 1.0850 to 1.0890: 0.0040 ÷ 0.0001 = 40 pips"),
        tx("USD/JPY dari 150,00 ke 150,60: selisih 0,60 ÷ 0,01 = 60 pip", "USD/JPY from 150.00 to 150.60: 0.60 ÷ 0.01 = 60 pips"),
        tx("USD/JPY dari 150,00 ke 149,40: selisih −0,60 ÷ 0,01 = −60 pip (turun 60 pip)", "USD/JPY from 150.00 to 149.40: −0.60 ÷ 0.01 = −60 pips (down 60 pips)"),
      ],
    },

    { kind: "heading", text: tx("Lot dan contract size: seberapa besar posisimu", "Lots and contract size: how big your position is") },
    {
      kind: "p",
      text: tx(
        "Pip hanya mengukur jarak. Untung atau rugi dalam uang bergantung juga pada ukuran posisi, yang disebut lot. Contract size adalah jumlah unit mata uang base dalam 1 lot. Untuk pair forex standar, 1 lot = 100.000 unit base.",
        "A pip only measures distance. Profit or loss in money also depends on the position size, called the lot. The contract size is the number of units of the base currency in 1 lot. For standard forex pairs, 1 lot = 100,000 units of the base.",
      ),
    },
    {
      kind: "table",
      head: [tx("Nama", "Name"), tx("Ukuran (lot)", "Size (lots)"), tx("Unit base", "Base units"), tx("Nilai 1 pip EUR/USD", "1 pip on EUR/USD")],
      rows: [
        [tx("Standard", "Standard"), tx("1,00", "1.00"), tx("100.000", "100,000"), tx("$10,00", "$10.00")],
        [tx("Mini", "Mini"), tx("0,10", "0.10"), tx("10.000", "10,000"), tx("$1,00", "$1.00")],
        [tx("Micro", "Micro"), tx("0,01", "0.01"), tx("1.000", "1,000"), tx("$0,10", "$0.10")],
      ],
      note: tx(
        "Nilai nominal posisi = jumlah unit base × harga. Satu lot EUR/USD pada 1,0850 senilai 100.000 × 1,0850 = $108.500. Kamu tidak mengeluarkan uang sebesar itu: sisanya dipinjamkan melalui leverage (dibahas di Level 3).",
        "A position's notional value = base units × price. One lot of EUR/USD at 1.0850 is worth 100,000 × 1.0850 = $108,500. You don't put up that much: the rest is lent through leverage (covered in Level 3).",
      ),
    },
    {
      kind: "callout",
      tone: "definition",
      title: tx("Pip value", "Pip value"),
      text: tx(
        "Pip value (dalam mata uang quote) = ukuran 1 pip × jumlah unit. EUR/USD: 0,0001 × 100.000 = $10 per pip per 1 lot. Jika akunmu bukan dalam mata uang quote, hasilnya dikonversi ke mata uang akun. Contoh USD/JPY: 0,01 × 100.000 = 1.000 JPY; ÷ 150,00 ≈ $6,67 per pip per lot, dan nilainya ikut berubah setiap kali kurs berubah.",
        "Pip value (in the quote currency) = the size of 1 pip × the number of units. EUR/USD: 0.0001 × 100,000 = $10 per pip per lot. If your account isn't in the quote currency, convert it to the account currency. Example USD/JPY: 0.01 × 100,000 = 1,000 JPY; ÷ 150.00 ≈ $6.67 per pip per lot, and it changes whenever the rate changes.",
      ),
    },
    {
      kind: "calc",
      title: tx("Buy EUR/USD, 0,5 lot", "Buying EUR/USD, 0.5 lot"),
      lines: [
        tx("Entry 1,0850 ; ditutup di 1,0890", "Entry 1.0850 ; closed at 1.0890"),
        tx("Gerak harga = (1,0890 − 1,0850) ÷ 0,0001 = 40 pip", "Move = (1.0890 − 1.0850) ÷ 0.0001 = 40 pips"),
        tx("Pip value 0,5 lot = $10 × 0,5 = $5 per pip", "Pip value of 0.5 lot = $10 × 0.5 = $5 per pip"),
        tx("Profit = 40 × $5 = $200,00", "Profit = 40 × $5 = $200.00"),
      ],
    },
    {
      kind: "calc",
      title: tx("Buy USD/JPY, 0,1 lot (pair JPY)", "Buying USD/JPY, 0.1 lot (a JPY pair)"),
      lines: [
        tx("Entry 150,00 ; ditutup di 150,60 → (150,60 − 150,00) ÷ 0,01 = 60 pip", "Entry 150.00 ; closed at 150.60 → (150.60 − 150.00) ÷ 0.01 = 60 pips"),
        tx("0,1 lot = 10.000 unit USD ; 1 pip = 0,01 × 10.000 = 100 JPY", "0.1 lot = 10,000 USD ; 1 pip = 0.01 × 10,000 = 100 JPY"),
        tx("Profit dalam JPY = 60 × 100 = 6.000 JPY", "Profit in JPY = 60 × 100 = 6,000 JPY"),
        tx("Dikonversi ke USD pada kurs penutupan 150,60: 6.000 ÷ 150,60 = $39,84", "Converted to USD at the closing rate 150.60: 6,000 ÷ 150.60 = $39.84"),
      ],
    },
    {
      kind: "points",
      title: tx("Kesalahan yang paling sering terjadi", "The most common mistakes"),
      items: [
        tx("Memakai 0,0001 untuk pair JPY. Selalu cek dulu apakah pair mengandung JPY.", "Using 0.0001 for a JPY pair. Always check whether the pair contains JPY."),
        tx("Menganggap pip value selalu $10. Itu hanya benar untuk 1 lot pair berquote USD.", "Assuming the pip value is always $10. That's only true for 1 lot of a USD-quoted pair."),
        tx("Mengira lot kecil berarti aman tanpa menghitung stop loss. Risiko ditentukan oleh jarak stop loss (dalam pip) × pip value.", "Thinking a small lot is safe without working out the stop loss. Risk is the stop-loss distance (in pips) × the pip value."),
      ],
    },
    {
      kind: "check",
      items: [
        { q: tx("USD/JPY bergerak dari 149,50 ke 150,10. Berapa pip?", "USD/JPY moves from 149.50 to 150.10. How many pips?"), a: tx("(150,10 − 149,50) ÷ 0,01 = 60 pip.", "(150.10 − 149.50) ÷ 0.01 = 60 pips.") },
        { q: tx("Berapa pip value 0,1 lot EUR/USD untuk akun USD?", "What's the pip value of 0.1 lot of EUR/USD in a USD account?"), a: tx("$1 per pip.", "$1 per pip.") },
        { q: tx("Berapa kira-kira pip value 1 lot USD/JPY pada 150,00?", "Roughly what's the pip value of 1 lot of USD/JPY at 150.00?"), a: tx("1.000 JPY ÷ 150,00 ≈ $6,67.", "1,000 JPY ÷ 150.00 ≈ $6.67.") },
      ],
    },
  ],
  sources: SOURCES_01,
}

export const sessions: Lesson = {
  slug: "sesi-pasar",
  level: 1,
  minutes: 4,
  title: tx("Jam perdagangan dan sesi pasar", "Trading hours and market sessions"),
  summary: tx(
    "Forex buka 24 jam lima hari seminggu, tetapi tidak sama ramainya sepanjang hari. Sesi Asia, London, dan New York dalam WIB.",
    "Forex is open 24 hours five days a week, but not equally busy all day. The Asian, London and New York sessions in WIB.",
  ),
  material: ["14_ATR_Average_True_Range.pdf", "L5-4_Kalender_Ekonomi.pdf", "Pasar forex dan liquiditas.pdf"],
  blocks: [
    {
      kind: "p",
      text: tx(
        "Pasar forex tersebar di seluruh dunia, sehingga buka 24 jam sehari, lima hari dalam seminggu. Tetapi volatilitas tidak merata sepanjang hari, dan kedalaman pasar bisa berubah tergantung pasangan mata uang dan waktu dalam sehari.",
        "The forex market spans the world, so it's open 24 hours a day, five days a week. But volatility isn't even across the day, and market depth can change with the pair and the time of day.",
      ),
    },
    { kind: "diagram", name: "sessions" },
    {
      kind: "table",
      head: [tx("Sesi", "Session"), tx("Perkiraan jam (WIB)", "Approximate hours (WIB)"), tx("Kecenderungan umum", "General tendency")],
      rows: [
        [tx("Tokyo / Asia", "Tokyo / Asia"), tx("sekitar 07.00 – 16.00", "about 07:00 – 16:00"), tx("Pair JPY dan AUD lebih aktif; EUR/USD sering lebih tenang", "JPY and AUD pairs more active; EUR/USD often calmer")],
        [tx("London", "London"), tx("sekitar 14.00 – 23.00", "about 14:00 – 23:00"), tx("Likuiditas tinggi; banyak rilis data Eropa/Inggris", "High liquidity; many European/UK data releases")],
        [tx("New York", "New York"), tx("sekitar 19.00 – 04.00", "about 19:00 – 04:00"), tx("Rilis data AS; volatilitas besar saat tumpang tindih", "US data releases; big volatility in the overlap")],
        [tx("London + New York", "London + New York"), tx("sekitar 19.00 – 23.00", "about 19:00 – 23:00"), tx("Biasanya jendela paling ramai", "Usually the busiest window")],
      ],
      note: tx(
        "Perkiraan umum, bukan angka pasti. Geser sekitar satu jam saat negara terkait memakai jam musim panas (DST), karena Indonesia tidak memakainya.",
        "General estimates, not exact figures. Shift about an hour when the countries concerned use summer time (DST), since Indonesia doesn't.",
      ),
    },
    {
      kind: "callout",
      tone: "note",
      title: tx("Jam musim panas (DST)", "Summer time (DST)"),
      text: tx(
        "Amerika dan Eropa memakai waktu musim panas yang mengubah jam sebanyak satu jam, sedangkan Indonesia tidak. Akibatnya selisih jam antara WIB dan New York atau London berubah dua kali setahun. Contoh: data AS yang dirilis 08.30 waktu New York jatuh pukul 19.30 WIB saat AS musim panas dan 20.30 WIB saat musim dingin.",
        "The US and Europe use summer time, which shifts the clock by an hour, while Indonesia doesn't. So the gap between WIB and New York or London changes twice a year. Example: US data released at 08:30 New York time lands at 19:30 WIB in US summer and 20:30 WIB in winter.",
      ),
    },
    {
      kind: "callout",
      tone: "tip",
      title: tx("Catat sendiri", "Keep your own notes"),
      text: tx(
        "Rata-rata gerak per sesi berbeda tiap pair dan tiap periode. Catat sendiri di jurnal: jam berapa stop loss-mu paling sering tersapu dan jam berapa setup-mu paling bersih.",
        "The average move per session differs by pair and by period. Note it yourself in your journal: when your stop loss gets swept most often and when your setups are cleanest.",
      ),
    },
    {
      kind: "callout",
      tone: "note",
      title: tx("Di Akun Demo TRY-REX", "In the TRY-REX Demo Account"),
      text: tx(
        "Chart Akun Demo berjalan mengikuti jam nyata: pasar buka Senin sekitar 05.00 WIB sampai Sabtu dini hari, dan akhir pekan pasar tutup.",
        "The Demo Account chart runs on real time: the market opens Monday around 05:00 WIB until early Saturday, and it's closed at the weekend.",
      ),
    },
    {
      kind: "check",
      items: [
        { q: tx("Jendela waktu mana yang biasanya paling ramai?", "Which window is usually the busiest?"), a: tx("Tumpang tindih London dan New York, sekitar 19.00–23.00 WIB.", "The London–New York overlap, about 19:00–23:00 WIB.") },
        { q: tx("Mengapa jam rilis data AS dalam WIB bisa bergeser?", "Why do US release times in WIB shift?"), a: tx("Karena AS memakai jam musim panas (DST), sedangkan Indonesia tidak.", "Because the US uses summer time (DST) and Indonesia doesn't.") },
      ],
    },
  ],
  sources: [
    { title: "Average True Range", publisher: "DayTrading.com" },
    { title: "Economic calendar: five things you need to know to begin trading the news", publisher: "FXStreet" },
  ],
}
