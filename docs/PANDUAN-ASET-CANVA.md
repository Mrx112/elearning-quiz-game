# Panduan Aset Canva — Petualangan Kuis

Dokumen ini untuk **desainer / klien** yang menyiapkan gambar di Canva.
Cukup ekspor file sesuai tabel, beri nama persis sama, dan kirimkan (atau taruh langsung
di folder `public/assets/canva/`). Tidak perlu mengubah kode.

> **Semua slot bersifat opsional.** Selama sebuah file belum ada, game tetap tampil rapi
> dengan gaya bawaan. Begitu file dimasukkan, tampilan otomatis berganti ke desain Canva.

---

## 1. Daftar Aset & Ukuran

### A. Latar Belakang — `public/assets/canva/backgrounds/`

| Nama file       | Ukuran Canva    | Format         | Keterangan |
|-----------------|-----------------|----------------|------------|
| `bg-main.png`   | **1920 × 1080** | PNG / JPG      | Latar layar laptop/tablet landscape. Tempatkan elemen penting di tengah; tepi bisa terpotong di layar dengan rasio berbeda. Hindari teks. |
| `bg-mobile.png` | **1080 × 1920** | PNG / JPG      | *Opsional.* Latar versi HP (potret). Jika tidak ada, HP memakai `bg-main.png`. |

### B. Identitas & UI — `public/assets/canva/ui/`

| Nama file           | Ukuran Canva    | Format          | Keterangan |
|---------------------|-----------------|-----------------|------------|
| `logo.png`          | **1200 × 400**  | PNG transparan  | Logo / judul game di layar awal. Mengganti judul teks bawaan. |
| `card-frame.png`    | Desain **800 × 450**, ekspor **2×** → **1600 × 900** | PNG transparan | Bingkai kartu soal. **Sisakan ±9% area kosong** di kiri-kanan dan ±8% di atas-bawah — teks soal & gambar diletakkan di area tengah. Bagian tengah sebaiknya berwarna terang (teks soal berwarna gelap). |
| `btn-option-1.png`  | **800 × 200**   | PNG transparan  | Tombol pilihan **A** (bawaan: merah ▲). |
| `btn-option-2.png`  | **800 × 200**   | PNG transparan  | Tombol pilihan **B** (bawaan: biru ◆). |
| `btn-option-3.png`  | **800 × 200**   | PNG transparan  | Tombol pilihan **C** (bawaan: kuning ●). |
| `btn-option-4.png`  | **800 × 200**   | PNG transparan  | Tombol pilihan **D** (bawaan: hijau ■). |
| `btn-primary.png`   | **600 × 160**   | PNG transparan  | Tombol utama (Mulai Belajar, Kunci Jawaban, Main Lagi). |

**Catatan tombol:**
- Teks jawaban & teks tombol ditulis oleh game (warna **putih**), jadi **jangan tulis teks di gambar tombol**.
- Gunakan warna tombol yang cukup gelap/jenuh agar teks putih terbaca.
- Kosongkan area **±80 px di kiri** (ikon bentuk ▲◆●■) dan **±80 px di kanan** (ikon speaker 🔊) pada tombol pilihan.
- Gambar tombol akan direntangkan mengikuti ukuran tombol — pertahankan rasio **4:1** agar tidak gepeng.

### C. Karakter / Maskot — `public/assets/canva/characters/`

| Nama file           | Ukuran Canva   | Format         | Muncul saat |
|---------------------|----------------|----------------|-------------|
| `mascot-idle.png`   | **512 × 512**  | PNG transparan | Layar awal (melayang pelan). |
| `mascot-happy.png`  | **512 × 512**  | PNG transparan | Jawaban benar. |
| `mascot-sad.png`    | **512 × 512**  | PNG transparan | Jawaban salah / waktu habis (sebaiknya ekspresi menyemangati, bukan menangis). |

### D. Penghargaan — `public/assets/canva/badges/`

