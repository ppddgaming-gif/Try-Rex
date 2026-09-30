import type { Metadata } from "next"
import { Isi, LegalDoc, Section, Tinjau } from "@/components/legal-doc"

export const metadata: Metadata = { title: "Disclaimer" }

export default function DisclaimerPage() {
  return (
    <LegalDoc
      title="Disclaimer"
      intro={<p>Singkatnya: TRY-REX adalah tempat berlatih, bukan tempat mencari sinyal trading.</p>}
    >
      <Section title="Edukasi, bukan saran finansial">
        <p>
          Seluruh konten TRY-REX (soal, skor, evaluasi, dan penjelasan) bersifat <strong>edukasi</strong>. Tidak ada
          yang merupakan saran investasi, ajakan membeli atau menjual, atau rekomendasi untuk pasar saat ini.
        </p>
        <p>
          <Isi>nama badan usaha</Isi> bukan pialang, bukan penasihat investasi, dan tidak terdaftar sebagai pihak yang
          berwenang memberi nasihat investasi. <Tinjau>status perizinan dan rujukan ke OJK / Bappebti</Tinjau>
        </p>
      </Section>

      <Section title="Data historis">
        <p>
          Semua skenario memakai data harga historis. Hasil latihan, termasuk skor tinggi, <strong>tidak
          memprediksi</strong> hasil trading di pasar nyata.
        </p>
      </Section>

      <Section title="Risiko trading">
        <p>
          Trading forex dan instrumen berleverage berisiko tinggi. Leverage bisa menghabiskan modal dalam waktu
          singkat, dan kamu bisa kehilangan lebih banyak dari yang kamu perkirakan. Jangan trading dengan uang yang
          tidak siap kamu relakan.
        </p>
      </Section>

      <Section title="Penjelasan dari AI">
        <p>
          Sebagian penjelasan dibuat dengan bantuan AI dan bisa keliru. Gunakan sebagai bahan belajar, bukan dasar
          keputusan finansial.
        </p>
      </Section>
    </LegalDoc>
  )
}
