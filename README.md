# Petualangan Kuis — Web Game E-Learning Interaktif

Game kuis bergaya Kahoot / Quizizz untuk e-learning, dibangun dengan **React (Vite) + Tailwind CSS v4**.

- **Sentuh teks → dibacakan.** Soal, pilihan jawaban, dan penjelasan bisa disentuh untuk dibacakan
  (file rekaman `.mp3`/`.wav` jika ada, otomatis *fallback* ke Web Speech API).
- **Siap dikuliti aset Canva.** Background, logo, frame soal, tombol, maskot, badge & bintang
  tinggal diganti file PNG/JPG/SVG — tanpa mengubah komponen.
- **Tampil rapi tanpa aset.** Selama gambar belum ada, UI memakai gaya Tailwind bawaan.
- **SFX tanpa file.** Klik, benar (ding), salah (buzz), detak timer, dan fanfare dibuat dengan Web Audio API.

---

## 1. Menjalankan Proyek

Butuh **Node.js 18+**.

```bash
npm install        # pasang dependensi (sekali saja)
npm run dev        # mode pengembangan → buka http://localhost:5173
npm run build      # build produksi → folder dist/
npm run preview    # cek hasil build secara lokal
```

`npm run dev` juga menampilkan alamat **Network** (mis. `http://192.168.1.10:5173`) —
buka dari HP di Wi-Fi yang sama untuk mencoba layar sentuh.

**Deploy:** unggah isi folder `dist/` ke hosting statis mana pun (Netlify, Vercel, GitHub Pages,
cPanel, atau subfolder LMS). Path sudah relatif (`base: './'`), jadi bisa ditaruh di subfolder.
Langkah lengkap per layanan: [docs/PANDUAN-HOSTING.md](docs/PANDUAN-HOSTING.md).

---

## 2. Struktur Folder

```
elearning-quiz-game/
├── index.html                    ← halaman utama + font Google
├── vite.config.js                ← konfigurasi Vite + plugin Tailwind
├── .github/workflows/deploy.yml  ← deploy otomatis ke GitHub Pages
├── docs/
│   ├── PANDUAN-ASET-CANVA.md     ← daftar ukuran aset untuk desainer
│   ├── PANDUAN-HOSTING.md        ← cara menjalankan & online-kan (Netlify/Vercel/GitHub Pages)
│   └── CHECKLIST-PENGUJIAN.md    ← daftar uji & statusnya
├── public/
│   └── assets/
│       ├── canva/                ← ✏️ TARUH GAMBAR CANVA DI SINI
│       │   ├── backgrounds/      bg-main.png, bg-mobile.png
│       │   ├── ui/               logo.png, card-frame.png, btn-option-1..4.png, btn-primary.png
│       │   ├── characters/       mascot-idle.png, mascot-happy.png, mascot-sad.png
│       │   ├── badges/           badge-gold/silver/bronze.png, star-on.png, star-off.png
│       │   └── questions/        q1.png … q5.png
│       └── audio/                ← (opsional) rekaman suara & SFX
│           ├── voice/
│           └── sfx/
└── src/
    ├── main.jsx                  ← titik masuk React
    ├── App.jsx                   ← pengatur alur layar (start → game → result → review)
    ├── index.css                 ← Tailwind + font + animasi (shake, pop, confetti, …)
    │
    ├── config/
    │   └── gameConfig.js         ← ✏️ PANEL KONTROL: aset, warna, timer, skor, teks UI
    ├── data/
    │   └── questionsData.js      ← ✏️ BANK SOAL
    │
    ├── audio/
    │   ├── AudioProvider.jsx     ← pusat suara: speak(), stop(), sfx()
    │   ├── sfx.js                ← synthesizer efek suara (Web Audio API)
    │   └── voices.js             ← pemilih suara TTS terbaik per bahasa
    │
    ├── hooks/
    │   ├── useQuizGame.js        ← mesin permainan (state, skor, timer, kunci jawaban)
    │   ├── useAssetStatus.js     ← cek apakah gambar Canva ada
    │   └── useCountUp.js         ← animasi angka skor
    │
    ├── lib/
    │   ├── storage.js            ← localStorage yang aman
    │   └── leaderboard.js        ← papan peringkat lokal
    │
    ├── components/
    │   ├── canva/                ← komponen "slot aset"
    │   │   ├── CanvaImage.jsx    gambar + fallback
    │   │   ├── SkinSurface.jsx   wadah/tombol yang bisa diberi kulit gambar
    │   │   ├── AppBackground.jsx latar belakang aplikasi
    │   │   └── Mascot.jsx        maskot 3 ekspresi
    │   ├── ui/
    │   │   ├── SpeakableText.jsx ← teks yang dibacakan saat disentuh
    │   │   ├── GameButton.jsx
    │   │   ├── Toggle.jsx
    │   │   └── SegmentedControl.jsx
    │   └── game/
    │       ├── TopBar.jsx        progress, skor, timer, streak
    │       ├── QuestionCard.jsx  kartu soal + slot gambar
    │       ├── OptionButton.jsx  kartu pilihan jawaban
    │       ├── FeedbackPanel.jsx panel Benar!/Kurang Tepat!
    │       └── Confetti.jsx
    │
    └── screens/
        ├── StartScreen.jsx
        ├── GameScreen.jsx
        ├── ResultScreen.jsx
        └── ReviewScreen.jsx
```

