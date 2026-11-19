/**
 * GuideTab — Panduan singkat di dalam aplikasi untuk pengelola konten.
 */
const STEPS = [
  ['1. Pilih slide', 'Klik slide di daftar kiri. Urutkan dengan tombol ▲▼ atau seret-lepas. Tombol "Slide baru" menambah slide cerita atau kuis 2/3/4 pilihan.'],
  ['2. Edit elemen di kanvas', 'Klik elemen untuk memilihnya, seret untuk memindah, tarik titik sudut kuning untuk mengubah ukuran (tahan Shift = rasio tetap). Panah keyboard untuk geser halus, Delete untuk hapus.'],
  ['3. Ubah teks & suara', 'Pilih teks/pilihan jawaban → ubah isi di panel kanan. Semua teks otomatis bisa disentuh untuk dibacakan. Isi "Teks yang dibacakan" bila ucapan berbeda dari tulisan, atau unggah rekaman .mp3/.wav sendiri.'],
  ['4. Atur kunci jawaban', 'Pilih tombol jawaban → centang "Ini jawaban BENAR". Isi "Teks setelah menjawab benar" di pengaturan slide (klik area kosong kanvas).'],
  ['5. Ganti gambar Canva', 'Pilih gambar → Unggah (PNG transparan dari Canva) atau Pustaka (semua elemen ICT ELEMENT). Background: klik area kosong kanvas → Background → Unggah. Ukuran ideal background 1920×1080.'],
  ['6. Cocokkan dengan desain', 'Aktifkan "Desain Canva" di atas kanvas untuk menampilkan gambaran asli secara transparan, lalu sesuaikan posisi elemen.'],
  ['7. Coba mainkan', 'Klik "Main / Pratinjau" di kanan atas. Semua perubahan tersimpan otomatis di browser ini.'],
  ['8. Backup', 'Tab "Backup & Reset": Export untuk menyimpan/memindah ke perangkat lain, Import untuk memulihkan, Reset untuk kembali ke aset ICT ELEMENT.'],
];

export default function GuideTab() {
  return (
    <div className="admin-scroll h-full overflow-auto bg-slate-100 p-3 sm:p-6">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-7">
        <h2 className="font-display text-2xl font-bold text-slate-800">Panduan Mode Pengelola</h2>
        <p className="mt-1 text-sm text-slate-500">Kelola isi game tanpa coding. PIN default: <b>1234</b> (ubah di tab Pengaturan).</p>
        <ol className="mt-5 space-y-4">
          {STEPS.map(([t, d]) => (
            <li key={t} className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
              <h3 className="font-bold text-slate-800">{t}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">{d}</p>
            </li>
          ))}
        </ol>
        <div className="mt-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-amber-200">
          <b>Tips ekspor dari Canva:</b> Unduh → PNG → centang "Latar belakang transparan" untuk karakter, hewan, tombol. Untuk background gunakan JPG 1920×1080. Audio rekaman: MP3 atau WAV.
        </div>
      </div>
    </div>
  );
}
