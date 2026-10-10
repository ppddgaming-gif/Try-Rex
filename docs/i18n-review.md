# Review terjemahan bahasa Inggris

Dokumen kerja untuk pemilik produk. Isinya tiga daftar: terjemahan yang perlu
diputuskan atau dicek, materi yang sengaja belum diterjemahkan, dan hal yang
belum beres. Semua teks UI ada di `messages/id/*.json` dan `messages/en/*.json`.
Mengubah terjemahan cukup di file `en`; tes `lib/i18n/messages.test.ts`
memastikan key dan placeholder id/en tetap sama.

## 1. Terjemahan yang perlu kamu putuskan

Nama fitur dan istilah produk. Pilihannya memengaruhi banyak layar sekaligus.

| Indonesia | Inggris sekarang | Kenapa ragu | Alternatif |
|---|---|---|---|
| Akun Latihan | Practice Account | Nama fitur. Bisa juga dibiarkan sebagai nama merek. | Demo Account (tapi "demo" mengesankan akun broker) |
| Belajar 101 | Learn 101 | Nama menu. | Trading 101, Academy |
| Kamus Trading | Trading Glossary | Aman, tapi "Kamus" juga dipakai sebagai nama tab. | Glossary |
| Disiplin (skor) | Disiplin | Dibiarkan sebagai nama skor, seperti nama merek. Penutur Inggris mungkin mengira salah ketik. | Discipline |
| Tips Rex | Rex's Tips | | Rex Tips |
| akun habis | (account) ran out / run-out line | Tidak ada istilah baku. "Blown account" terlalu slang. | account depleted |
| Stage | Stage | Sudah bahasa Inggris, dibiarkan. | |
| Bedah soal ini | Break this one down | Istilah gaya. Juga dipakai di kalimat Rex saat onboarding. | Review this question |
| Tepat / Kurang tepat | Correct / Not quite | "Not quite" lebih lembut, sesuai nada aslinya. | Correct / Incorrect |
| Tamu | Guest | | |
| AI Evaluation, Trading Game | (tetap) | Sudah bahasa Inggris di versi ID. | |

Istilah trading baku tidak diterjemahkan: BUY, SELL, WAIT, SL, TP, pip, lot,
ATR, support, resistance, spread, margin, leverage, swap, equity, entry,
breakout, candle.

Kalimat yang nadanya perlu dicek oleh penutur Inggris:

- **Alasan trade** (`common.reasons`): "Ikut feeling" → *Gut feeling*,
  "Pantulan di support" → *Bounce off support*, "Penolakan di resistance" →
  *Rejection at resistance*, "Menunggu konfirmasi" → *Waiting for confirmation*.
  Label ini juga dikutip di komentar Rex.
- **Self-review** (`demo.ui.review`): Ya / Sebagian / Tidak → *Yes / Partly / No*.
- **Hero landing** (`landing.hero.title`): *"Learn trading with an AI mentor
  that never sleeps"*. Ini terjemahan langsung. Klaimnya sama dengan versi ID,
  tapi dalam bahasa Inggris terdengar sedikit lebih seperti iklan.
- **Pertanyaan onboarding 1** (`onboarding.questions.motivation.title`): versi
  ID kata per kata dari PDF desain. Versi EN (*What got you curious about
  trading?*) bebas, karena PDF tidak punya versi Inggris.
- **Glosarium** (`glossary.entries.*`): 44 definisi diterjemahkan karena muncul
  sebagai tooltip. Semuanya draf seperti versi ID dan belum dicek ke sumber.
  Beberapa nama istilah dirapikan: "BUY (beli)" → *BUY*, "Sumbu (wick)" →
  *Wick*, "Sideways (menyamping)" → *Sideways*.
- **Mockup chat di landing** (`landing.showcase.chat*`): contoh percakapan
  dengan Rex, diterjemahkan bebas.
- **"perkiraan"** → *estimate* (biaya spread/swap di panel order dan kalkulator).
- **Pelajaran wajib Akun Latihan** (`demo.lessons.intro`, `demo.lessons.risk`):
  diterjemahkan penuh karena wajib dilewati sebelum trade pertama. Angkanya
  tetap dihitung dari kode, jadi tidak bisa salah. Kalimatnya tetap perlu dicek.
