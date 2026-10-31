import { gameDatasets } from "@/lib/game-data"
import { distractors, fill, num, type BankEntry, type ExamItem } from "@/lib/learn/exam/engine"
import { tx } from "@/lib/learn/lessons/tx"
import type { Text } from "@/lib/learn/types"

// Exam questions for Levels 1–3, written from the lessons (which follow the
// "Materi Basic" handouts). Server only: this file is the answer key. Every
// question tests a fact or formula the lesson states; generated questions use
// real historical prices from the game data or the handouts' own formulas.

export const q = (id: string, prompt: Text, options: Text[], answer: number, explain: Text): ExamItem => ({ id, prompt, options, answer, explain })

const pick = <T,>(items: readonly T[], random: () => number) => items[Math.floor(random() * items.length)]

/** Two real closes of one dataset, a few candles apart. */
function realMove(random: () => number, usdQuoteOnly = false) {
  const pool = usdQuoteOnly ? gameDatasets.filter((d) => d.pair.endsWith("USD")) : gameDatasets
  const d = pick(pool, random)
  const i = Math.floor(random() * (d.candles.length - 8))
  const j = i + 3 + Math.floor(random() * 5)
  const pip = 10 ** -(d.digits - 1)
  const from = d.candles[i].c
  const to = d.candles[j].c === from ? d.candles[j].h : d.candles[j].c
  return { pair: `${d.pair.slice(0, 3)}/${d.pair.slice(3)}`, digits: d.digits, pip, from, to, pips: Math.round(((to - from) / pip) * 10) / 10 }
}

