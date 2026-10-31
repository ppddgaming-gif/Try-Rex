import { gameDatasets } from "@/lib/game-data"
import { q } from "@/lib/learn/exam/bank-1-3"
import { distractors, fill, num, type BankEntry } from "@/lib/learn/exam/engine"
import { tx } from "@/lib/learn/lessons/tx"

// Exam questions for Levels 4–6. Server only: this file is the answer key.

const pick = <T,>(items: readonly T[], random: () => number) => items[Math.floor(random() * items.length)]
const pairName = (p: string) => `${p.slice(0, 3)}/${p.slice(3)}`

export const LEVEL_4: BankEntry[] = [
  q("l4-trendline-points", tx("Berapa titik minimum untuk menggambar trendline, dan berapa untuk mengonfirmasinya?", "How many points draw a trendline, and how many confirm it?"), [
    tx("Dua titik membuat garis, titik ketiga mengonfirmasi", "Two points draw it; a third confirms it"),
    tx("Satu titik sudah cukup", "One point is enough"),
    tx("Lima titik membuat garis, sepuluh mengonfirmasi", "Five draw it; ten confirm it"),
    tx("Garis tidak perlu titik swing", "A line needs no swing points"),
  ], 0, tx("Garis dari dua titik hanya hipotesis; sentuhan ketiga yang memantul mengonfirmasi.", "A line from two points is a hypothesis; a third touch that bounces confirms it.")),
  q("l4-steep", tx("Trendline yang sangat curam tertembus. Apakah tren pasti berbalik?", "A very steep trendline breaks. Has the trend surely reversed?"), [
    tx("Tidak; sering tren hanya beralih ke kemiringan lebih landai", "No; often the trend just shifts to a gentler slope"),
    tx("Ya, selalu", "Yes, always"),
    tx("Ya, jika candle-nya merah", "Yes, if the candle is red"),
    tx("Tidak bisa diketahui sama sekali", "It can never be known"),
  ], 0, tx("Penembusan garis curam bukan otomatis pembalikan; cek struktur HL/LH.", "A steep line breaking isn't automatically a reversal; check the HL/LH structure.")),
  q("l4-slope", tx("Swing low #5 di 1,0900 dan swing low #25 di 1,0940. Berapa slope per candle?", "Swing low #5 at 1.0900 and swing low #25 at 1.0940. What's the slope per candle?"), [
    tx("2 pip per candle", "2 pips per candle"),
    tx("4 pip per candle", "4 pips per candle"),
    tx("20 pip per candle", "20 pips per candle"),
    tx("0,2 pip per candle", "0.2 pips per candle"),
  ], 0, tx("(1,0940 − 1,0900) ÷ 20 = 0,0002 = 2 pip per candle.", "(1.0940 − 1.0900) ÷ 20 = 0.0002 = 2 pips per candle.")),
  q("l4-channel", tx("Apa itu channel (saluran)?", "What is a channel?"), [
    tx("Dua garis sejajar: trendline utama dan garis melalui swing di sisi seberang", "Two parallel lines: the main trendline and a line through the swings on the other side"),
    tx("Satu garis horizontal", "One horizontal line"),
    tx("Area antara bid dan ask", "The area between bid and ask"),
    tx("Indikator volume", "A volume indicator"),
  ], 0, tx("Harga bergerak di dalam saluran; garis tengahnya sering jadi target pertama.", "Price moves inside the channel; its midline is often the first target.")),
  q("l4-breakout-def", tx("Kapan breakout dianggap valid?", "When does a breakout count as valid?"), [
    tx("Saat harga menutup di luar level dan bertahan di sana", "When price closes outside the level and stays there"),
    tx("Saat bayangan candle menyentuh di luar level", "When a candle's shadow touches beyond the level"),
    tx("Saat spread melebar", "When the spread widens"),
    tx("Setiap kali harga mendekati resistance", "Whenever price nears resistance"),
  ], 0, tx("Bayangan yang menembus lalu close kembali di dalam adalah sapuan (false breakout).", "A shadow that pierces and then closes back inside is a sweep (false breakout).")),
  q("l4-bear-trap", tx("Apa itu bear trap?", "What is a bear trap?"), [
    tx("Penembusan palsu ke bawah support yang menjebak penjual", "A false break below support that traps sellers"),
    tx("Penembusan palsu ke atas resistance", "A false break above resistance"),
    tx("Tren turun yang kuat", "A strong downtrend"),
    tx("Candle bearish yang besar", "A big bearish candle"),
  ], 0, tx("Bear trap = false breakout ke bawah; bull trap = ke atas.", "Bear trap = a false break down; bull trap = up.")),
  q("l4-measured", tx("Range 1,0800–1,0900 ditembus ke atas. Berapa target kasar measured move?", "A 1.0800–1.0900 range breaks upwards. What's the rough measured-move target?"), [
    tx("1,1000", "1.1000"),
    tx("1,0950", "1.0950"),
    tx("1,0900", "1.0900"),
    tx("1,1100", "1.1100"),
  ], 0, tx("Level yang ditembus + tinggi range: 1,0900 + 100 pip = 1,1000. Acuan, bukan prediksi.", "The broken level + the range height: 1.0900 + 100 pips = 1.1000. A guide, not a forecast.")),
  q("l4-pullback-vs-reversal", tx("Apa beda pullback dan reversal?", "What's the difference between a pullback and a reversal?"), [
    tx("Pullback tidak merusak struktur (HL/LH terakhir terjaga); reversal merusaknya", "A pullback leaves the structure intact (the last HL/LH holds); a reversal breaks it"),
    tx("Pullback selalu lebih panjang", "A pullback is always longer"),
    tx("Tidak ada bedanya", "There's no difference"),
    tx("Reversal hanya terjadi di pair JPY", "Reversals only happen on JPY pairs"),
  ], 0, tx("Pullback = mundur sementara dalam tren; reversal = struktur berubah.", "Pullback = a temporary step back within the trend; reversal = the structure changes.")),
  q("l4-fib50", tx("Swing low 1,2000 dan swing high 1,2100 pada uptrend. Di mana level Fibonacci 50%?", "Swing low 1.2000 and swing high 1.2100 in an uptrend. Where is the 50% Fibonacci level?"), [
    tx("1,2050", "1.2050"),
    tx("1,2000", "1.2000"),
    tx("1,2100", "1.2100"),
    tx("1,2150", "1.2150"),
  ], 0, tx("1,2100 − 0,0100 × 0,5 = 1,2050.", "1.2100 − 0.0100 × 0.5 = 1.2050.")),
  q("l4-double-top", tx("Kapan pola double top dianggap selesai?", "When is a double top complete?"), [
    tx("Setelah harga menutup di bawah neckline", "After price closes below the neckline"),
    tx("Saat puncak kedua terbentuk", "When the second peak forms"),
    tx("Saat harga menyentuh puncak pertama", "When price touches the first peak"),
    tx("Tidak pernah selesai", "It never completes"),
  ], 0, tx("Pola baru sah setelah close menembus garis kunci.", "A pattern only counts after a close through its key line.")),
  q("l4-pattern-family", tx("Triangle, flag, pennant, dan rectangle termasuk keluarga pola…", "Triangles, flags, pennants and rectangles belong to which family?"), [
    tx("Continuation (kelanjutan)", "Continuation"),
    tx("Reversal (pembalikan)", "Reversal"),
    tx("Indikator momentum", "Momentum indicators"),
    tx("Pola candle tunggal", "Single-candle patterns"),
  ], 0, tx("Pola kelanjutan adalah jeda atau konsolidasi di tengah tren.", "Continuation patterns are pauses or consolidations within a trend.")),
  q("l4-ema-k", tx("Berapa faktor pemulus k untuk EMA(20)?", "What is the smoothing factor k for EMA(20)?"), [
    tx("2 ÷ 21 ≈ 0,0952", "2 ÷ 21 ≈ 0.0952"),
    tx("1 ÷ 20 = 0,05", "1 ÷ 20 = 0.05"),
    tx("2 ÷ 20 = 0,1", "2 ÷ 20 = 0.1"),
    tx("20 ÷ 2 = 10", "20 ÷ 2 = 10"),
  ], 0, tx("k = 2 ÷ (n + 1).", "k = 2 ÷ (n + 1).")),
  q("l4-crossover", tx("Mengapa crossover Moving Average buruk di pasar sideways?", "Why are Moving Average crossovers poor in a sideways market?"), [
    tx("Harga bolak-balik memotong MA, menghasilkan sinyal palsu (whipsaw)", "Price crosses the MA back and forth, giving false signals (whipsaws)"),
    tx("Karena MA tidak bisa dihitung saat sideways", "Because the MA can't be calculated sideways"),
    tx("Karena spread selalu nol saat sideways", "Because the spread is always zero sideways"),
    tx("Karena crossover selalu benar", "Because crossovers are always right"),
  ], 0, tx("Pakai crossover setelah memastikan pasar bertren, bukan untuk menentukan apakah pasar bertren.", "Use crossovers once you're sure the market is trending, not to decide whether it is.")),
  q("l4-rsi-70", tx("RSI di atas 70 dalam tren naik yang kuat berarti…", "An RSI above 70 in a strong uptrend means…"), [
    tx("Kenaikan sangat dominan; bukan otomatis sinyal jual", "Rises have dominated; it isn't automatically a sell signal"),
    tx("Harga pasti turun", "Price will surely fall"),
    tx("Harga terlalu mahal", "Price is too expensive"),
    tx("Pasar sedang tutup", "The market is closed"),
  ], 0, tx("Dalam tren kuat RSI bisa bertahan di zona ekstrem lama.", "In a strong trend RSI can stay in the extreme zone for a long time.")),
  q("l4-rsi-calc", tx("Rata-rata naik 8 pip dan rata-rata turun 4 pip. Berapa RSI?", "Average rise 8 pips, average fall 4 pips. What's the RSI?"), [
    tx("66,7", "66.7"),
    tx("50", "50"),
    tx("80", "80"),
    tx("33,3", "33.3"),
  ], 0, tx("RS = 2; RSI = 100 − 100 ÷ 3 = 66,7.", "RS = 2; RSI = 100 − 100 ÷ 3 = 66.7.")),
  q("l4-rsi-jpy", tx("Apakah RSI perlu rumus berbeda untuk pair JPY?", "Does RSI need a different formula for JPY pairs?"), [
    tx("Tidak; RSI memakai rasio, bukan jumlah pip", "No; RSI uses a ratio, not the number of pips"),
    tx("Ya, dikali 100", "Yes, multiplied by 100"),
    tx("Ya, dibagi 0,01", "Yes, divided by 0.01"),
    tx("RSI tidak bisa dipakai di pair JPY", "RSI can't be used on JPY pairs"),
  ], 0, tx("Jika semua harga dikalikan 100, RSI tetap sama persis.", "If every price is multiplied by 100, RSI stays exactly the same.")),
  q("l4-atr-direction", tx("ATR yang tinggi berarti…", "A high ATR means…"), [
    tx("Candle rata-rata lebar; ATR tidak memberi arah", "Candles are wide on average; ATR gives no direction"),
    tx("Harga akan naik", "Price will rise"),
    tx("Harga akan turun", "Price will fall"),
    tx("Spread sedang nol", "The spread is zero"),
  ], 0, tx("ATR mengukur volatilitas, bukan arah.", "ATR measures volatility, not direction.")),
  q("l4-atr-jpy", tx("ATR USD/JPY tertulis 0,360. Berapa pip?", "USD/JPY's ATR reads 0.360. How many pips?"), [
    tx("36 pip", "36 pips"),
    tx("3.600 pip", "3,600 pips"),
    tx("3,6 pip", "3.6 pips"),
    tx("0,36 pip", "0.36 pips"),
  ], 0, tx("0,360 ÷ 0,01 = 36 pip; untuk JPY jangan membagi dengan 0,0001.", "0.360 ÷ 0.01 = 36 pips; for JPY don't divide by 0.0001.")),
  q("l4-confirm-close", tx("Kapan candle konfirmasi dinilai?", "When is a confirmation candle judged?"), [
    tx("Setelah candle itu close", "After it closes"),
    tx("Saat candle baru mulai", "As soon as it starts"),
    tx("Di tengah candle", "Halfway through the candle"),
    tx("Kapan saja", "Any time"),
  ], 0, tx("Candle yang masih berjalan bisa berubah total sebelum ditutup.", "A candle still forming can change completely before it closes.")),
  q("l4-confluence", tx("Mengapa RSI dan Stochastic tidak dihitung sebagai dua konfirmasi berbeda?", "Why don't RSI and Stochastic count as two separate confirmations?"), [
    tx("Keduanya dihitung dari data harga yang sama, informasinya tumpang tindih", "Both come from the same price data, so their information overlaps"),
    tx("Karena Stochastic tidak ada", "Because Stochastic doesn't exist"),
    tx("Karena RSI selalu salah", "Because RSI is always wrong"),
    tx("Karena keduanya dilarang", "Because both are banned"),
  ], 0, tx("Konfluensi butuh bukti dari jenis yang berbeda.", "Confluence needs evidence of different kinds.")),
  {
    id: "l4-gen-sma",
    make: (random) => {
      const d = pick(gameDatasets.filter((x) => !x.pair.endsWith("JPY")), random)
      const i = Math.floor(random() * (d.candles.length - 5))
      const closes = d.candles.slice(i, i + 5).map((c) => c.c)
      const right = closes.reduce((a, b) => a + b, 0) / 5
      const wrong = distractors(right, [closes.slice(1).reduce((a, b) => a + b, 0) / 4, closes[4], (Math.max(...closes) + Math.min(...closes)) / 2, closes[0]], 5)
      return {
        prompt: fill(tx("Data historis nyata {pair}: lima close berurutan {list}. Berapa SMA(5)?", "Real historical {pair} data: five closes in a row {list}. What's the SMA(5)?"), {
          pair: tx(pairName(d.pair), pairName(d.pair)),
          list: { id: closes.map((c) => num(c, 5).id).join(" ; "), en: closes.map((c) => num(c, 5).en).join(" ; ") },
        }),
        options: [right, ...wrong].map((v) => num(v, 5)),
        answer: 0,
        explain: tx("SMA(5) = jumlah 5 close ÷ 5. Setiap close punya bobot sama.", "SMA(5) = the sum of the 5 closes ÷ 5. Every close has the same weight."),
      }
    },
  },
  {
    id: "l4-gen-close-position",
    make: (random) => {
      const d = pick(gameDatasets, random)
      const candidates = d.candles.filter((c) => c.h - c.l > 0)
      const c = pick(candidates, random)
      const right = (c.c - c.l) / (c.h - c.l)
      const wrong = distractors(right, [1 - right, (c.o - c.l) / (c.h - c.l), right / 2 + 0.5, 0.5], 2)
      return {
        prompt: fill(tx("Candle historis nyata {pair}: H {h}, L {l}, C {c}. Berapa posisi close-nya?", "A real historical {pair} candle: H {h}, L {l}, C {c}. What's its close position?"), {
          pair: tx(pairName(d.pair), pairName(d.pair)),
          h: num(c.h, d.digits),
          l: num(c.l, d.digits),
          c: num(c.c, d.digits),
        }),
        options: [right, ...wrong].map((v) => num(v, 2)),
        answer: 0,
        explain: tx("Posisi close = (close − low) ÷ (high − low). Mendekati 1 berarti pembeli menguasai penutupan.", "Close position = (close − low) ÷ (high − low). Near 1 means buyers controlled the close."),
      }
    },
  },
]

