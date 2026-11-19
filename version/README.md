# Quiz Game — versi JS native dan PHP native (fitur sama persis)

Folder ini berisi dua implementasi yang memiliki fitur identik, masing-masing dalam folder terpisah dan siap di-deploy ke Vercel.

## Struktur
- `version/js/` — versi murni JavaScript (HTML + CSS + JS, tanpa build step, statis)
- `version/php/` — versi PHP native (HTML shell + `api.php` untuk data server & autentikasi admin via sesi PHP)

## Fitur (sama di kedua versi)
1. Halaman awal: judul, subtotal, info jumlah slide/kuis, tombol Mulai Bermain & Admin
2. Permainan slide-demi-slide: cerita (story), kuis (quiz) dengan 4 opsi + skor, peta (map) dengan pilihan area, layar akhir (ending) dengan skor dan peringkat
3. Text-to-speech (Web Speech API) dan efek suara (Web Audio API)
4. Timer hitung mundur per slide, indikator progres, navigasi Kembali/Lanjut
5. Admin (dengan PIN, default `1234`): kelola slide (tambah/edit/hapus), pengaturan game, ekspor/impor JSON
6. Preferensi disimpan di `localStorage` (suara, efek suara, bahasa)

## Deploy ke Vercel

### Versi JS (static)
- Unggah isi `version/js/` ke Vercel sebagai project statis, atau hubungkan repo lalu atur root directory ke `version/js`.
- Tidak perlu build command; `index.html` langsung served.

### Versi PHP
Vercel tidak memiliki runtime PHP bawaan. Untuk menjalankan `index.php` dan `api.php`:
1. Hubungkan repo ke Vercel.
2. Tambahkan **buildpack PHP komunitas** (vercel-php) di Settings → Build & Development → Buildpacks (atau gunakan platform yang mendukung PHP native).
3. Pastikan `vercel.json` ada di `version/php/` (routes semua request ke `index.php`).
4. Folder `data/` harus dapat ditulis oleh PHP agar admin bisa menyimpan slide/pengaturan.

### Catatan PIN admin
PIN default `1234`. Di versi JS, admin disimpan di memori sesi halaman. Di versi PHP, admin diverifikasi melalui `api.php?action=login` dan disimpan dalam sesi PHP (`$_SESSION`).