export const LEVEL_1: BankEntry[] = [
  q("l1-otc", tx("Mengapa pasar forex disebut pasar over-the-counter (OTC)?", "Why is the forex market called an over-the-counter (OTC) market?"), [
    tx("Transaksi dilakukan langsung antara dua pihak secara elektronik, tanpa bursa pusat", "Trades happen directly between two parties electronically, with no central exchange"),
    tx("Semua transaksi dilakukan di satu gedung bursa di New York", "Every trade happens in one exchange building in New York"),
    tx("Harga ditetapkan oleh satu bank sentral setiap pagi", "Prices are set by one central bank every morning"),
    tx("Hanya bank yang boleh bertransaksi", "Only banks are allowed to trade"),
  ], 0, tx("Forex tidak punya tempat fisik; transaksi terhubung lewat jaringan bank secara elektronik.", "Forex has no physical place; trades are linked electronically through bank networks.")),
  q("l1-hours", tx("Berapa lama pasar forex buka?", "When is the forex market open?"), [
    tx("24 jam sehari, lima hari dalam seminggu", "24 hours a day, five days a week"),
    tx("08.00–16.00 WIB setiap hari kerja", "08:00–16:00 WIB on working days"),
    tx("24 jam setiap hari tanpa libur", "24 hours every day with no break"),
    tx("Hanya saat sesi London", "Only during the London session"),
  ], 0, tx("Pasar tersebar dari Asia, Eropa, sampai Amerika, sehingga buka 24 jam selama lima hari kerja.", "The market spans Asia, Europe and America, so it's open 24 hours over the five working days.")),
  q("l1-gamble", tx("Apa perbedaan utama trading dan judi menurut materi?", "What is the main difference between trading and gambling in the lesson?"), [
    tx("Trading memakai analisis dan kontrol risiko; judi bergantung pada keberuntungan", "Trading uses analysis and risk control; gambling relies on luck"),
    tx("Trading selalu untung, judi selalu rugi", "Trading always wins, gambling always loses"),
    tx("Tidak ada perbedaan sama sekali", "There's no difference at all"),
    tx("Trading hanya boleh dilakukan bank", "Only banks may trade"),
  ], 0, tx("Keputusan trading dibuat dari analisis yang terukur, dan risikonya dikelola dengan manajemen modal.", "Trading decisions come from measured analysis, and risk is managed with money management.")),
  q("l1-buy-eurusd", tx("Membeli (Buy) EUR/USD berarti…", "Buying EUR/USD means…"), [
    tx("Membeli euro dan sekaligus menjual dolar AS", "Buying euros and selling US dollars at the same time"),
    tx("Membeli dolar AS dan menjual euro", "Buying US dollars and selling euros"),
    tx("Membeli euro dan dolar AS sekaligus", "Buying both euros and US dollars"),
    tx("Menukar euro ke rupiah", "Changing euros into rupiah"),
  ], 0, tx("Buy = membeli base (kiri) dan menjual quote (kanan).", "Buy = buying the base (left) and selling the quote (right).")),
  q("l1-quote-meaning", tx("GBP/USD = 1,2700 artinya…", "GBP/USD = 1.2700 means…"), [
    tx("1 poundsterling bernilai 1,2700 dolar AS", "1 pound sterling is worth 1.2700 US dollars"),
    tx("1 dolar AS bernilai 1,2700 poundsterling", "1 US dollar is worth 1.2700 pounds sterling"),
    tx("Spread GBP/USD adalah 1,2700 pip", "GBP/USD's spread is 1.2700 pips"),
    tx("GBP/USD naik 1,27% hari ini", "GBP/USD rose 1.27% today"),
  ], 0, tx("Harga menjawab: untuk 1 unit base, berapa unit quote yang dibayar.", "The price answers: for 1 unit of the base, how many units of the quote you pay.")),
  q("l1-pair-up", tx("Harga EUR/USD naik. Apa artinya?", "EUR/USD rises. What does it mean?"), [
    tx("Euro menguat terhadap dolar AS", "The euro strengthened against the US dollar"),
    tx("Euro melemah terhadap dolar AS", "The euro weakened against the US dollar"),
    tx("Spread melebar", "The spread widened"),
    tx("Pasar sedang tutup", "The market is closed"),
  ], 0, tx("Harga pair naik = base menguat terhadap quote.", "The pair rising = the base strengthening against the quote.")),
  q("l1-commodity", tx("Mana yang termasuk \"mata uang komoditas\"?", "Which are the \"commodity currencies\"?"), [
    tx("AUD, NZD, dan CAD", "AUD, NZD and CAD"),
    tx("USD, EUR, dan JPY", "USD, EUR and JPY"),
    tx("GBP, CHF, dan EUR", "GBP, CHF and EUR"),
    tx("JPY, CHF, dan USD", "JPY, CHF and USD"),
  ], 0, tx("Ekonomi Australia, Selandia Baru, dan Kanada terkait erat dengan industri komoditas.", "Australia's, New Zealand's and Canada's economies are closely tied to commodity industries.")),
  q("l1-bid-ask", tx("Saat kamu menekan Buy, posisi dibuka di harga…", "When you press Buy, the position opens at…"), [
    tx("Ask", "The ask"),
    tx("Bid", "The bid"),
    tx("Rata-rata bid dan ask", "The average of bid and ask"),
    tx("Harga penutupan kemarin", "Yesterday's close"),
  ], 0, tx("Beli di ask, jual di bid; ask selalu sedikit lebih tinggi dari bid.", "Buy at the ask, sell at the bid; the ask is always a little higher.")),
  q("l1-spread-minus", tx("Mengapa posisi yang baru dibuka biasanya langsung menunjukkan minus kecil?", "Why does a newly opened position usually show a small minus straight away?"), [
    tx("Karena spread: kamu langsung berada sedikit di bawah titik impas", "Because of the spread: you start a little below break-even"),
    tx("Karena platform sedang error", "Because the platform has an error"),
    tx("Karena leverage terlalu tinggi", "Because leverage is too high"),
    tx("Karena harga selalu turun setelah order masuk", "Because price always falls after an order"),
  ], 0, tx("Itu bukan error, itu spread: biaya masuk posisi.", "It isn't an error; it's the spread, the cost of entering.")),
  q("l1-slippage", tx("Apa itu slippage?", "What is slippage?"), [
    tx("Order terisi di harga yang berbeda dari perkiraan", "An order fills at a different price than expected"),
    tx("Selisih harga bid dan ask", "The gap between bid and ask"),
    tx("Biaya inap posisi semalam", "The overnight holding fee"),
    tx("Satuan terkecil gerak harga", "The smallest unit of price movement"),
  ], 0, tx("Slippage umum terjadi saat likuiditas rendah atau volatilitas tinggi; tidak selalu merugikan.", "Slippage is common when liquidity is low or volatility high; it isn't always against you.")),
  q("l1-pip-jpy", tx("Berapa ukuran 1 pip pada pair yang mengandung JPY?", "What is the size of 1 pip on a JPY pair?"), [
    tx("0,01", "0.01"),
    tx("0,0001", "0.0001"),
    tx("0,1", "0.1"),
    tx("1", "1"),
  ], 0, tx("Pair biasa 0,0001; pair JPY 0,01. Memakai 0,0001 untuk JPY membuat hitungan meleset 100 kali.", "Most pairs 0.0001; JPY pairs 0.01. Using 0.0001 for JPY puts you off by 100 times.")),
  q("l1-lot-units", tx("1 lot standar berisi berapa unit mata uang base?", "How many units of the base currency are in 1 standard lot?"), [
    tx("100.000", "100,000"),
    tx("10.000", "10,000"),
    tx("1.000", "1,000"),
    tx("1.000.000", "1,000,000"),
  ], 0, tx("Standard 1 lot = 100.000; mini 0,1 lot = 10.000; micro 0,01 lot = 1.000.", "Standard 1 lot = 100,000; mini 0.1 lot = 10,000; micro 0.01 lot = 1,000.")),
  q("l1-pip-value", tx("Berapa pip value 0,1 lot EUR/USD untuk akun USD?", "What is the pip value of 0.1 lot of EUR/USD in a USD account?"), [
    tx("$1 per pip", "$1 per pip"),
    tx("$10 per pip", "$10 per pip"),
    tx("$0,10 per pip", "$0.10 per pip"),
    tx("$100 per pip", "$100 per pip"),
  ], 0, tx("0,0001 × 10.000 unit = $1.", "0.0001 × 10,000 units = $1.")),
  q("l1-overlap", tx("Jendela waktu mana yang biasanya paling ramai (WIB)?", "Which window is usually the busiest (WIB)?"), [
    tx("Tumpang tindih London dan New York, sekitar 19.00–23.00", "The London–New York overlap, about 19:00–23:00"),
    tx("Sekitar 02.00–05.00", "About 02:00–05:00"),
    tx("Sesi Asia saja, sekitar 07.00–10.00", "Only the Asian session, about 07:00–10:00"),
    tx("Sabtu siang", "Saturday afternoon"),
  ], 0, tx("Saat London dan New York sama-sama buka, likuiditas dan volatilitas biasanya paling tinggi.", "When London and New York are both open, liquidity and volatility are usually highest.")),
  q("l1-dst", tx("Mengapa jam rilis data AS dalam WIB bisa bergeser satu jam?", "Why can US release times in WIB shift by an hour?"), [
    tx("AS memakai jam musim panas (DST), Indonesia tidak", "The US uses summer time (DST); Indonesia doesn't"),
    tx("Bank sentral mengganti jadwal setiap bulan", "The central bank changes the schedule every month"),
    tx("Karena spread melebar", "Because spreads widen"),
    tx("Karena pasar forex libur", "Because the forex market is closed"),
  ], 0, tx("Selisih jam WIB dengan New York berubah dua kali setahun.", "The gap between WIB and New York changes twice a year.")),
  {
    id: "l1-gen-pips",
    make: (random) => {
      const m = realMove(random)
      const right = m.pips
      const wrong = distractors(right, [right * 100, right / 100, right * 10, -right, right + (right >= 0 ? 7 : -7)], 1)
      return {
        prompt: fill(tx("Data historis nyata: {pair} bergerak dari {from} ke {to}. Berapa pergerakannya dalam pip?", "Real historical data: {pair} moved from {from} to {to}. How far is that in pips?"), {
          pair: tx(m.pair, m.pair),
          from: num(m.from, m.digits),
          to: num(m.to, m.digits),
        }),
        options: [right, ...wrong].map((v) => fill(tx("{v} pip", "{v} pips"), { v: num(v, 1) })),
        answer: 0,
        explain: fill(tx("({to} − {from}) ÷ {pip} = {r} pip.", "({to} − {from}) ÷ {pip} = {r} pips."), {
          to: num(m.to, m.digits),
          from: num(m.from, m.digits),
          pip: num(m.pip, m.digits - 1),
          r: num(right, 1),
        }),
      }
    },
  },
  {
    id: "l1-gen-profit",
    make: (random) => {
      const m = realMove(random, true)
      const lots = pick([0.1, 0.2, 0.5], random)
      const perPip = 10 * lots
      const right = Math.round(m.pips * perPip * 100) / 100
      const wrong = distractors(right, [right * 10, right / 10, -right, right * 2], 2)
      return {
        prompt: fill(tx("Data historis nyata: buy {pair} {lots} lot di {from}, ditutup di {to}. Berapa hasilnya untuk akun USD?", "Real historical data: buy {pair} {lots} lots at {from}, closed at {to}. What's the result for a USD account?"), {
          pair: tx(m.pair, m.pair),
          lots: num(lots, 1),
          from: num(m.from, m.digits),
          to: num(m.to, m.digits),
        }),
        options: [right, ...wrong].map((v) => fill(tx("${v}", "${v}"), { v: num(v, 2) })),
        answer: 0,
        explain: fill(tx("{p} pip × ${v} per pip ({lots} lot) = ${r}.", "{p} pips × ${v} per pip ({lots} lots) = ${r}."), {
          p: num(m.pips, 1),
          v: num(perPip, 2),
          lots: num(lots, 1),
          r: num(right, 2),
        }),
      }
    },
  },
]

