# Paket asesmen pilot P-01 s.d. P-05: laporan

Lima paket, masing-masing 35 butir: 10 skenario chart, 10 pilihan ganda kompleks, 15 pilihan ganda dasar. Semua teks dua bahasa (`{ "id", "en" }`). Tidak ada kode web yang diubah; semua ada di folder `assessment/`.

## Isi folder

| Path | Isi |
|---|---|
| `src/P-0X.mjs` | Sumber yang ditulis tangan: skenario (pair, timeframe, waktu mulai, saldo, briefing, keputusan ideal, klaim yang harus dicek) dan soal pilihan ganda |
| `src/common.mjs` | Mekanik simulasi, daftar alasan, alasan menutup posisi, rubrik 100 poin |
| `packages/P-0X.json` | Yang boleh dikirim ke browser: soal, opsi (sudah diacak), briefing, referensi jendela data. **Tanpa** kunci, rubrik, atau arah harga |
| `keys/P-0X.keys.json` | Hanya server: kunci, penjelasan per opsi, keputusan ideal, angka acuan (ATR, SL struktur, lot pada 1–2%), umpan balik per aspek, hasil verifikasi data |
| `scripts/build.mjs` | Membangun `packages/` dan `keys/` dari `src/`, menghitung semua angka dari CSV |
| `scripts/validate.mjs` | Validasi (lihat di bawah) |

Menjalankan: `node assessment/scripts/build.mjs` lalu `node assessment/scripts/validate.mjs`. Data dibaca dari `../DATA FOR LIVE` atau dari env `DATA_FOR_LIVE`.

## Hasil validasi

`validate.mjs` lolos tanpa kegagalan. Yang dicek:

- jumlah butir dan sebaran level (kompleks L3:3, L4:2, L5:3, L6:2; dasar L1:3, L2:3, L3:3, L4:2, L5:2, L6:2), 4–6 opsi dengan ≥2 benar, 4 opsi dengan 1 benar, posisi jawaban benar tersebar;
- setiap teks tepat `{id, en}`, angka di kedua bahasa sama;
- tidak ada field kunci di file paket; setiap butir punya kunci, dan sebaliknya;
- `source` setiap soal pilihan ganda adalah slug pelajaran Learn 101 yang ada, di level yang sama;
- jendela skenario: pair yang diizinkan saja, 100 candle konteks, 100–200 candle main, tidak ada penutupan pasar (gap ≥6 jam) di bagian main, tidak melewati Maret 2022, tidak tumpang tindih antar paket pada pair yang sama;
- tren konteks yang dihitung ulang dari CSV sama dengan yang dimaksud skenario, BUY hanya di tren naik dan SELL di tren turun, SL struktur 1–3× ATR, zona pending masuk akal;
- setiap klaim di briefing dicek ulang ke CSV; event tidak boleh dipakai ulang; ≥3 event nyata, ≥2 NO TRADE, ada market dan pending di setiap paket; saldo bervariasi;
- soal mirip antar paket (kemiripan kata ≥0,6 gagal, ≥0,45 peringatan).

Hasil terakhir: **All checks passed, 10 peringatan.** Peringatannya untuk ditinjau manusia, bukan kegagalan:

- P-01-S07 dan P-03-S03: tidak ada swing yang jelas di dekat entry, jadi SL acuannya 1,5× ATR, bukan level struktur.
- 8 pasang soal bertopik sama tetapi dengan angka atau pertanyaan berbeda (kemiripan kata 0,45–0,54), misalnya P-01-B08 (berapa lot) dan P-03-C01 (pernyataan tentang lot pada risiko 0,5%), P-01-B13 dan P-03-B12 (konversi jam New York ke WIB, EDT lawan EST), P-03-B01 dan P-04-C06 (mata uang komoditas). Dua pasang yang benar-benar mirip (win rate impas, nilai pip) sudah diganti.

## Asumsi