export const LEVEL_5: BankEntry[] = [
  q("l5-rate-currency", tx("Mengapa suku bunga yang lebih tinggi cenderung menguatkan mata uang?", "Why do higher interest rates tend to strengthen a currency?"), [
    tx("Imbal hasil lebih menarik, arus modal masuk, permintaan mata uang naik", "Returns are more attractive, capital flows in, demand for the currency rises"),
    tx("Bank sentral langsung menetapkan kurs", "The central bank sets the exchange rate directly"),
    tx("Karena spread menyempit", "Because spreads narrow"),
    tx("Karena inflasi pasti turun hari itu", "Because inflation surely falls that day"),
  ], 0, tx("Mata uang terpengaruh lewat daya tarik menyimpan uang di sana, bukan karena kurs diatur langsung.", "The currency is affected through how attractive it is to hold money there, not because the rate is set directly.")),
  q("l5-priced-in", tx("Pasar memperkirakan kenaikan bunga 0,25% dan bank sentral menaikkan 0,25%. Reaksi yang umum?", "The market expected a 0.25% hike and the central bank hikes 0.25%. The usual reaction?"), [
    tx("Sering datar atau bergerak kecil: sudah priced in", "Often flat or a small move: already priced in"),
    tx("Mata uang selalu melonjak tajam", "The currency always jumps sharply"),
    tx("Mata uang selalu jatuh tajam", "The currency always falls sharply"),
    tx("Pasar ditutup", "The market closes"),
  ], 0, tx("Yang menggerakkan harga adalah kejutan, bukan angkanya.", "What moves price is the surprise, not the number.")),
  q("l5-hawkish", tx("Bank sentral disebut hawkish jika…", "A central bank is called hawkish when it…"), [
    tx("Condong mengetatkan: bunga tinggi atau naik", "Leans towards tightening: rates high or rising"),
    tx("Condong melonggarkan: bunga turun", "Leans towards loosening: rates falling"),
    tx("Tidak pernah berkomentar", "Never comments"),
    tx("Mengatur kurs setiap hari", "Sets the exchange rate daily"),
  ], 0, tx("Hawkish cenderung menguatkan; dovish cenderung melemahkan.", "Hawkish tends to strengthen; dovish tends to weaken.")),
  q("l5-differential", tx("Dalam forex, yang lebih penting dari bunga satu negara adalah…", "In forex, what matters more than one country's rate is…"), [
    tx("Selisih suku bunga dua negara di pair itu dan arahnya", "The rate gap between the pair's two countries and its direction"),
    tx("Jumlah bank di negara itu", "The number of banks in the country"),
    tx("Warna mata uangnya", "The colour of its banknotes"),
    tx("Jam buka bursa saham", "The stock exchange's opening hours"),
  ], 0, tx("Forex selalu membandingkan dua mata uang; arus modal mengikuti imbal hasil relatif.", "Forex always compares two currencies; capital follows relative returns.")),
  q("l5-carry", tx("Carry trade: selisih bunga 3,35% per tahun, tetapi mata uang berbunga tinggi turun 5%. Hasil bersih sebelum leverage?", "Carry trade: a 3.35% a year rate gap, but the high-rate currency falls 5%. Net result before leverage?"), [
    tx("−1,65%", "−1.65%"),
    tx("+8,35%", "+8.35%"),
    tx("+3,35%", "+3.35%"),
    tx("−5%", "−5%"),
  ], 0, tx("3,35% − 5% = −1,65%. Bunga tinggi bukan alasan yang cukup untuk membeli.", "3.35% − 5% = −1.65%. A high rate isn't reason enough to buy.")),
  q("l5-core", tx("Mengapa trader banyak memperhatikan core CPI?", "Why do traders watch core CPI closely?"), [
    tx("Tanpa makanan dan energi yang sering naik-turun karena faktor sementara", "It leaves out food and energy, which swing on temporary factors"),
    tx("Karena dirilis setiap jam", "Because it's released every hour"),
    tx("Karena selalu lebih tinggi", "Because it's always higher"),
    tx("Karena hanya mengukur harga emas", "Because it only measures gold"),
  ], 0, tx("Core memberi gambaran tekanan harga yang lebih menetap.", "Core shows the stickier price pressure.")),
  q("l5-yy", tx("Indeks harga setahun lalu 250,0 dan sekarang 258,5. Inflasi y/y?", "A price index of 250.0 a year ago and 258.5 now. y/y inflation?"), [
    tx("3,4%", "3.4%"),
    tx("8,5%", "8.5%"),
    tx("2,5%", "2.5%"),
    tx("34%", "34%"),
  ], 0, tx("(258,5 − 250) ÷ 250 = 3,4%.", "(258.5 − 250) ÷ 250 = 3.4%.")),
  q("l5-consensus", tx("Apa yang paling menggerakkan harga saat data seperti NFP dirilis?", "What moves price most when data like NFP is released?"), [
    tx("Selisih antara angka actual dan konsensus (forecast)", "The gap between the actual figure and the consensus (forecast)"),
    tx("Angka actual saja, tanpa melihat dugaan", "The actual figure alone, ignoring expectations"),
    tx("Warna angka di kalender", "The colour of the figure on the calendar"),
    tx("Angka bulan lalu", "Last month's figure"),
  ], 0, tx("Pasar sudah berdagang berdasarkan konsensus; kejutan yang menggerakkan harga.", "The market has already traded on the consensus; the surprise moves price.")),
  q("l5-unemployment", tx("Tingkat pengangguran lebih tinggi dari forecast cenderung…", "An unemployment rate above forecast tends to…"), [
    tx("Melemahkan mata uang", "Weaken the currency"),
    tx("Menguatkan mata uang", "Strengthen the currency"),
    tx("Tidak berpengaruh sama sekali", "Have no effect at all"),
    tx("Menutup pasar", "Close the market"),
  ], 0, tx("Pasar kerja lebih lemah → bank sentral cenderung lebih longgar → permintaan mata uang berkurang.", "A weaker jobs market → a looser central bank → less demand for the currency.")),
  q("l5-fed-mandate", tx("Dua tugas utama The Fed (dual mandate) adalah…", "The Fed's two main jobs (dual mandate) are…"), [
    tx("Lapangan kerja maksimum dan harga yang stabil", "Maximum employment and stable prices"),
    tx("Menjaga kurs dolar dan harga minyak", "Defending the dollar and oil prices"),
    tx("Mengatur pasar saham dan kripto", "Running the stock and crypto markets"),
    tx("Menetapkan pajak dan anggaran", "Setting taxes and the budget"),
  ], 0, tx("Target inflasinya 2% per tahun, diukur dengan PCE headline.", "Its inflation target is 2% a year, measured by headline PCE.")),
  q("l5-fomc-wib", tx("Pernyataan FOMC terbit 14.00 waktu New York saat AS musim dingin (EST). Pukul berapa WIB?", "The FOMC statement comes out at 14:00 New York time in US winter (EST). What time in WIB?"), [
    tx("Sekitar 02.00 WIB dini hari berikutnya", "About 02:00 WIB the next morning"),
    tx("14.00 WIB hari yang sama", "14:00 WIB the same day"),
    tx("19.30 WIB hari yang sama", "19:30 WIB the same day"),
    tx("07.00 WIB hari berikutnya", "07:00 WIB the next day"),
  ], 0, tx("EST = UTC−5, WIB = UTC+7: selisih 12 jam.", "EST = UTC−5, WIB = UTC+7: a 12-hour gap.")),
  q("l5-dot-plot", tx("Dot plot The Fed sebaiknya diperlakukan sebagai…", "The Fed's dot plot should be treated as…"), [
    tx("Kumpulan perkiraan pribadi anggota, bukan janji", "A set of members' personal estimates, not a promise"),
    tx("Jadwal pasti kenaikan bunga", "A fixed schedule of hikes"),
    tx("Sinyal beli dolar", "A buy-the-dollar signal"),
    tx("Data inflasi resmi", "Official inflation data"),
  ], 0, tx("Titik berubah ketika data berubah; kluster lebih penting dari titik tunggal.", "The dots change when data changes; the cluster matters more than a single dot.")),
  q("l5-calendar-signal", tx("Kalender ekonomi memberi tahu…", "The economic calendar tells you…"), [
    tx("Kapan sesuatu akan terjadi, bukan ke mana harga akan pergi", "When something will happen, not where price will go"),
    tx("Ke mana harga pasti bergerak", "Where price will surely move"),
    tx("Sinyal beli dan jual", "Buy and sell signals"),
    tx("Harga penutupan besok", "Tomorrow's close"),
  ], 0, tx("Kalender bukan sinyal; ia membantu menghindari kejutan.", "The calendar isn't a signal; it helps you avoid surprises.")),
  q("l5-impact", tx("Di kalender ekonomi, warna merah biasanya menandakan…", "On an economic calendar, red usually marks…"), [
    tx("Dampak tinggi", "High impact"),
    tx("Dampak rendah", "Low impact"),
    tx("Data yang sudah direvisi", "Revised data"),
    tx("Pasar sedang tutup", "The market is closed"),
  ], 0, tx("Merah = tinggi, oranye = menengah, kuning = rendah.", "Red = high, orange = medium, yellow = low.")),
  q("l5-news-stance", tx("Sikap yang paling sesuai untuk pemula saat berita berdampak tinggi?", "The most suitable approach for beginners around high-impact news?"), [
    tx("Menghindar atau menunggu sesudahnya sampai spread normal", "Stay away, or wait until afterwards when spreads are normal"),
    tx("Masuk posisi besar tepat saat rilis", "Open a big position right at the release"),
    tx("Memasang order di dua arah dengan lot besar", "Place large orders in both directions"),
    tx("Menghapus stop loss agar tidak terkena", "Remove the stop loss so it isn't hit"),
  ], 0, tx("Saat berita, spread melebar, slippage dan whipsaw sering terjadi.", "Around news, spreads widen and slippage and whipsaws are common.")),
  q("l5-slippage-cost", tx("Stop loss 20 pip terkena dengan slippage 8 pip pada 0,1 lot ($1 per pip). Rugi sebenarnya?", "A 20-pip stop is hit with 8 pips of slippage on 0.1 lot ($1 per pip). The real loss?"), [
    tx("$28", "$28"),
    tx("$20", "$20"),
    tx("$12", "$12"),
    tx("$8", "$8"),
  ], 0, tx("(20 + 8) pip × $1 = $28, 1,4 kali dari rencana.", "(20 + 8) pips × $1 = $28, 1.4 times the plan.")),
  q("l5-risk-off", tx("Saat pasar panik (risk-off), mata uang yang sering menguat adalah…", "When markets panic (risk-off), which currencies often strengthen?"), [
    tx("JPY dan CHF", "JPY and CHF"),
    tx("AUD dan NZD", "AUD and NZD"),
    tx("CAD dan AUD", "CAD and AUD"),
    tx("Semua mata uang sama", "All currencies equally"),
  ], 0, tx("Mata uang \"aman\" cenderung menguat saat panik, meski bunganya rendah.", "\"Safe\" currencies tend to strengthen in a panic, even with low rates.")),
  q("l5-commodity", tx("Dolar Kanada (CAD) sering dikaitkan dengan harga…", "The Canadian dollar (CAD) is often linked to the price of…"), [
    tx("Minyak mentah", "Crude oil"),
    tx("Produk susu", "Dairy products"),
    tx("Bijih besi", "Iron ore"),
    tx("Emas saja", "Gold only"),
  ], 0, tx("AUD: bijih besi dan batu bara; NZD: produk susu; CAD: minyak.", "AUD: iron ore and coal; NZD: dairy; CAD: oil.")),
  q("l5-fundamental-limit", tx("Apa yang tidak dijawab analisis fundamental?", "What doesn't fundamental analysis answer?"), [
    tx("Kapan masuk, di mana salah, dan berapa lot", "When to enter, where you're wrong, and how many lots"),
    tx("Mengapa harga mungkin bergerak", "Why price might move"),
    tx("Arah kebijakan bank sentral", "The direction of central bank policy"),
    tx("Kondisi ekonomi sebuah negara", "A country's economic condition"),
  ], 0, tx("Tiga pertanyaan itu dijawab analisis teknikal dan manajemen risiko.", "Those three are answered by technical analysis and risk management.")),
  {
    id: "l5-gen-release-wib",
    make: (random) => {
      const summer = random() < 0.5
      const right = summer ? 19.5 : 20.5
      const label = (h: number) => {
        const hh = String(Math.floor(h)).padStart(2, "0")
        const mm = h % 1 ? "30" : "00"
        return tx(`${hh}.${mm} WIB`, `${hh}:${mm} WIB`)
      }
      return {
        prompt: summer
          ? tx("Data AS dirilis 08.30 waktu New York saat AS musim panas (EDT). Pukul berapa WIB?", "US data is released at 08:30 New York time in US summer (EDT). What time in WIB?")
          : tx("Data AS dirilis 08.30 waktu New York saat AS musim dingin (EST). Pukul berapa WIB?", "US data is released at 08:30 New York time in US winter (EST). What time in WIB?"),
        options: [right, summer ? 20.5 : 19.5, 8.5, 1.5].map(label),
        answer: 0,
        explain: summer
          ? tx("EDT = UTC−4, WIB = UTC+7: selisih 11 jam.", "EDT = UTC−4, WIB = UTC+7: an 11-hour gap.")
          : tx("EST = UTC−5, WIB = UTC+7: selisih 12 jam.", "EST = UTC−5, WIB = UTC+7: a 12-hour gap."),
      }
    },
  },
]