export const LEVEL_2: BankEntry[] = [
  q("l2-ohlc", tx("Empat harga dalam satu candlestick adalah…", "The four prices in one candlestick are…"), [
    tx("Open, high, low, close", "Open, high, low, close"),
    tx("Bid, ask, spread, pip", "Bid, ask, spread, pip"),
    tx("Entry, stop loss, take profit, lot", "Entry, stop loss, take profit, lot"),
    tx("Open, close, volume, spread", "Open, close, volume, spread"),
  ], 0, tx("Setiap candle merangkum harga pembukaan, tertinggi, terendah, dan penutupan satu periode.", "Every candle sums up a period's opening, highest, lowest and closing prices.")),
  q("l2-green", tx("Pada candle berbadan hijau (bullish), di mana harga pembukaannya?", "On a green-bodied (bullish) candle, where is the opening price?"), [
    tx("Di bagian bawah badan", "At the bottom of the body"),
    tx("Di bagian atas badan", "At the top of the body"),
    tx("Di ujung bayangan atas", "At the tip of the upper shadow"),
    tx("Di ujung bayangan bawah", "At the tip of the lower shadow"),
  ], 0, tx("Close lebih tinggi dari open, jadi open di bawah dan close di atas.", "The close is above the open, so the open is at the bottom and the close at the top.")),
  q("l2-shadow", tx("Bayangan (ekor) pada candlestick menunjukkan…", "A candlestick's shadows (tails) show…"), [
    tx("Harga tertinggi dan terendah selama periode itu", "The highest and lowest prices during the period"),
    tx("Harga pembukaan dan penutupan", "The opening and closing prices"),
    tx("Besarnya spread", "The size of the spread"),
    tx("Volume transaksi", "The trading volume"),
  ], 0, tx("Upper shadow = high, lower shadow = low.", "Upper shadow = high, lower shadow = low.")),
  q("l2-doji", tx("Open dan close hampir sama, badan sangat kecil. Pola ini disebut … dan menandakan …", "Open and close almost equal, a tiny body. This pattern is called … and signals …"), [
    tx("Doji; ketidakpastian pasar", "A doji; market indecision"),
    tx("Marubozu; kekuatan besar", "A marubozu; great strength"),
    tx("Hammer; pembalikan pasti", "A hammer; a certain reversal"),
    tx("Engulfing; tren berlanjut", "An engulfing; the trend continues"),
  ], 0, tx("Doji terlihat seperti garis tipis dan menunjukkan ketidakpastian.", "A doji looks like a thin line and shows indecision.")),
  q("l2-hammer", tx("Tubuh kecil di atas dengan bayangan bawah panjang menunjukkan…", "A small body at the top with a long lower shadow suggests…"), [
    tx("Potensi pembalikan dari bearish ke bullish (hammer)", "A possible turn from bearish to bullish (hammer)"),
    tx("Potensi pembalikan dari bullish ke bearish (shooting star)", "A possible turn from bullish to bearish (shooting star)"),
    tx("Tren pasti berlanjut turun", "The downtrend will surely continue"),
    tx("Pasar sedang tutup", "The market is closed"),
  ], 0, tx("Hammer: potensi, bukan kepastian, pembalikan ke atas.", "Hammer: a possible, not certain, turn upwards.")),
  q("l2-h4", tx("Candle H4 merangkum berapa lama pergerakan harga?", "How long a stretch of price does an H4 candle sum up?"), [
    tx("4 jam", "4 hours"),
    tx("4 hari", "4 days"),
    tx("40 menit", "40 minutes"),
    tx("4 menit", "4 minutes"),
  ], 0, tx("Timeframe adalah lamanya waktu yang diwakili satu candle.", "A timeframe is the length of time one candle stands for.")),
  q("l2-noise", tx("Mana yang lebih banyak noise (gerakan acak jangka pendek)?", "Which has more noise (short-term random movement)?"), [
    tx("M5", "M5"),
    tx("H4", "H4"),
    tx("D1", "D1"),
    tx("Sama saja", "They're the same"),
  ], 0, tx("Timeframe kecil = banyak candle, banyak noise, sinyal sering palsu.", "Small timeframe = many candles, lots of noise, often false signals.")),
  q("l2-mtf-conflict", tx("H4 sedang turun, tetapi M15 memberi sinyal beli. Sebaiknya?", "H4 is falling but M15 gives a buy signal. What should you do?"), [
    tx("Prioritaskan H4: anggap pullback kecil atau lewati", "Give H4 priority: treat it as a small pullback or skip it"),
    tx("Buy dengan lot besar karena M15 lebih cepat", "Buy with a big lot because M15 is faster"),
    tx("Ganti ke M1 sampai sinyalnya cocok", "Switch to M1 until the signals match"),
    tx("Selalu ikuti timeframe terkecil", "Always follow the smallest timeframe"),
  ], 0, tx("Kalau dua timeframe bertentangan, timeframe besar menang.", "When two timeframes disagree, the larger one wins.")),
  q("l2-uptrend", tx("Ciri tren naik adalah…", "An uptrend is marked by…"), [
    tx("Higher high dan higher low berurutan", "Higher highs and higher lows in sequence"),
    tx("Lower high dan lower low", "Lower highs and lower lows"),
    tx("Puncak dan lembah di level yang sama", "Peaks and troughs at the same level"),
    tx("Satu candle hijau yang panjang", "One long green candle"),
  ], 0, tx("Tren naik = HH + HL; tren turun = LH + LL; sideways = mendatar.", "Uptrend = HH + HL; downtrend = LH + LL; sideways = flat.")),
  q("l2-trend-broken", tx("Kapan tren naik dianggap rusak?", "When is an uptrend taken to be broken?"), [
    tx("Saat harga menutup di bawah higher low terakhir", "When price closes below the last higher low"),
    tx("Saat ada satu candle merah", "When one red candle appears"),
    tx("Saat bayangan menyentuh higher low", "When a shadow touches the higher low"),
    tx("Setiap hari Jumat", "Every Friday"),
  ], 0, tx("Gunakan harga penutupan (close) sebagai penentu, bukan sekadar sentuhan bayangan.", "Use the close as the deciding factor, not just a shadow's touch.")),
  q("l2-support", tx("Support adalah…", "Support is…"), [
    tx("Area di bawah harga tempat pembeli cukup kuat menahan penurunan", "An area below price where buyers are strong enough to hold back a fall"),
    tx("Area di atas harga tempat penjual menahan kenaikan", "An area above price where sellers hold back a rise"),
    tx("Harga tertinggi hari ini", "Today's highest price"),
    tx("Garis rata-rata harga", "An average price line"),
  ], 0, tx("Support = lantai, resistance = langit-langit.", "Support = floor, resistance = ceiling.")),
  q("l2-zone", tx("Mengapa support dan resistance lebih baik digambar sebagai zona daripada garis tipis?", "Why draw support and resistance as zones rather than thin lines?"), [
    tx("Harga sering menembus sedikit lewat bayangan lalu berbalik", "Price often pokes through a little with a shadow and then turns"),
    tx("Supaya chart terlihat penuh", "So the chart looks full"),
    tx("Karena garis tipis tidak bisa digambar", "Because thin lines can't be drawn"),
    tx("Karena zona menjamin harga berbalik", "Because a zone guarantees a reversal"),
  ], 0, tx("Zona mencakup bayangan sampai badan candle yang menyentuh area.", "A zone covers from the shadows to the bodies of the candles that touch the area.")),
  q("l2-role-reversal", tx("Resistance yang tertembus lalu harga bertahan di atasnya sering berubah menjadi…", "Broken resistance, with price holding above it, often becomes…"), [
    tx("Support (role reversal)", "Support (role reversal)"),
    tx("Resistance yang lebih kuat", "Stronger resistance"),
    tx("Tidak berarti apa-apa", "Meaningless"),
    tx("Stop loss otomatis", "An automatic stop loss"),
  ], 0, tx("Peran level berbalik: resistance jadi support, support yang jebol jadi resistance.", "The level's role flips: resistance becomes support, broken support becomes resistance.")),
  q("l2-sl-support", tx("Untuk buy di area support, stop loss sebaiknya diletakkan…", "For a buy at support, the stop loss should go…"), [
    tx("Sedikit di bawah zona support", "A little below the support zone"),
    tx("Tepat di tengah zona", "Right in the middle of the zone"),
    tx("Di atas harga entry", "Above the entry price"),
    tx("Tidak perlu stop loss", "No stop loss is needed"),
  ], 0, tx("Kalau harga menutup di bawah zona, alasan analisis sudah gugur.", "If price closes below the zone, the reason for the trade is gone.")),
  q("l2-swing", tx("Dengan aturan n = 2, sebuah swing high adalah candle yang…", "With the n = 2 rule, a swing high is a candle whose…"), [
    tx("High-nya lebih tinggi dari 2 candle sebelum dan 2 candle sesudahnya", "High is above the 2 candles before and the 2 candles after it"),
    tx("Close-nya paling tinggi hari itu", "Close is the day's highest"),
    tx("Badannya paling panjang", "Body is the longest"),
    tx("Muncul setiap 2 jam", "Appears every 2 hours"),
  ], 0, tx("Karena butuh n candle sesudahnya, swing baru bisa dipastikan belakangan.", "Because it needs n candles after it, a swing can only be confirmed later.")),
  q("l2-choch", tx("Pada uptrend, harga menutup di bawah higher low terakhir. Itu disebut…", "In an uptrend, price closes below the last higher low. That's called…"), [
    tx("CHoCH: peringatan pertama tren mungkin berbalik", "CHoCH: the first warning the trend may reverse"),
    tx("BOS: tren pasti berlanjut", "BOS: the trend will surely continue"),
    tx("Double top", "A double top"),
    tx("Sinyal jual pasti", "A sure sell signal"),
  ], 0, tx("CHoCH adalah peringatan, bukan perintah jual; tunggu konfirmasi struktur.", "CHoCH is a warning, not an order to sell; wait for the structure to confirm.")),
]

