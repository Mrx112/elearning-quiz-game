# Quiz Game — Versi Lengkap untuk Vercel

Folder `version/vercel/` adalah implementasi lengkap yang siap di-deploy ke **Vercel** tanpa build step.

## Struktur
```
version/vercel/
  index.html          # Shell SPA (Tailwind via CDN)
  style.css           # Gaya tambahan (diadaptasi dari versi JS)
  app.js              # Logika game (sama persis dengan versi JS & PHP)
  data/slides.json    # Data slide & pengaturan (dibaca oleh API)
  api/
    slides.js         # GET /api/slides  -> mengembalikan data slide
    save.js           # POST /api/save   -> menyimpan slide/pengaturan
    login.js          # POST /api/login  -> verifikasi PIN admin
    logout.js         # POST /api/logout -> keluar sesi admin
  vercel.json         # Konfigurasi routing Vercel
```

## Fitur (sama persis di ketiga versi)
1. Halaman awal: judul, subtitle, jumlah slide & kuis, tombol Mulai Bermain & Admin
2. Permainan slide-demi-slide: cerita, kuis (4 opsi + skor), peta (pilihan area), layar akhir + skor & peringkat
3. Text-to-speech (Web Speech API) + efek suara (Web Audio API)
4. Timer hitung mundur, indikator progres, navigasi Kembali/Lanjut
5. Admin (PIN default `1234`): kelola slide (tambah/edit/hapus), pengaturan, ekspor/impor JSON
6. Preferensi disimpan di `localStorage`

## Deploy ke Vercel
1. Unggah isi folder `version/vercel/` ke repositori GitHub (atau git repo).
2. Di Vercel: **Add New Project** → impor repo tersebut.
3. Vercel akan mendeteksi `vercel.json` dan fungsi serverless di `api/`.
4. Klik **Deploy**.

Catatan: Sistem file serverless Vercel bersifat read-only, oleh karena itu tombol **Simpan** di AdminPanel menyimpan ke memori sementara (`/tmp`) atau hanya-baca tergantung lingkungan. Data utuh tetap dibaca dari `data/slides.json` yang sudah di-commit. Untuk penyimpanan permanen admin, gunakan database eksternal (mis. Vercel KV/Upstash).

PIN admin default: `1234`.
