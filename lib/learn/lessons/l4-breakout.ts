import type { Lesson } from "@/lib/learn/types"
import { tx } from "@/lib/learn/lessons/tx"

// From "09_Breakout_dan_False_Breakout.pdf". Left out for beginners: the two
// entry plans, trading against a failed breakout, staged position
// management, the hypothetical journal table, the case study and the FAQ.

export const breakout: Lesson = {
  slug: "breakout",
  level: 4,
  minutes: 7,
  title: tx("Breakout dan false breakout", "Breakouts and false breakouts"),
  summary: tx(
    "Kapan harga benar-benar menembus level, kapan hanya \"pura-pura\" menembus, dan bagaimana membedakan keduanya.",
    "When price really breaks a level, when it only \"pretends\" to, and how to tell the two apart.",
  ),
  material: ["09_Breakout_dan_False_Breakout.pdf"],
  blocks: [
    { kind: "heading", text: tx("Pintu yang terbuka, atau pintu yang hanya diketuk?", "An open door, or a door that's only knocked on?") },
    {
      kind: "p",
      text: tx(
        "Harga sering berdiam di dalam sebuah ruangan: batas bawahnya support, batas atasnya resistance. Suatu saat harga mendekati pintu keluar. Kadang pintu benar-benar terbuka dan harga berlari ke ruangan berikutnya. Kadang harga hanya mengetuk, melongok sebentar, lalu mundur lagi ke dalam. Yang pertama disebut breakout. Yang kedua disebut false breakout (penembusan palsu), kadang juga dipanggil fakeout, bull trap atau bear trap.",
        "Price often stays inside a room: the floor is support, the ceiling is resistance. At some point price approaches the exit. Sometimes the door really opens and price runs into the next room. Sometimes it only knocks, peeks out, then steps back inside. The first is called a breakout. The second is a false breakout, sometimes also called a fakeout, a bull trap or a bear trap.",
      ),
    },
    {
      kind: "callout",
      tone: "definition",
      title: tx("Breakout dan false breakout", "Breakout and false breakout"),
      text: tx(
        "Breakout: harga menutup di luar level support/resistance (atau garis tren, atau batas pola) dan bertahan di sana sehingga arah baru terbentuk. False breakout: harga menembus level (biasanya hanya lewat bayangan atau sebentar), lalu kembali masuk ke dalam range, sehingga penembusan itu tidak menghasilkan kelanjutan.",
        "Breakout: price closes outside a support/resistance level (or a trendline, or a pattern's boundary) and stays there, so a new direction forms. False breakout: price pierces the level (usually only with a shadow, or briefly), then goes back into the range, so the break leads nowhere.",
      ),
    },
    {
      kind: "chart",
      pick: "sideways",
      caption: tx(
        "Data historis nyata: harga di dalam range. Batas atas dan bawahnya adalah level yang suatu saat bisa ditembus atau hanya disapu.",
        "Real historical data: price inside a range. Its upper and lower edges are the levels that may later be broken, or only swept.",
      ),
    },

    { kind: "heading", text: tx("Mengapa false breakout bisa terjadi", "Why false breakouts happen") },
    {
      kind: "points",
      items: [
        tx("Penumpukan stop order di atas resistance. Penjual menaruh stop loss tepat di atasnya, dan trader breakout menaruh buy stop di sana juga.", "Stop orders pile up above resistance. Sellers put their stop losses just above it, and breakout traders put buy stops there too."),
        tx("Berita dan lonjakan sesaat. Rilis data bisa membuat harga melonjak lewat level, lalu normal kembali dalam menit.", "News and brief spikes. A data release can push price through a level, then it settles back within minutes."),
        tx("Likuiditas rendah. Pada jam sepi, sedikit order saja bisa menggeser harga lewat level tanpa dukungan nyata.", "Low liquidity. In quiet hours, a few orders can move price through a level without real support."),
        tx("Memang bukan breakout. Beberapa level hanya terlalu kuat; pasar sekadar menolak level tersebut.", "It simply wasn't a breakout. Some levels are just too strong; the market rejects them."),
      ],
    },

    { kind: "heading", text: tx("Ciri breakout yang lebih meyakinkan", "Signs of a more convincing breakout") },
    {
      kind: "table",
      head: [tx("Ciri", "Feature"), tx("Cenderung breakout valid", "Leans towards a valid breakout"), tx("Cenderung false breakout", "Leans towards a false breakout")],
      rows: [
        [tx("Penutupan", "The close"), tx("Close jelas di luar level (plus buffer)", "A clear close outside the level (plus a buffer)"), tx("Hanya bayangan yang tembus; close kembali di dalam", "Only the shadow breaks; the close is back inside")],
        [tx("Kualitas candle", "Candle quality"), tx("Badan besar, close dekat ujung", "A large body, a close near the end"), tx("Bayangan panjang, badan kecil, close jauh dari ujung", "A long shadow, a small body, a close far from the end")],
        [tx("Kelanjutan", "Follow-through"), tx("Candle berikutnya bertahan di luar atau lanjut searah", "The next candle holds outside or continues"), tx("Candle berikutnya langsung berbalik masuk", "The next candle turns straight back inside")],
        [tx("Konteks tren", "Trend context"), tx("Searah tren timeframe besar", "With the larger timeframe's trend"), tx("Melawan tren timeframe besar", "Against the larger timeframe's trend")],
        [tx("Waktu", "Timing"), tx("Saat sesi ramai (London, New York)", "During busy sessions (London, New York)"), tx("Saat pasar sepi atau tepat di detik rilis berita", "In a quiet market or right as news is released")],
      ],
    },
    {
      kind: "callout",
      tone: "definition",
      title: tx("Posisi close (close position)", "Close position"),
      text: tx(
        "Posisi close = (close − low) ÷ (high − low). Nilainya 0 sampai 1. Untuk breakout naik, nilai mendekati 1 berarti pembeli menguasai penutupan. Nilai mendekati 0 berarti candle ditolak ke bawah.",
        "Close position = (close − low) ÷ (high − low). It runs from 0 to 1. For an upward breakout, a value near 1 means buyers controlled the close. A value near 0 means the candle was rejected downwards.",
      ),
    },
    {
      kind: "calc",
      title: tx("Dua candle yang sama-sama menembus 1,0900", "Two candles that both pierce 1.0900"),
      lines: [
        tx("Candle X: O 1,0895 | H 1,0925 | L 1,0890 | C 1,0920 → posisi close = 0,0030 ÷ 0,0035 = 0,86 → candle kuat", "Candle X: O 1.0895 | H 1.0925 | L 1.0890 | C 1.0920 → close position = 0.0030 ÷ 0.0035 = 0.86 → a strong candle"),
        tx("Candle Y: O 1,0897 | H 1,0925 | L 1,0885 | C 1,0893 → posisi close = 0,0008 ÷ 0,0040 = 0,20 → candle ditolak", "Candle Y: O 1.0897 | H 1.0925 | L 1.0885 | C 1.0893 → close position = 0.0008 ÷ 0.0040 = 0.20 → a rejected candle"),
      ],
      note: tx(
        "Keduanya menembus 1,0900, tetapi X menutup di dekat high (pembeli menang), Y menutup di dekat low (pembeli ditolak). X layak dicurigai sebagai breakout; Y mengisyaratkan sapuan.",
        "Both pierce 1.0900, but X closes near its high (buyers won) while Y closes near its low (buyers were rejected). X is a breakout candidate; Y hints at a sweep.",
      ),
    },

    { kind: "heading", text: tx("Aturan konfirmasi: tiga pilihan", "Confirmation rules: three choices") },
    {
      kind: "table",
      head: [tx("Aturan", "Rule"), tx("Cara kerja", "How it works"), tx("Kelebihan", "Strength"), tx("Kekurangan", "Weakness")],
      rows: [
        [tx("A. Bayangan menembus", "A. Shadow breaks"), tx("Sinyal begitu harga menyentuh di luar level", "Signal as soon as price touches outside the level"), tx("Cepat, entry dekat level", "Fast, entry near the level"), tx("Sangat banyak sinyal palsu", "A great many false signals")],
        [tx("B. Close + buffer", "B. Close + buffer"), tx("Close harus melewati level + ½ ATR", "The close must pass the level + ½ ATR"), tx("Menyaring sapuan kecil", "Filters out small sweeps"), tx("Entry lebih jauh dari level", "Entry further from the level")],
        [tx("C. Dua close berturut-turut", "C. Two closes in a row"), tx("Dua candle menutup di luar level", "Two candles close outside the level"), tx("Lebih kuat lagi", "Stronger still"), tx("Entry makin terlambat", "Entry comes even later")],
      ],
      note: tx(
        "Semakin ketat aturan, semakin sedikit sinyal. Tidak ada aturan terbaik universal; pilih keseimbangan antara jumlah peluang dan kualitasnya, lalu uji dengan datamu sendiri.",
        "The stricter the rule, the fewer the signals. There is no universal best rule; choose a balance between the number of chances and their quality, then test it with your own data.",
      ),
    },
    {
      kind: "p",
      text: tx(
        "Pada range setinggi 100 pip, ada teknik sederhana yang disebut measured move: target kasar = level yang ditembus + tinggi range. Misalnya range 1,0800–1,0900 yang ditembus ke atas: 1,0900 + 100 pip = 1,1000. Ini bukan prediksi, tetapi acuan awal untuk menilai apakah rasio risiko-imbalan masuk akal.",
        "For a range 100 pips tall there is a simple technique called the measured move: rough target = the level broken + the height of the range. For example a 1.0800–1.0900 range broken upwards: 1.0900 + 100 pips = 1.1000. It is not a prediction, only a starting point to judge whether the risk-reward ratio makes sense.",
      ),
    },
    {
      kind: "points",
      title: tx("Kesalahan umum", "Common mistakes"),
      items: [
        tx("Entry saat bayangan masih berjalan. Tunggu candle selesai.", "Entering while the shadow is still forming. Wait for the candle to finish."),
        tx("Mengabaikan timeframe besar. Breakout M15 yang menabrak resistance H4 jauh lebih rapuh.", "Ignoring the larger timeframe. An M15 breakout running into H4 resistance is far more fragile."),
        tx("Mengejar candle besar. Entry di ujung candle besar membuat SL jauh dan RR buruk.", "Chasing a big candle. Entering at the end of a big candle makes the SL far and the RR poor."),
        tx("Trading breakout tepat saat berita besar. Spread melebar dan lonjakan palsu sering terjadi.", "Trading a breakout right on big news. Spreads widen and false spikes are common."),
        tx("Mengubah aturan di tengah transaksi. Jika close sudah kembali ke dalam range, keluar sesuai rencana; jangan berharap.", "Changing the rules mid-trade. If the close is back inside the range, exit as planned; don't hope."),
      ],
    },
    {
      kind: "callout",
      tone: "tip",
      title: tx("Tidak entry juga boleh", "Not entering is fine too"),
      text: tx(
        "Melewatkan breakout yang kualitasnya meragukan adalah bagian dari disiplin.",
        "Skipping a breakout of doubtful quality is part of discipline.",
      ),
    },
    {
      kind: "check",
      items: [
        { q: tx("Beda breakout dan false breakout?", "The difference between a breakout and a false breakout?"), a: tx("Breakout: close di luar level dan bertahan. False breakout: menembus lalu kembali ke dalam range.", "Breakout: a close outside the level that holds. False breakout: it pierces, then goes back into the range.") },
        { q: tx("Candle: O 1,0890 H 1,0930 L 1,0885 C 1,0925. Posisi close?", "Candle: O 1.0890 H 1.0930 L 1.0885 C 1.0925. Close position?"), a: tx("0,0040 ÷ 0,0045 = 0,89.", "0.0040 ÷ 0.0045 = 0.89.") },
        { q: tx("Range 1,0800–1,0900. Target measured move setelah breakout naik?", "Range 1.0800–1.0900. Measured-move target after an upward breakout?"), a: tx("1,0900 + 100 pip = 1,1000.", "1.0900 + 100 pips = 1.1000.") },
        { q: tx("Apa itu bear trap?", "What is a bear trap?"), a: tx("Penembusan palsu ke bawah support yang menjebak penjual.", "A false break below support that traps sellers.") },
      ],
    },
  ],
  sources: [
    { title: "How to Distinguish a Real Breakout from a False One", publisher: "investingLive" },
    { title: "What Is a False Breakout and How Can You Avoid It", publisher: "IG", url: "https://www.ig.com/au/trading-strategies/what-is-a-false-breakout-and-how-can-you-avoid-it--230130" },
    { title: "False Breakouts", publisher: "DailyForex" },
  ],
}