1. **Data**: hanya EURUSD, USDJPY, AUDUSD, GBPUSD, USDCAD, EURJPY dari folder "DATA FOR LIVE" (ekspor MT4, jam broker GMT+1/+2 sebelum 22 Nov 2014, GMT+2/+3 sesudahnya; konversi ke UTC memakai fungsi yang sama dengan `scripts/build-live-data.mjs`). Data berakhir 4 Maret 2022.
2. **Timeframe**: M15, M30 dan H1. H4 tidak dipakai karena 100 candle H4 setelah "Mulai" pasti melewati akhir pekan.
3. **Jendela**: hanya bagian setelah "Mulai" yang dijaga tidak melewati Jumat malam; 100 candle konteks boleh mencakup akhir pekan, karena itu hanya riwayat yang dilihat.
4. **Akun**: USD, lot minimum dan langkah 0,01. Nilai pip dihitung dari harga di candle "Mulai" (EURJPY lewat USDJPY).
5. **Rubrik** (skenario trading, 100): risiko 25 (ideal 1–2%), SL 25 (12,5 risiko %, 12,5 jarak terhadap ATR, ideal 1–3× ATR atau di balik struktur), TP/RR 15 (≥1:1,5), keputusan 20, manajemen 15. Skenario NO TRADE: 100% keputusan dan alasan. Pilihan ganda kompleks dinilai per opsi (+1/k untuk opsi benar yang dipilih, −1/k untuk opsi salah yang dipilih, minimal 0).
6. **Proses, bukan hasil**: tidak ada field rubrik yang membaca harga setelah "Mulai". Arah sebenarnya hanya muncul setelah review, sebagai satu sampel.
7. **SL struktur** = swing terakhir yang relevan ± 0,5 ATR. Skenario yang SL strukturnya di luar 1–3× ATR dipindah ke jendela lain atau diubah menjadi pending order.
8. **Briefing skenario biasa** memberi konteks makro umum (misalnya kebijakan bank sentral saat itu) dari pengetahuan sejarah. Yang dicek ke data hanya klaim yang bisa diukur: arah harga beberapa hari sebelum "Mulai" (drift) dan lonjakan pada jadwal rilis (spike).
9. **Verifikasi event**: range M15 dalam jendela event (15 menit sebelum sampai 120/180 menit sesudah) dibandingkan dengan rata-rata jendela yang sama panjang selama 14 hari sebelumnya; lolos jika ≥2,5×.
10. `show_risk: true` di setiap paket, sebagai field supaya paket berikutnya (misalnya P-15) bisa mematikannya.

## Event nyata dan verifikasinya

| Skenario | Event | Pair | Hasil di data |
|---|---|---|---|
| P-01-S01 | Hasil referendum Brexit | GBPUSD | 2016-06-24 00:00 UTC: 1126,9 pip vs 77,8 biasa, ×14,49 |
| P-01-S02 | ECB mengumumkan QE | EURUSD | 2015-01-22 13:30 UTC: 225,6 vs 40,9, ×5,52 |
| P-01-S03 | OPEC tidak memangkas produksi | USDCAD | 2014-11-27 13:00 UTC: 102,8 vs 26,7, ×3,84 |
| P-02-S01 | Hasil pemilu presiden AS | USDJPY | 2016-11-09 01:00 UTC: 401,2 vs 31,1, ×12,92 |
| P-02-S02 | BoC memangkas bunga secara mengejutkan | USDCAD | 2015-01-21 15:00 UTC: 331,2 vs 34,2, ×9,67 |
| P-02-S03 | PBoC memangkas patokan yuan | AUDUSD | 2015-08-11 01:30 UTC: 124,9 vs 30,2, ×4,14 |
| P-02-S09 | Keputusan FOMC Juni 2017 | AUDUSD | 2017-06-14 18:00 UTC: 65,9 vs 15,3, ×4,30 |
| P-03-S01 | Kepanikan COVID-19 dan perang harga minyak | AUDUSD | 2020-03-09 00:00 UTC: 313,8 vs 25,3, ×12,40 |
| P-03-S02 | SNB menghapus batas EUR/CHF | EURJPY | 2015-01-15 09:30 UTC: 244,9 vs 51,2, ×4,79 |
| P-03-S03 | Theresa May mengumumkan pemilu dini | GBPUSD | 2017-04-18 10:15 UTC: 186,4 vs 24,6, ×7,59 |
| P-04-S01 | "Black Monday" Agustus 2015 | USDJPY | 2015-08-24 01:00 UTC: 111,7 vs 25,0, ×4,47 |
| P-04-S02 | Rusia menginvasi Ukraina | EURJPY | 2022-02-24 03:00 UTC: 153,0 vs 41,9, ×3,66 |
| P-04-S03 | BoE memangkas bunga ke 0,25% (+ NFP sehari kemudian) | GBPUSD | 2016-08-04 11:00 UTC: ×5,78; 2016-08-05 12:30 UTC: ×3,57 |
| P-05-S01 | Exit poll pemilu Inggris | GBPUSD | 2019-12-12 22:00 UTC: 363,5 vs 28,7, ×12,65 |
| P-05-S02 | Yuan melewati 7 per dolar | USDJPY | 2019-08-05 01:00 UTC: 63,6 vs 21,2, ×3,00 |
| P-05-S03 | Kenaikan bunga Fed pertama sejak 2006 | EURUSD | 2015-12-16 19:00 UTC: 123,8 vs 34,8, ×3,56 |