- **Komentar Rex dan Tips Rex** (`rex.*`, `tips.*`): diterjemahkan dengan
  aturan yang sama, yaitu menilai proses dan tidak pernah hasil. Tes
  `rex-comments.test.ts` memeriksa kedua bahasa bebas dari kata-kata hasil
  (profit, win, result, dst.).

Format: harga tetap memakai titik desimal di kedua bahasa, seperti sebelumnya.
Tanggal, nama bulan, dan angka ribuan mengikuti bahasa (contoh: "1.234" di ID,
"1,234" di EN). Bulan pendek di chart: Mei/Agu/Okt/Des di ID, May/Aug/Oct/Dec
di EN.

## 2. Sengaja belum diterjemahkan

Ditampilkan dalam bahasa Indonesia dengan label *"Not yet available in
English"* (dan `lang="id"` untuk pembaca layar).

**Belajar 101: isi 15 pelajaran.** Judul, ringkasan, nama bab, menu, kuis UI,
dan diagram sudah diterjemahkan. Yang belum adalah isi pelajaran di
`lib/learn/content.ts`, termasuk paragraf, poin, callout, keterangan chart,
pertanyaan kuis, dan catatan `[PERLU SUMBER]`:

| Bab | Pelajaran (slug) |
|---|---|
| Dasar Trading | `apa-itu-trading`, `pasar-dan-instrumen`, `buy-sell-wait` |
| Membaca Chart | `anatomi-candlestick`, `trend`, `support-resistance`, `timeframe` |
| Manajemen Risiko | `stop-loss-take-profit`, `risk-reward`, `leverage` |
| Crypto 101 | `apa-itu-crypto`, `bitcoin-altcoin-stablecoin`, `keamanan-crypto` |
| Psikologi Trading | `fomo-overtrading`, `jurnal-trading` |

Saat salah satunya diterjemahkan, ubah `bodyAvailableIn()` di
`lib/learn/content.ts` supaya labelnya hilang untuk pelajaran itu.

**Dokumen legal**: `/privacy`, `/terms`, `/disclaimer`. Judul halaman, banner
draf, dan tanggalnya diterjemahkan. Isinya tetap Indonesia sampai ada versi
Inggris yang ditinjau ahli hukum.

**Soal assessment**: belum ada di kode. Strukturnya sudah disiapkan di
`lib/i18n/localized-text.ts` (`LocalizedText`, `LocalizedQuestion`,
`pickText()`), dengan Indonesia wajib, Inggris opsional, dan fallback ke
Indonesia.

## 3. Belum beres atau perlu kamu cek

1. **Kolom `profiles.locale` di database live.** Kode menyimpan pilihan bahasa
   di kolom ini untuk pengguna yang login. Kolomnya ada di `docs/schema.sql`
   dan izin UPDATE-nya ada di migrasi `_profile_customization`, tapi saya tidak
   bisa memastikan kolom itu ada di database live (akses MCP Supabase ditolak).
   Cek dengan:
   ```sql
   select column_name from information_schema.columns
   where table_schema = 'public' and table_name = 'profiles' and column_name = 'locale';
   ```
   Kalau kosong, SQL ini menambahkannya (belum dijalankan):
   ```sql
   alter table public.profiles add column if not exists locale text not null default 'id'
     check (locale in ('id', 'en'));
   grant update (locale) on public.profiles to authenticated;
   ```
   Tanpa kolom ini, pemilih bahasa tetap jalan per perangkat; hanya sinkron
   antar perangkat yang tidak terjadi.
2. **Groq belum ada di repo.** `lib/i18n/llm.ts` menyediakan
   `languageInstruction(locale)` untuk dimasukkan ke system prompt saat
   integrasinya dibuat.
3. **Layar yang butuh login belum dicek di browser**, yaitu Dashboard dan
   semua tab Akun Latihan, karena tidak ada akses ke Supabase saat
   pengembangan lokal. Logika dan teksnya tercakup tes (komentar Rex, pelajaran
   wajib, label stage, pesan error), dan teks ID-nya dibandingkan sama persis
   dengan versi lama. Tolong cek di link preview dengan akun sungguhan.
4. **Label riwayat saldo** disimpan di database dalam bahasa Indonesia ("Setoran
   awal", "Komisi trade #3"). Tampilan EN menyusun ulang labelnya dari jenis
   baris dan nomor trade (`ledgerLabel` di `lib/demo/format.ts`), jadi tidak
   perlu migrasi data.
