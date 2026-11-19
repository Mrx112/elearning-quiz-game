# Checklist Pengujian — T1126-046 (REQ-9724)

Status per 18 November 2026. Kolom **Hasil**: ✅ lulus · ⏳ menunggu materi klien · ☐ belum diuji.

## 1. Quiz Engine

| No | Skenario | Hasil |
|----|----------|-------|
| 1.1 | Start Screen tampil; nama pemain opsional; tombol "Mulai Belajar" membuka soal 1 | ✅ |
| 1.2 | Soal pilihan ganda dengan 2, 3, dan 4 opsi tampil dengan layout yang sesuai | ✅ |
| 1.3 | Jawaban benar → panel hijau "Benar!", konfeti, suara *ding*, poin bertambah | ✅ |
| 1.4 | Jawaban salah → panel merah bergetar "Kurang Tepat!", suara *buzz*, jawaban benar ditunjukkan | ✅ |
| 1.5 | Setelah menjawab, pilihan lain terkunci (tidak bisa jawab dua kali) | ✅ |
| 1.6 | Waktu habis → dihitung salah, tampil "Waktu Habis!" | ✅ |
| 1.7 | Skor: bonus kecepatan & bonus beruntun dihitung; badge "2× beruntun" tampil | ✅ |
| 1.8 | Result Screen: total skor, jumlah benar/salah, akurasi, bintang, badge, papan peringkat | ✅ |
| 1.9 | "Review Jawaban" menampilkan jawaban pemain vs jawaban benar + penjelasan | ✅ |
| 1.10 | "Main Lagi" memulai ulang dari soal 1 dengan skor 0 | ☐ |
| 1.11 | Tombol keluar (✕) menampilkan konfirmasi; "Ya, keluar" kembali ke Start Screen | ☐ |
| 1.12 | Keyboard: angka 1–4 memilih, Enter mengunci, Enter lagi lanjut soal | ✅ |

## 2. Audio Interaktif

| No | Skenario | Hasil |
|----|----------|-------|
| 2.1 | Sentuh teks soal → dibacakan; teks menyala kuning selama dibacakan | ✅ |
| 2.2 | Sentuh pilihan jawaban / ikon speaker → pilihan dibacakan | ✅ |
| 2.3 | Penjelasan & jawaban benar di panel feedback bisa disentuh untuk dibacakan | ✅ |
| 2.4 | Timer berhenti saat suara dibacakan | ✅ |
| 2.5 | Soal otomatis dibacakan saat muncul | ✅ |
| 2.6 | Bahasa "Otomatis": soal Indonesia dibaca suara Indonesia, "Cat/Dog/Bird" dibaca suara Inggris | ☐ (uji dengar di perangkat klien) |
| 2.7 | Toggle SFX & Suara Pembaca mematikan suara masing-masing | ☐ |
| 2.8 | File audio klien (.mp3) diputar bila tersedia; jika gagal → otomatis Text-to-Speech | ⏳ menunggu file audio klien |

## 3. Aset Canva

| No | Skenario | Hasil |
|----|----------|-------|
| 3.1 | Tanpa aset: seluruh tampilan memakai gaya bawaan dan tetap rapi | ✅ |
| 3.2 | Aset klien dimasukkan → otomatis menggantikan gaya bawaan | ⏳ menunggu aset klien |
| 3.3 | Teks soal/tombol tetap terbaca di atas desain Canva klien | ⏳ menunggu aset klien |

## 4. Responsif & Browser

| No | Perangkat / Lebar | Hasil |
|----|-------------------|-------|
| 4.1 | Desktop / laptop (≥ 1280 px) — Chrome | ✅ |
| 4.2 | HP 375 px (ukuran iPhone) — Start, Soal, Feedback; tanpa scroll horizontal | ✅ |
| 4.3 | Tablet (768–1024 px) | ☐ |
| 4.4 | HP Android asli — Chrome | ☐ |
| 4.5 | iPhone asli — Safari (cek suara dengan mode senyap mati) | ☐ |

## 5. Deployment

| No | Skenario | Hasil |
|----|----------|-------|
| 5.1 | `npm run build` berhasil tanpa error | ✅ |
| 5.2 | Folder `dist/` dibuka dari subfolder hosting (path relatif) | ☐ |
| 5.3 | Website online (Netlify / Vercel / GitHub Pages) dapat dibuka via HTTPS | ☐ |

## Catatan

- Bug ditemukan & diperbaiki saat pengujian: menekan **Enter** untuk mengunci jawaban ikut
  melewati panel feedback. Sudah diperbaiki dan diuji ulang.
- Penyesuaian tampilan HP: maskot & judul panel feedback diperkecil agar judul muat satu baris.