**Untuk klien, hanya 3 tempat yang perlu disentuh:** `public/assets/`, `src/config/gameConfig.js`,
dan `src/data/questionsData.js`.

---

## 3. Alur Kerja Kode (untuk sesi penjelasan)

### 3.1 Lapisan aplikasi

```
┌──────────────────────────────────────────────────────────────┐
│  DATA & KONFIGURASI   gameConfig.js · questionsData.js       │  ← diubah klien
├──────────────────────────────────────────────────────────────┤
│  LOGIKA               useQuizGame (skor, timer, kunci)       │
│                       AudioProvider (TTS, file audio, SFX)   │
├──────────────────────────────────────────────────────────────┤
│  TAMPILAN             screens/*  →  components/*             │
│                       SkinSurface / CanvaImage (slot Canva)  │
└──────────────────────────────────────────────────────────────┘
```

Tampilan tidak menyimpan aturan main; logika tidak tahu soal warna/gambar. Itu sebabnya
aset bisa diganti tanpa menyentuh logika, dan aturan main bisa diubah tanpa menyentuh tampilan.

### 3.2 Alur layar (`App.jsx`)

```
start ──Mulai──► game ──Lihat Hasil──► result ──Review──► review
  ▲                │                     │  ▲               │
  └─────Keluar─────┘      Main Lagi ─────┘  └────Kembali────┘
```

### 3.3 Mesin permainan (`useQuizGame.js`)

```
   ┌────────────┐   pilih + Kunci / waktu habis   ┌────────────┐
   │ answering  │ ──────────────────────────────► │  feedback  │
   └────────────┘                                 └────────────┘
         ▲                Soal Berikutnya               │
         └──────────────────────────────────────────────┘
```

- **Anti double-click:** jawaban hanya diproses saat fase `answering`. Begitu terjawab, fase
  pindah ke `feedback` dan semua tombol pilihan dinonaktifkan.
- **Skor ala Kahoot:** `poin = 1000 × (0,5 + 0,5 × sisa_waktu/batas_waktu) + bonus beruntun`.
- **Timer berhenti saat suara dibacakan** (`pauseWhileSpeaking`), agar anak yang mendengarkan tidak dirugikan.

### 3.4 Sistem suara (`AudioProvider.jsx`)

```
Teks disentuh ──► speak({ id, text, lang, audioSrc })
                     │
                     ├─ audioSrc diisi?  ── ya ──► putar file .mp3/.wav
                     │                                 └─ gagal/tidak ada ─┐
                     └─ tidak ──────────────────────────────────────────────┴─► Web Speech API
                                                                                (suara terbaik
                                                                                 untuk bahasa itu)
```

- `speakingId` menandai teks mana yang sedang dibacakan → teks itu menyala kuning & berdenyut.
- Menyentuh teks yang sedang dibacakan = berhenti.
- **Bahasa suara:** `Otomatis` mengikuti `lang` tiap soal/pilihan (soal Indonesia dibaca suara
  Indonesia, kata "Cat" dibaca suara Inggris). `Indonesia`/`English` memaksa satu bahasa.

### 3.5 Slot aset Canva (`SkinSurface` & `CanvaImage`)

```
useAssetStatus(path)
   ├─ 'ok'    → pakai gambar Canva (gaya bawaan dilepas)
   └─ lainnya → pakai gaya Tailwind bawaan (fallbackClassName / fallback)
```

Contoh nyata di `QuestionCard.jsx`:

```jsx
<SkinSurface
  src={ASSETS.cardFrame}                 // path gambar dari gameConfig
  fallbackClassName="bg-white shadow-2xl p-7"   // tampilan jika gambar belum ada
  skinClassName="px-[9%] py-[8%]"        // tampilan jika gambar sudah ada
>
```

---

## 4. Panduan Kustomisasi

### 4.1 Mengganti gambar dengan aset Canva
1. Ekspor dari Canva sesuai `docs/PANDUAN-ASET-CANVA.md`.
2. Taruh di folder `public/assets/canva/...` dengan nama yang sama.
3. Refresh browser. Selesai.