| Nama file           | Ukuran Canva   | Format         | Keterangan |
|---------------------|----------------|----------------|------------|
| `badge-gold.png`    | **512 × 512**  | PNG transparan | Akurasi ≥ 80% (3 bintang). |
| `badge-silver.png`  | **512 × 512**  | PNG transparan | Akurasi ≥ 50% (2 bintang). |
| `badge-bronze.png`  | **512 × 512**  | PNG transparan | Akurasi < 50%. |
| `star-on.png`       | **256 × 256**  | PNG transparan | Bintang menyala. |
| `star-off.png`      | **256 × 256**  | PNG transparan | Bintang redup / kosong. |

### E. Ilustrasi Soal — `public/assets/canva/questions/`

| Nama file              | Ukuran Canva    | Format     | Keterangan |
|------------------------|-----------------|------------|------------|
| `q1.png` … `q5.png`    | **1200 × 675**  | PNG / JPG  | Rasio 16:9. Satu gambar per soal (nama mengikuti `id` soal). Jika tidak ada, game menampilkan emoji. |

### F. Audio (opsional) — `public/assets/audio/`

| Folder    | Contoh nama          | Format       | Keterangan |
|-----------|----------------------|--------------|------------|
| `voice/`  | `q1.mp3`, `q1-explain.mp3` | MP3 (128 kbps, mono) | Rekaman suara pembaca soal/penjelasan. Jika tidak ada → dibacakan otomatis oleh Text-to-Speech. |
| `sfx/`    | `correct.mp3`, `wrong.mp3`, `win.mp3`, `click.mp3` | MP3 / WAV | Efek suara custom. Jika tidak ada → memakai synthesizer bawaan. |

> File audio perlu didaftarkan di `src/data/questionsData.js` (suara soal) atau
> `src/config/gameConfig.js` → `SFX_FILES` (efek suara). Lihat README.

---

## 2. Cara Ekspor dari Canva

1. Buat desain dengan **Custom size** sesuai tabel (mis. 800 × 200 px).
2. Klik **Share → Download**.
3. Pilih **PNG**, centang **Transparent background** (perlu Canva Pro) untuk semua aset "PNG transparan".
4. Untuk `card-frame.png`, atur **Size × 2** agar tajam di layar retina.
5. Untuk latar (`bg-*.png`) boleh pilih **JPG** kualitas ±80% agar file lebih kecil
   — tetapi ubah juga ekstensi di `gameConfig.js` (mis. `bg-main.jpg`).
6. Ganti nama file sesuai tabel (huruf kecil semua, pakai tanda hubung).

## 3. Batas Ukuran File (agar game cepat dimuat)

| Jenis aset          | Target maksimal |
|---------------------|-----------------|
| Latar belakang      | ≤ 400 KB        |
| Frame / tombol      | ≤ 150 KB        |
| Maskot / badge      | ≤ 120 KB        |
| Ilustrasi soal      | ≤ 250 KB        |

Bila terlalu besar, kompres dengan [tinypng.com](https://tinypng.com) sebelum dikirim.

## 4. Checklist Pengiriman Aset

- [ ] `backgrounds/bg-main.png` (1920×1080)
- [ ] `backgrounds/bg-mobile.png` (1080×1920) — opsional
- [ ] `ui/logo.png` (1200×400)
- [ ] `ui/card-frame.png` (1600×900)
- [ ] `ui/btn-option-1.png` s.d. `btn-option-4.png` (800×200)
- [ ] `ui/btn-primary.png` (600×160)
- [ ] `characters/mascot-idle.png`, `mascot-happy.png`, `mascot-sad.png` (512×512)
- [ ] `badges/badge-gold.png`, `badge-silver.png`, `badge-bronze.png` (512×512)
- [ ] `badges/star-on.png`, `star-off.png` (256×256)
- [ ] `questions/q1.png` … `q5.png` (1200×675)