export const LEVEL_6: BankEntry[] = [
  q("l6-discipline-def", tx("Disiplin trading menurut materi adalah…", "Trading discipline in the lesson is…"), [
    tx("Melakukan hal yang sudah diputuskan saat tenang, pada saat sedang tidak tenang", "Doing what you decided while calm, at a moment when you're not calm"),
    tx("Selalu menang setiap transaksi", "Winning every trade"),
    tx("Menekan semua emosi sampai hilang", "Suppressing every emotion until it's gone"),
    tx("Tidak pernah mengubah rencana selamanya", "Never changing the plan, ever"),
  ], 0, tx("Disiplin adalah keterampilan yang dilatih lewat sistem, bukan sifat bawaan.", "Discipline is a skill trained through systems, not an inborn trait.")),
  q("l6-vague-plan", tx("Mengapa \"beli kalau terlihat naik\" bukan rencana yang baik?", "Why is \"buy if it looks like it's rising\" not a good plan?"), [
    tx("Tidak ada ukuran yang jelas, sehingga kepatuhannya tidak bisa diperiksa", "It has no clear measure, so compliance can't be checked"),
    tx("Karena terlalu panjang", "Because it's too long"),
    tx("Karena memakai kata \"beli\"", "Because it uses the word \"buy\""),
    tx("Karena rencana tidak diperlukan", "Because plans aren't needed"),
  ], 0, tx("Rencana yang baik spesifik sampai orang lain bisa menilai apakah kamu mematuhinya.", "A good plan is specific enough that someone else could judge whether you followed it.")),
  q("l6-loss-aversion", tx("Loss aversion berarti…", "Loss aversion means…"), [
    tx("Kerugian terasa lebih berat daripada keuntungan dengan nilai yang sama", "A loss feels heavier than a gain of the same size"),
    tx("Trader selalu menghindari pasar", "Traders always avoid the market"),
    tx("Keuntungan terasa lebih berat daripada kerugian", "A gain feels heavier than a loss"),
    tx("Stop loss otomatis", "An automatic stop loss"),
  ], 0, tx("Akibatnya posisi rugi ditahan terlalu lama dan posisi untung dijual terlalu cepat.", "As a result, losers are held too long and winners sold too soon.")),
  q("l6-if-then", tx("Apa beda niat \"aku mau lebih disiplin\" dengan aturan jika-maka?", "How does the intention \"I want to be more disciplined\" differ from an if-then rule?"), [
    tx("Aturan jika-maka menetapkan pemicu dan tindakan yang konkret", "An if-then rule sets a concrete trigger and action"),
    tx("Tidak ada bedanya", "There's no difference"),
    tx("Niat lebih mudah dijalankan otomatis", "An intention runs more automatically"),
    tx("Aturan jika-maka hanya untuk pemain olahraga", "If-then rules are only for athletes"),
  ], 0, tx("Contoh: jika dua rugi beruntun, maka berhenti 30 menit dan isi jurnal.", "Example: if two losses in a row, then stop for 30 minutes and fill in the journal.")),
  q("l6-compliance", tx("20 transaksi seminggu, 14 sesuai rencana. Skor kepatuhan dan artinya?", "20 trades in a week, 14 by the plan. The compliance score and its meaning?"), [
    tx("70%: di bawah 75%, perbaiki eksekusi sebelum mengganti strategi", "70%: below 75%, fix execution before changing the strategy"),
    tx("70%: strategi pasti buruk, ganti segera", "70%: the strategy is surely bad, change it now"),
    tx("140%: sangat baik", "140%: excellent"),
    tx("14%: abaikan saja", "14%: just ignore it"),
  ], 0, tx("Skor di bawah sekitar 75% menunjukkan masalah eksekusi.", "A score below about 75% points to an execution problem.")),
  q("l6-violated-win", tx("Transaksi yang melanggar rencana tetapi kebetulan untung adalah…", "A trade that broke the plan but happened to win is…"), [
    tx("Berbahaya: memberi penguatan semu pada kebiasaan buruk", "Dangerous: it falsely rewards a bad habit"),
    tx("Bukti bahwa rencana tidak perlu", "Proof the plan isn't needed"),
    tx("Transaksi terbaik", "The best kind of trade"),
    tx("Tidak perlu dicatat", "Not worth recording"),
  ], 0, tx("Jika diulang, polanya punya ekspektasi negatif.", "Repeated, the pattern has a negative expectancy.")),
  q("l6-system1", tx("Keputusan impulsif biasanya lahir dari…", "Impulsive decisions usually come from…"), [
    tx("Sistem 1: berpikir cepat, otomatis, dan emosional", "System 1: fast, automatic, emotional thinking"),
    tx("Sistem 2: berpikir lambat dan menghitung", "System 2: slow, calculating thinking"),
    tx("Indikator RSI", "The RSI indicator"),
    tx("Kalender ekonomi", "The economic calendar"),
  ], 0, tx("Daftar periksa, jeda, dan batas harian adalah alat untuk memanggil Sistem 2.", "Checklists, pauses and daily limits are tools to call System 2 in.")),
  q("l6-revenge-filter", tx("Setelah rugi, pertanyaan mana yang menyaring revenge trading?", "After a loss, which question filters out revenge trading?"), [
    tx("Apakah aku akan mengambil transaksi ini seandainya hari ini belum punya posisi?", "Would I take this trade if I'd had no position today?"),
    tx("Berapa cepat aku bisa mengembalikan rugi?", "How fast can I win the loss back?"),
    tx("Apakah lot bisa digandakan?", "Can I double the lot?"),
    tx("Pair mana yang paling cepat bergerak?", "Which pair moves fastest?"),
  ], 0, tx("Jika ada jawaban \"tidak\" pada pertanyaan saringan, kemungkinan besar itu balas dendam.", "If any filter question gets a \"no\", it's most likely revenge.")),
  q("l6-cascade", tx("Mengapa memutus rantai di mata rantai pertama itu penting?", "Why break the chain at the first link?"), [
    tx("Rugi pertama sering memicu frustrasi, balas dendam, lalu overtrading", "The first loss often sparks frustration, revenge, then overtrading"),
    tx("Karena rantai kedua selalu untung", "Because the second link always wins"),
    tx("Karena aturan broker", "Because of broker rules"),
    tx("Tidak penting", "It isn't important"),
  ], 0, tx("Menghentikan rantai di awal jauh lebih murah daripada di tengah.", "Stopping the chain early is far cheaper than in the middle.")),
  q("l6-fomo-rule", tx("Aturan emas FOMO adalah…", "The golden rule of FOMO is…"), [
    tx("Entry yang terlewat dianggap tidak ada", "A missed entry doesn't exist"),
    tx("Kejar setiap gerakan besar", "Chase every big move"),
    tx("Masuk dengan harga berapa pun", "Enter at any price"),
    tx("Gandakan lot saat terlambat", "Double the lot when late"),
  ], 0, tx("Masuk terlambat memperburuk rasio untung:rugi; peluang baru selalu datang.", "Entering late worsens the reward:risk; new chances always come.")),
  q("l6-overtrade-cost", tx("Spread 1,2 pip ($1 per pip), 10 transaksi per hari selama 20 hari. Biaya spread sebulan?", "A 1.2-pip spread ($1 per pip), 10 trades a day for 20 days. The monthly spread cost?"), [
    tx("$240", "$240"),
    tx("$24", "$24"),
    tx("$120", "$120"),
    tx("$2.400", "$2,400"),
  ], 0, tx("200 transaksi × $1,2 = $240, sebelum untung pertama masuk.", "200 trades × $1.2 = $240, before the first profit arrives.")),
  q("l6-no-trade-day", tx("Hari tanpa transaksi karena tidak ada sinyal valid adalah…", "A day with no trades because there was no valid signal is…"), [
    tx("Hari yang berhasil karena kamu patuh pada rencana", "A successful day because you followed the plan"),
    tx("Hari yang gagal", "A failed day"),
    tx("Tanda strategi rusak", "A sign the strategy is broken"),
    tx("Alasan untuk menurunkan syarat masuk", "A reason to lower the entry conditions"),
  ], 0, tx("Menahan diri adalah bagian dari strategi.", "Holding back is part of the strategy.")),
  q("l6-journal-review", tx("Jurnal yang tidak pernah ditinjau hanyalah…", "A journal that's never reviewed is just…"), [
    tx("Buku harian", "A diary"),
    tx("Strategi yang bagus", "A good strategy"),
    tx("Skor kepatuhan", "A compliance score"),
    tx("Kalender ekonomi", "An economic calendar"),
  ], 0, tx("Tinjau secara terjadwal: singkat tiap hari, lebih dalam tiap minggu.", "Review on a schedule: briefly every day, deeper every week.")),
  q("l6-journal-split", tx("Mengapa transaksi patuh dan tidak patuh dihitung terpisah di jurnal?", "Why count followed and broken-plan trades separately in the journal?"), [
    tx("Agar tahu apakah masalahnya strategi atau eksekusi", "To see whether the problem is the strategy or the execution"),
    tx("Agar jurnal lebih panjang", "To make the journal longer"),
    tx("Karena broker mewajibkannya", "Because the broker requires it"),
    tx("Tidak perlu dipisahkan", "There's no need to split them"),
  ], 0, tx("Pelanggaran bisa menutupi kualitas strategi yang sebenarnya.", "Violations can hide the strategy's real quality.")),
  q("l6-outcome-process", tx("Kamu mengikuti rencana dengan risiko terukur, tetapi rugi. Bagaimana menilainya?", "You followed your plan with measured risk but lost. How do you judge it?"), [
    tx("Keputusan baik dengan hasil sial yang wajar; jangan ubah apa pun", "A good decision with normal bad luck; change nothing"),
    tx("Keputusan buruk; ganti strategi", "A bad decision; change strategy"),
    tx("Naikkan lot berikutnya untuk menutup rugi", "Raise the next lot to cover the loss"),
    tx("Hapus transaksi itu dari jurnal", "Delete the trade from the journal"),
  ], 0, tx("Nilai keputusan dari prosesnya, bukan dari satu hasil.", "Judge a decision by its process, not one outcome.")),
  q("l6-five-whys", tx("Teknik \"lima mengapa\" dipakai untuk…", "The \"five whys\" technique is used to…"), [
    tx("Menemukan akar masalah yang bisa diperbaiki", "Find a root cause that can be fixed"),
    tx("Menghitung pip", "Count pips"),
    tx("Menentukan arah tren", "Decide the trend's direction"),
    tx("Memilih broker", "Choose a broker"),
  ], 0, tx("Kesalahan yang tampak sering hanyalah gejala; contohnya ukuran risiko yang terlalu besar.", "The visible mistake is often only a symptom; for example a risk size that's too big.")),
  q("l6-streaks", tx("Strategi dengan win rate 40% mengalami lima rugi beruntun. Kesimpulan yang tepat?", "A 40% win-rate strategy has five losses in a row. The right conclusion?"), [
    tx("Rugi beruntun itu normal; periksa kepatuhan dan jumlah sampel dulu", "Losing streaks are normal; check compliance and sample size first"),
    tx("Strateginya pasti rusak", "The strategy is surely broken"),
    tx("Transaksi berikutnya pasti untung", "The next trade will surely win"),
    tx("Gandakan lot", "Double the lot"),
  ], 0, tx("Dalam 100 transaksi, rangkaian lima rugi hampir pasti terjadi pada win rate 40%.", "Over 100 trades, a run of five losses is almost certain at a 40% win rate.")),
  q("l6-sample", tx("Trader menang 75% dari 12 transaksi. Mengapa ia belum boleh yakin?", "A trader wins 75% of 12 trades. Why shouldn't they be confident yet?"), [
    tx("Sampel terlalu kecil; win rate sebenarnya bisa jauh berbeda", "The sample is too small; the true win rate may be very different"),
    tx("Karena 75% terlalu rendah", "Because 75% is too low"),
    tx("Karena 12 transaksi terlalu banyak", "Because 12 trades are too many"),
    tx("Ia sudah boleh yakin", "They can already be confident"),
  ], 0, tx("Klaim sebaiknya sebesar bukti: puluhan transaksi untuk kesan awal, ratusan untuk kesimpulan.", "Claims should match the evidence: dozens of trades for first impressions, hundreds for conclusions.")),
  {
    id: "l6-gen-expectancy",
    make: (random) => {
      const win = pick([0.35, 0.4, 0.45, 0.5, 0.55], random)
      const avgWin = pick([1.5, 2, 2.5, 3], random)
      const right = win * avgWin - (1 - win)
      const wrong = distractors(right, [win * avgWin, win * avgWin + (1 - win), avgWin - 1, right + 0.5], 2)
      return {
        prompt: fill(tx("Win rate {w}%, rata-rata menang {a}R, rata-rata kalah 1R. Berapa ekspektasi per transaksi?", "A {w}% win rate, an average win of {a}R, an average loss of 1R. What's the expectancy per trade?"), {
          w: num(win * 100, 0),
          a: num(avgWin, 1),
        }),
        options: [right, ...wrong].map((v) => fill(tx("{v}R", "{v}R"), { v: num(v, 2) })),
        answer: 0,
        explain: fill(tx("{w} × {a} − {l} × 1 = {r}R.", "{w} × {a} − {l} × 1 = {r}R."), { w: num(win, 2), a: num(avgWin, 1), l: num(1 - win, 2), r: num(right, 2) }),
      }
    },
  },
  {
    id: "l6-gen-recovery",
    make: (random) => {
      const dd = pick([10, 20, 25, 30, 40, 50, 60], random)
      const right = (1 / (1 - dd / 100) - 1) * 100
      const wrong = distractors(right, [dd, dd / 2, dd * 1.5 === right ? dd * 3 : dd * 1.5], 1)
      return {
        prompt: fill(tx("Akun mengalami drawdown {d}%. Berapa untung yang dibutuhkan untuk kembali ke puncak?", "An account is in a {d}% drawdown. What gain is needed to get back to the peak?"), { d: num(dd, 0) }),
        options: [right, ...wrong].map((v) => fill(tx("{v}%", "{v}%"), { v: num(v, 1) })),
        answer: 0,
        explain: fill(tx("1 ÷ (1 − {d}%) − 1 = {r}%. Makin dalam jatuhnya, makin berat jalan pulangnya.", "1 ÷ (1 − {d}%) − 1 = {r}%. The deeper the fall, the harder the way back."), { d: num(dd, 0), r: num(right, 1) }),
      }
    },
  },
]
