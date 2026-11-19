# Panduan Menjalankan & Meng-online-kan Website

Panduan ini menjelaskan cara menjalankan game di komputer sendiri dan cara meng-online-kannya
secara **gratis** agar bisa dibuka siswa dari HP atau laptop mana pun.

---

## A. Menjalankan di Komputer Sendiri

**Persiapan (sekali saja):** pasang **Node.js versi LTS** dari <https://nodejs.org>.

1. Buka folder `elearning-quiz-game`.
2. Klik kanan di dalam folder → **Open in Terminal** (Windows) / **New Terminal at Folder** (Mac).
3. Ketik perintah berikut, tekan Enter setelah setiap baris:

   ```bash
   npm install
   npm run dev
   ```

4. Buka alamat yang muncul (biasanya **http://localhost:5173**) di Chrome atau Edge.
5. Untuk mencoba di HP: sambungkan HP ke Wi-Fi yang sama, lalu buka alamat **Network**
   yang tertulis di terminal (contoh: `http://192.168.1.10:5173`).

Tekan `Ctrl + C` di terminal untuk menghentikan.

---

## B. Membuat File Siap Upload

```bash
npm run build
```

Hasilnya adalah folder **`dist/`**, berisi website yang siap diunggah.
**Folder `dist/` inilah yang di-upload ke hosting**, bukan folder proyek seluruhnya.

> Setiap kali soal atau gambar diubah, jalankan `npm run build` lagi lalu upload ulang folder `dist/`.

---

## C. Online Gratis — Pilih Salah Satu

### Opsi 1 · Netlify Drop (paling mudah, tanpa akun Git)

1. Jalankan `npm run build`.
2. Buka <https://app.netlify.com/drop> dan login (gratis).
3. **Seret folder `dist/`** ke halaman tersebut.
4. Tunggu beberapa detik → muncul link, misalnya `https://nama-acak.netlify.app`.
5. (Opsional) **Site configuration → Change site name** untuk mengganti nama link.

Memperbarui: buka situs di Netlify → tab **Deploys** → seret folder `dist/` yang baru.

### Opsi 2 · Vercel

1. Unggah folder proyek ke GitHub (lihat Opsi 3 langkah 1–2), **atau** pasang Vercel CLI.
2. Buka <https://vercel.com/new> → **Import** repository proyek ini.
3. Vercel mengenali Vite secara otomatis:
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Klik **Deploy** → link seperti `https://nama-proyek.vercel.app`.

Memperbarui: setiap perubahan yang di-push ke GitHub otomatis ter-deploy ulang.

### Opsi 3 · GitHub Pages

Proyek sudah menyertakan file otomatisasi `.github/workflows/deploy.yml`.

1. Buat repository baru di <https://github.com/new>.
2. Unggah seluruh isi folder proyek **kecuali** `node_modules/` dan `dist/`
   (atau gunakan `git push`).
3. Di repository: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. Buka tab **Actions** dan tunggu proses "Deploy ke GitHub Pages" selesai (±1–2 menit).
5. Link tersedia di **Settings → Pages**, formatnya `https://<username>.github.io/<nama-repo>/`.

Memperbarui: setiap push ke branch `main` otomatis ter-deploy ulang.

### Opsi 4 · Hosting Biasa (cPanel) / LMS

Unggah **isi** folder `dist/` ke `public_html/` (atau subfolder mana pun) lewat File Manager.
Path di dalam game sudah relatif, sehingga tetap berjalan di subfolder seperti
`https://sekolah.sch.id/kuis/`.

---

## D. Hal Penting Setelah Online

| Hal | Keterangan |
|-----|------------|
| **Wajib HTTPS** | Netlify, Vercel, dan GitHub Pages sudah otomatis HTTPS. Pada hosting biasa, aktifkan SSL agar fitur suara berjalan stabil. |
| **Suara pembaca** | Kualitas suara tergantung perangkat. Paling baik di Chrome/Edge (Android, Windows) dan Safari (iPhone/iPad). |
| **Suara pertama** | Browser baru mengizinkan suara setelah pengguna menekan tombol pertama ("Mulai Belajar"); ini normal. |
| **Mode senyap HP** | Di iPhone, matikan mode senyap (silent switch) agar suara terdengar. |
| **Papan peringkat** | Tersimpan di masing-masing perangkat/browser, tidak dibagikan antar-siswa. |
| **Biaya** | Ketiga layanan di atas gratis untuk penggunaan seperti ini. Domain sendiri (mis. `kuis-sekolah.com`) bersifat opsional dan berbayar. |

---

## E. Mengganti Konten Setelah Online

1. Ganti gambar di `public/assets/canva/...` (nama file tetap sama) dan/atau edit soal di
   `src/data/questionsData.js`.
2. Cek di komputer: `npm run dev`.
3. Build ulang: `npm run build`.
4. Upload ulang folder `dist/` (Netlify / cPanel), atau push ke GitHub (Vercel / GitHub Pages).