Jadwal rilis yang disebut di briefing skenario biasa juga dicek dengan cara yang sama: FOMC 26 Jul 2017 (P-01-S04, ×5,46), risalah FOMC 20 Agt 2014 (P-03-S10, ×4,23), FOMC 18 Jun 2014 (P-04-S07, ×3,97), KTT UE 17 Okt 2019 (P-05-S04, ×3,75), ECB 6 Nov 2014 (P-05-S05, ×4,14), FOMC 17 Sep 2014 (P-05-S06, ×4,68), FOMC 16 Jun 2021 (P-05-S07, ×7,54). Setiap klaim arah ("turun sejak awal bulan" dan sejenisnya) dicek sebagai drift pada candle H1 sebelum "Mulai"; semuanya lolos.

**Kandidat yang ditolak** karena tidak cocok dengan data dan tidak dipakai: pemangkasan darurat Fed 50 bp (3 Mar 2020; rasio lonjakannya di bawah 2,5×), putaran pertama pemilu Prancis (23 Apr 2017; terjadi saat pasar tutup, hanya gap), cuitan tarif Mei 2019 (juga akhir pekan), Fed ke nol (15 Mar 2020, hari Minggu).

## Hal yang tidak bisa dipastikan

- **Konteks makro di briefing** (siapa mengatakan apa, ekspektasi pasar) ditulis dari pengetahuan sejarah, bukan dari data harga. Yang bisa diverifikasi sudah diverifikasi; sisanya sebaiknya dibaca ulang oleh pemilik materi.
- **Jam pasti rilis** dicocokkan dengan lonjakan di data M15, jadi ketelitiannya 15 menit. Pengumuman yang jatuh di tengah candle tampil di candle itu.
- **Pergerakan besar tanpa berita yang disebut**: validator memeriksa jendela main skenario biasa untuk lonjakan yang tidak disebut di briefing. Yang terakhir ditemukan (FOMC Juli 2017 di P-01-S04) sudah ditambahkan ke briefing; sekarang tidak ada lagi. Lonjakan kecil di bawah 2,5× tidak disebut.
- **P-01-S07 dan P-03-S03** tidak punya swing yang jelas di dekat entry, jadi SL acuannya 1,5× ATR, bukan level struktur.
- **Rubrik pilihan ganda kompleks** (skor per opsi) dan batas 2,5× untuk lonjakan adalah keputusan desain saya, bukan dari spesifikasi.
- Pair FXCM (GBPNZD, GBPCAD, EURAUD) tidak dipakai sesuai instruksi; README data menyebut datanya hasil resample M1 FXCM yang asli, bukan sintetis.