export const LEVEL_3: BankEntry[] = [
  q("l3-two-decisions", tx("Menurut materi, apa dua keputusan yang sering dicampur aduk?", "Which two decisions does the lesson say often get mixed up?"), [
    tx("Strategi (kapan masuk/keluar) dan perlindungan modal (berapa yang boleh hilang)", "Strategy (when to enter/exit) and protecting capital (how much may be lost)"),
    tx("Memilih pair dan memilih warna chart", "Choosing a pair and choosing chart colours"),
    tx("Buy dan sell", "Buy and sell"),
    tx("Spread dan swap", "Spread and swap"),
  ], 0, tx("Strategi itu mesin; perlindungan modal itu rem dan sabuk pengaman.", "Strategy is the engine; protecting capital is the brakes and seat belt.")),
  q("l3-small-bets", tx("Strategi rata-ratanya rugi. Apakah taruhan kecil membuatnya aman?", "A strategy loses on average. Do small bets make it safe?"), [
    tx("Tidak, kerugian hanya datang lebih lambat", "No, the loss only arrives more slowly"),
    tx("Ya, taruhan kecil selalu aman", "Yes, small bets are always safe"),
    tx("Ya, asal leverage tinggi", "Yes, as long as leverage is high"),
    tx("Ya, rata-ratanya berubah jadi positif", "Yes, the average turns positive"),
  ], 0, tx("Rata-rata negatif tidak berubah menjadi positif hanya karena taruhan kecil.", "A negative average doesn't turn positive just because bets are small.")),
  q("l3-leverage-pip", tx("Apakah leverage yang lebih tinggi menambah untung atau rugi per pip?", "Does higher leverage increase the profit or loss per pip?"), [
    tx("Tidak; yang menentukan hanya ukuran lot", "No; only the lot size does"),
    tx("Ya, leverage 1:500 berarti untung 500 kali", "Yes, 1:500 leverage means 500 times the profit"),
    tx("Ya, tetapi hanya untuk pair JPY", "Yes, but only for JPY pairs"),
    tx("Ya, setiap kali harga naik", "Yes, whenever price rises"),
  ], 0, tx("Leverage menurunkan jaminan yang dibutuhkan, bukan mengubah nilai per pip.", "Leverage lowers the deposit needed; it doesn't change the value per pip.")),
  q("l3-margin-fee", tx("Margin adalah…", "Margin is…"), [
    tx("Uang jaminan yang dikunci selama posisi terbuka, bukan biaya", "A deposit locked while the position is open, not a fee"),
    tx("Biaya yang dibayar ke broker setiap transaksi", "A fee paid to the broker on every trade"),
    tx("Jumlah maksimum yang bisa hilang", "The most you can lose"),
    tx("Keuntungan dari spread", "The profit from the spread"),
  ], 0, tx("Margin dikembalikan ke saldo ketika posisi ditutup.", "Margin returns to the balance when the position closes.")),
  q("l3-equity", tx("Balance $1.000 dan floating P/L −$200. Berapa equity?", "Balance $1,000 and floating P/L −$200. What's the equity?"), [
    tx("$800", "$800"),
    tx("$1.200", "$1,200"),
    tx("$1.000", "$1,000"),
    tx("$200", "$200"),
  ], 0, tx("Equity = balance + floating P/L.", "Equity = balance + floating P/L.")),
  q("l3-margin-level", tx("Equity $800 dan used margin $400. Berapa margin level?", "Equity $800 and used margin $400. What's the margin level?"), [
    tx("200%", "200%"),
    tx("50%", "50%"),
    tx("400%", "400%"),
    tx("120%", "120%"),
  ], 0, tx("Margin level = equity ÷ used margin × 100%.", "Margin level = equity ÷ used margin × 100%.")),
  q("l3-stop-out", tx("Apa beda stop loss dan stop out?", "What's the difference between a stop loss and a stop out?"), [
    tx("Stop loss keputusanmu; stop out penutupan paksa oleh broker", "A stop loss is your decision; a stop out is the broker forcing a close"),
    tx("Keduanya sama", "They're the same"),
    tx("Stop out selalu lebih menguntungkan", "A stop out is always better"),
    tx("Stop loss dipasang oleh broker", "The broker sets the stop loss"),
  ], 0, tx("Idealnya stop loss sudah menutup posisi jauh sebelum stop out.", "Ideally the stop loss closes the position long before a stop out.")),
  q("l3-sl-move", tx("Harga mendekati stop loss. Apa yang tidak boleh dilakukan?", "Price nears your stop loss. What must you not do?"), [
    tx("Menggeser stop loss menjauh agar tidak kena", "Move the stop loss further away so it isn't hit"),
    tx("Membiarkan stop loss di tempatnya", "Leave the stop loss where it is"),
    tx("Mencatat transaksi di jurnal", "Record the trade in the journal"),
    tx("Menunggu hasilnya", "Wait for the result"),
  ], 0, tx("Menggeser stop loss menjauh sama dengan menghapus batas kerugian.", "Moving the stop away is the same as deleting the loss limit.")),
  q("l3-sl-from", tx("Stop loss sebaiknya ditentukan oleh…", "The stop loss should be set by…"), [
    tx("Analisis: di mana alasan masukmu terbukti salah", "Analysis: where your reason for entering is proven wrong"),
    tx("Jumlah uang yang ingin kamu relakan", "The amount of money you'd like to give up"),
    tx("Angka bulat favorit", "Your favourite round number"),
    tx("Ukuran lot yang sudah dipilih", "The lot size you already chose"),
  ], 0, tx("Urutannya: analisis → SL → lot → TP.", "The order: analysis → SL → lot → TP.")),
  q("l3-breakeven", tx("Kapan stop loss digeser ke harga entry (break-even) menurut contoh materi?", "When is the stop loss moved to entry (break-even) in the lesson's example?"), [
    tx("Setelah posisi untung sejauh 1 kali risikonya (+1R)", "Once the position is up by 1 times its risk (+1R)"),
    tx("Segera setelah posisi dibuka", "Right after opening"),
    tx("Setelah posisi rugi 1R", "After the position loses 1R"),
    tx("Tidak pernah", "Never"),
  ], 0, tx("Setelah +1R, SL ke entry; kalau harga berbalik, keluar tanpa rugi selain biaya.", "After +1R, the SL goes to entry; if price turns, you exit without a loss apart from costs.")),
  q("l3-expectancy", tx("Win rate 60% dengan RR 1:0,5 (menang 0,5R, kalah 1R). Apa yang terjadi dalam jangka panjang?", "A 60% win rate with RR 1:0.5 (wins 0.5R, losses 1R). What happens in the long run?"), [
    tx("Merugi: ekspektasi −0,10R meski sering menang", "Losing: expectancy −0.10R despite winning often"),
    tx("Untung besar karena sering menang", "Big profits because it wins often"),
    tx("Impas tepat", "Exactly break-even"),
    tx("Tidak bisa dihitung", "It can't be calculated"),
  ], 0, tx("0,60 × 0,5 − 0,40 × 1 = −0,10R.", "0.60 × 0.5 − 0.40 × 1 = −0.10R.")),
  q("l3-round-down", tx("Hasil hitungan lot 0,075. Lot yang dipakai…", "The lot works out at 0.075. You use…"), [
    tx("0,07: dibulatkan ke bawah", "0.07: rounded down"),
    tx("0,08: dibulatkan ke atas", "0.08: rounded up"),
    tx("0,1: dibulatkan ke lot mini", "0.1: rounded to a mini lot"),
    tx("1: dibulatkan ke lot standar", "1: rounded to a standard lot"),
  ], 0, tx("Pembulatan ke bawah supaya risiko sebenarnya tidak melampaui batas.", "Round down so the real risk never goes over the limit.")),
  q("l3-dd-define", tx("Ekuitas naik ke 12.000 lalu turun ke 9.000. Berapa drawdown-nya?", "Equity rises to 12,000 then falls to 9,000. What's the drawdown?"), [
    tx("25%", "25%"),
    tx("33%", "33%"),
    tx("3.000%", "3,000%"),
    tx("75%", "75%"),
  ], 0, tx("Drawdown diukur dari puncak: 3.000 ÷ 12.000 = 25%.", "Drawdown is measured from the peak: 3,000 ÷ 12,000 = 25%.")),
  q("l3-dd-recover", tx("Modal turun 50%. Berapa kenaikan yang dibutuhkan untuk kembali ke titik awal?", "Capital falls 50%. What rise is needed to get back to where you started?"), [
    tx("100%", "100%"),
    tx("50%", "50%"),
    tx("25%", "25%"),
    tx("150%", "150%"),
  ], 0, tx("Setelah turun, dasar perhitungan mengecil, jadi kenaikan yang dibutuhkan lebih besar.", "After a fall the base is smaller, so the rise needed is bigger.")),
  q("l3-dd-reduce", tx("Cara mengurangi drawdown menurut materi adalah membatasi risiko per transaksi sekitar…", "To reduce drawdown, the lesson suggests limiting the risk per trade to about…"), [
    tx("1% sampai 2% dari ekuitas", "1% to 2% of equity"),
    tx("10% sampai 20% dari ekuitas", "10% to 20% of equity"),
    tx("50% dari ekuitas", "50% of equity"),
    tx("Seluruh ekuitas", "All of the equity"),
  ], 0, tx("Dengan begitu kerugian beruntun tidak langsung menguras modal utama.", "That way a run of losses doesn't drain the main capital at once.")),
  {
    id: "l3-gen-lot",
    make: (random) => {
      const account = pick([1000, 2000, 5000, 10000], random)
      const riskPct = pick([0.5, 1, 2], random)
      const sl = pick([20, 25, 40, 50], random)
      const risk = (account * riskPct) / 100
      const right = Math.floor((risk / (sl * 10)) * 100) / 100
      const wrong = distractors(right, [right * 10, right / 10 >= 0.01 ? Math.floor(right * 10) / 100 : right + 0.03, right + 0.05, right * 2], 2)
      return {
        prompt: fill(tx("Akun ${a}, risiko {p}% per transaksi, stop loss {sl} pip pada EUR/USD (pip value 1 lot = $10). Berapa lot (dibulatkan ke bawah)?", "A ${a} account, {p}% risk per trade, a {sl}-pip stop loss on EUR/USD (1 lot = $10 per pip). How many lots (rounded down)?"), {
          a: num(account, 0),
          p: num(riskPct, riskPct % 1 ? 1 : 0),
          sl: num(sl, 0),
        }),
        options: [right, ...wrong].map((v) => fill(tx("{v} lot", "{v} lots"), { v: num(v, 2) })),
        answer: 0,
        explain: fill(tx("Risiko ${r} ÷ ({sl} × $10) = {v} lot.", "Risk ${r} ÷ ({sl} × $10) = {v} lots."), { r: num(risk, 2), sl: num(sl, 0), v: num(right, 2) }),
      }
    },
  },
  {
    id: "l3-gen-breakeven",
    make: (random) => {
      const rr = pick([1, 1.5, 2, 3, 4], random)
      const right = 100 / (1 + rr)
      const wrong = distractors(right, [100 * rr / (1 + rr), 100 / rr, 50, 100 - 100 / (1 + rr) + 5], 1)
      return {
        prompt: fill(tx("Rencana dengan RRR 1:{rr}. Berapa win rate impasnya (sebelum biaya)?", "A plan with a 1:{rr} RRR. What's its break-even win rate (before costs)?"), { rr: num(rr, rr % 1 ? 1 : 0) }),
        options: [right, ...wrong].map((v) => fill(tx("{v}%", "{v}%"), { v: num(v, 1) })),
        answer: 0,
        explain: fill(tx("Win rate impas = 1 ÷ (1 + {rr}) = {v}%.", "Break-even win rate = 1 ÷ (1 + {rr}) = {v}%."), { rr: num(rr, rr % 1 ? 1 : 0), v: num(right, 1) }),
      }
    },
  },
  {
    id: "l3-gen-margin",
    make: (random) => {
      const value = pick([50000, 100000, 108500, 120000], random)
      const lev = pick([30, 50, 100, 200, 500], random)
      const right = value / lev
      const wrong = distractors(right, [value * lev, value / (lev / 10), right * 2, value / 1000], 2)
      return {
        prompt: fill(tx("Posisi senilai ${v} dengan leverage 1:{l}. Berapa margin yang dikunci?", "A position worth ${v} with 1:{l} leverage. How much margin is locked?"), { v: num(value, 0), l: num(lev, 0) }),
        options: [right, ...wrong].map((v) => fill(tx("${v}", "${v}"), { v: num(v, 2) })),
        answer: 0,
        explain: fill(tx("Margin = nilai posisi ÷ leverage = ${v} ÷ {l} = ${r}.", "Margin = position value ÷ leverage = ${v} ÷ {l} = ${r}."), { v: num(value, 0), l: num(lev, 0), r: num(right, 2) }),
      }
    },
  },
]
