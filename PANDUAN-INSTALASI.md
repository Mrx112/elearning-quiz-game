# Panduan Instalasi & Menjalankan Aplikasi Quiz Game (Node.js)

Panduan ini membantu kamu menginstal Node.js dan menjalankan aplikasi quiz game hingga bisa dibuka di browser.

---

## Langkah 1: Instal Node.js

1. Buka browser dan kunjungi: https://nodejs.org/
2. Pilih versi **LTS** (disarankan stabil untuk banyak pengguna).
3. Klik tombol unduhan untuk sistem operasi kamu (Windows / macOS / Linux).
4. Buka file installer yang sudah diunduh.
5. Pada jendela installer, klik **Next** terus hingga selesai.
   - Pastikan centang "Add to PATH" diaktifkan (biasanya default sudah centang).
6. Klik **Install**, tunggu hingga selesai, lalu klik **Finish**.

### Verifikasi instalasi
Buka **Command Prompt** (Windows) atau **Terminal** (macOS/Linux), lalu ketik:

```powershell
node -v
npm -v
```

Jika menampilkan versi (mis. `v20.11.0` dan `10.2.4`), berarti Node.js sudah terinstal dengan benar.

---

## Langkah 2: Unduh / Clone Projekt

Pilih salah satu:

### Pilihan A: Clone dari GitHub
```powershell
git clone https://github.com/Mrx112/elearning-quiz-game.git
cd elearning-quiz-game
```

### Pilihan B: Unduh ZIP
1. Buka https://github.com/Mrx112/elearning-quiz-game
2. Klik tombol **Code** → **Download ZIP**.
3. Ekstrak ZIP ke folder yang diinginkan.
4. Buka terminal di folder hasil ekstraksi.

---

## Langkah 3: Instal Dependensi

Di dalam folder projekt, jalankan:

```powershell
npm install
```

Tunggu hingga selesai. Folder `node_modules` akan muncul.

---

## Langkah 4: Jalankan Aplikasi Secara Lokal

### Mode development (dengan fitur refresh otomatis)
```powershell
npm run dev
```

Kemudian buka alamat yang ditampilkan terminal, biasanya:
- http://localhost:5173

### Mode produksi (build lalu preview)
```powershell
npm run build
npm run preview
```

Buka alamat yang ditampilkan, biasanya http://localhost:4173.

---

## Langkah 5: Membuka di Browser

Setelah server berjalan, salin alamat (URL) dari terminal dan tempelkan ke browser (Chrome, Firefox, Edge, dll.).

Aplikasi akan menampilkan halaman awal quiz game. Kamu bisa:
- Klik **Mulai Bermain** untuk memulai kuis.
- Klik **Admin / Kelola Konten** (PIN default: `1234`) untuk mengatur slide dan pengaturan.

---

## Struktur Folder Penting

```
version/js/       -> Versi JavaScript murni (buka langsung index.html, tidak perlu Node.js)
version/php/      -> Versi PHP native (butuh server PHP)
version/vercel/   -> Versi siap deploy ke Vercel (serverless API)
src/              -> Kode sumber React/Vite (versi asli)
index.html        -> Entry point versi asli
```

---

## Menghentikan Server

Di terminal yang menjalankan `npm run dev`, tekan:
- **Ctrl + C** (Windows / Linux)
- **Ctrl + C** (macOS)

---

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| `node` tidak dikenali | Restart terminal setelah instalasi Node.js, atau coba buka ulang Command Prompt. |
| `npm install` gagal | Periksa koneksi internet. Hapus folder `node_modules` dan file `package-lock.json`, lalu jalankan `npm install` ulang. |
| Halaman tidak terbuka | Pastikan terminal tidak menampilkan error. Buka alamat yang tepat (biasanya `http://localhost:5173`). |
| Port sudah digunakan | Gunakan port lain: `npm run dev -- --port 3000` |

---

Selamat mencoba! Jika ada error, copas pesan error dari terminal untuk mendapatkan bantuan lebih lanjut.