Ingin nama/format lain (mis. `.svg` atau `.jpg`)? Ubah path di `ASSETS` (`src/config/gameConfig.js`):

```js
logo: canva('ui/logo-sekolah.svg'),
background: canva('backgrounds/bg-main.jpg'),
cardFrame: '',          // string kosong = selalu pakai gaya bawaan
```

### 4.2 Menambah / mengubah soal (`src/data/questionsData.js`)

```js
{
  id: 'q6',
  lang: 'id-ID',
  question: 'Ibu kota Indonesia adalah …',
  image: canva('questions/q6.png'),       // opsional
  emoji: '🏙️',                             // pengganti gambar
  options: [
    { id: 'a', text: 'Jakarta' },
    { id: 'b', text: 'Bandung' },
  ],
  correct: 'a',
  explanation: 'Jakarta adalah ibu kota Indonesia.',
}
```

- 2 sampai 4 pilihan per soal (layout menyesuaikan otomatis).
- `speak` — teks bacaan berbeda dari teks tampilan (mis. `"7 × 8"` → `"tujuh dikali delapan"`).
- `lang` per pilihan — untuk soal campuran bahasa (lihat soal 5).
- `timeLimit` — batas waktu khusus soal tersebut.

### 4.3 Memakai rekaman suara sendiri
1. Taruh file di `public/assets/audio/voice/q1.mp3`.
2. Di `questionsData.js`, ubah import menjadi `import { audio, canva } from '../config/gameConfig';`
3. Isi `audio: audio('voice/q1.mp3')` pada soal (juga bisa `explanationAudio`, atau `audio` di tiap pilihan).

Jika file gagal diputar, game otomatis membacakan teks dengan Text-to-Speech.

### 4.4 Efek suara custom
Di `gameConfig.js` → `SFX_FILES`, misalnya `correct: audio('sfx/correct.mp3')`.
Kosongkan untuk kembali ke synthesizer bawaan.

### 4.5 Aturan main (`GAME_SETTINGS`)

| Opsi | Bawaan | Fungsi |
|------|--------|--------|
| `answerMode` | `'confirm'` | `'confirm'`: sentuh = dengar + pilih, lalu Kunci Jawaban (cocok untuk anak). `'tap'`: sentuh = langsung jawab (seperti Kahoot). |
| `autoReadQuestion` | `true` | Bacakan soal otomatis saat muncul. |
| `timer.enabled` / `timer.seconds` | `true` / `30` | Batas waktu per soal. |
| `timer.pauseWhileSpeaking` | `true` | Timer berhenti saat suara diputar. |
| `scoring.basePoints` | `1000` | Poin maksimal per soal. |
| `scoring.speedBonus` | `true` | Jawaban lebih cepat = poin lebih besar. |
| `scoring.streakBonus` | `100` | Bonus jawaban benar beruntun. |
| `starThresholds` | `80 / 50 / 1` | Batas akurasi untuk 3/2/1 bintang. |
| `shuffleQuestions` / `shuffleOptions` | `false` | Acak urutan soal / pilihan. |
| `speech.rate` | `0.92` | Kecepatan suara pembaca. |
| `leaderboard.enabled` | `true` | Papan peringkat (tersimpan di browser perangkat). |

### 4.6 Warna & teks
- Warna bawaan tombol pilihan, kartu, dan latar: `THEME` di `gameConfig.js` (kelas Tailwind).
- Semua teks antarmuka (tombol, label, pesan): `UI_TEXT` di `gameConfig.js`.
- Font: `index.html` (link Google Fonts) + `--font-sans` / `--font-display` di `src/index.css`.

---

## 5. Catatan Teknis

- **Kualitas suara TTS** tergantung browser & sistem operasi. Hasil terbaik: Chrome/Edge (suara
  Google / Microsoft Natural) dan Safari iOS. Untuk Bahasa Indonesia di Windows, Edge biasanya
  menyediakan suara "Microsoft Gadis Online (Natural)". Jika pelafalan kritis, pakai rekaman `.mp3`.
- **Kebijakan autoplay browser:** suara baru bisa diputar setelah ada interaksi pertama
  (tombol "Mulai Belajar" sudah memenuhi syarat ini).
- **Aset baru tidak muncul?** Hasil pengecekan gambar disimpan sementara; refresh halaman setelah menambah file.
- **Papan peringkat** saat ini lokal per perangkat. Untuk peringkat kelas bersama, ganti isi
  `src/lib/leaderboard.js` dengan panggilan ke backend (Firebase/Supabase) — komponen lain tidak berubah.
- **Aksesibilitas:** navigasi keyboard (angka 1–4 memilih, Enter mengunci), fokus terlihat, dan
  animasi dikurangi otomatis bagi pengguna dengan pengaturan *reduce motion*.
