/**
 * =====================================================================
 *  gameConfig.js — PANEL KONTROL GAME
 * =====================================================================
 *  Klien cukup mengubah file ini (dan data/questionsData.js) untuk:
 *    1. ASSETS         → mengganti gambar dengan aset dari Canva
 *    2. SFX_FILES      → memakai file efek suara sendiri (opsional)
 *    3. THEME          → warna & gaya bawaan (dipakai bila aset belum ada)
 *    4. GAME_SETTINGS  → aturan main: timer, skor, mode jawab, suara
 *    5. UI_TEXT        → semua teks antarmuka
 *
 *  ATURAN EMAS ASET (graceful fallback):
 *   - Path diisi & file ADA          → gambar Canva yang tampil.
 *   - Path diisi tapi file BELUM ADA → otomatis memakai gaya Tailwind bawaan.
 *   - Path dikosongkan ('')          → selalu memakai gaya Tailwind bawaan.
 *   Jadi klien tinggal menaruh file dengan nama yang sama di folder
 *   /public/assets/canva/... lalu me-refresh browser.
 * =====================================================================
 */

const BASE = import.meta.env.BASE_URL; // ikut opsi `base` di vite.config.js

/** Path ke file di /public/assets/canva/  → contoh: canva('ui/logo.png') */
export const canva = (file) => `${BASE}assets/canva/${file}`;

/** Path ke file di /public/assets/audio/  → contoh: audio('voice/q1.mp3') */
export const audio = (file) => `${BASE}assets/audio/${file}`;

/* ---------------------------------------------------------------------
 * 1. ASSETS — SLOT GAMBAR CANVA
 *    Ukuran di komentar = ukuran EKSPOR yang disarankan dari Canva.
 * ------------------------------------------------------------------- */
export const ASSETS = {
  // ── LATAR BELAKANG ───────────────────────────────────────────────
  // 1920 × 1080 px · PNG/JPG · area penting di tengah (tepi bisa terpotong)
  background: canva('backgrounds/bg-main.png'),
  // 1080 × 1920 px · PNG/JPG · versi potret untuk HP (opsional)
  backgroundMobile: canva('backgrounds/bg-mobile.png'),

  // ── IDENTITAS ────────────────────────────────────────────────────
  // 1200 × 400 px · PNG transparan · logo / judul game di layar awal
  logo: canva('ui/logo.png'),

  // ── FRAME & TOMBOL ───────────────────────────────────────────────
  // Desain 800 × 450 px, ekspor 2× → 1600 × 900 px · PNG transparan
  // Bingkai kartu soal. Sisakan area kosong ±9% di tiap sisi untuk teks.
  cardFrame: canva('ui/card-frame.png'),

  // 800 × 200 px · PNG transparan · satu file per pilihan (A, B, C, D)
  // Teks jawaban berwarna putih → gunakan desain tombol yang cukup gelap/saturasi tinggi.
  optionButtons: [
    canva('ui/btn-option-1.png'),
    canva('ui/btn-option-2.png'),
    canva('ui/btn-option-3.png'),
    canva('ui/btn-option-4.png'),
  ],

  // 600 × 160 px · PNG transparan · tombol utama (Mulai, Kunci Jawaban, Main Lagi)
  primaryButton: canva('ui/btn-primary.png'),

  // ── KARAKTER / MASKOT ────────────────────────────────────────────
  // 512 × 512 px · PNG transparan
  mascot: {
    idle: canva('characters/mascot-idle.png'), // layar awal
    happy: canva('characters/mascot-happy.png'), // jawaban benar
    sad: canva('characters/mascot-sad.png'), // jawaban salah
  },

  // ── PENGHARGAAN ──────────────────────────────────────────────────
  // 512 × 512 px · PNG transparan · badge di layar hasil
  badges: {
    gold: canva('badges/badge-gold.png'), // akurasi ≥ 80%
    silver: canva('badges/badge-silver.png'), // akurasi ≥ 50%
    bronze: canva('badges/badge-bronze.png'), // di bawah 50%
  },
  // 256 × 256 px · PNG transparan · bintang hasil (menyala / redup)
  stars: {
    on: canva('badges/star-on.png'),
    off: canva('badges/star-off.png'),
  },
};

/* ---------------------------------------------------------------------
 * 2. SFX_FILES — EFEK SUARA CUSTOM (opsional)
 *    Kosong ('') = memakai synthesizer bawaan (Web Audio API).
 *    Contoh: correct: audio('sfx/correct.mp3')
 * ------------------------------------------------------------------- */
export const SFX_FILES = {
  click: '',
  select: '',
  correct: '',
  wrong: '',
  win: '',
  tick: '',
};

/* ---------------------------------------------------------------------
 * 3. THEME — GAYA BAWAAN (FALLBACK TAILWIND)
 *    Dipakai selama aset Canva belum tersedia.
 * ------------------------------------------------------------------- */
export const THEME = {
  background: 'bg-linear-to-br from-indigo-700 via-violet-600 to-fuchsia-500',
  card: 'bg-white/95 shadow-2xl shadow-indigo-950/30 ring-1 ring-white/60',
  // Padding kartu soal saat memakai card-frame Canva (agar teks tidak menabrak bingkai)
  cardSkinPadding: 'px-[9%] py-[8%]',
  // Warna & bentuk tiap pilihan jawaban (urutan A, B, C, D)
  options: [
    { shape: 'triangle', className: 'bg-rose-500 enabled:hover:bg-rose-400 border-rose-700' },
    { shape: 'diamond', className: 'bg-sky-500 enabled:hover:bg-sky-400 border-sky-700' },
    { shape: 'circle', className: 'bg-amber-500 enabled:hover:bg-amber-400 border-amber-700' },
    { shape: 'square', className: 'bg-emerald-500 enabled:hover:bg-emerald-400 border-emerald-700' },
  ],
  optionText: 'text-white drop-shadow-[0_2px_0_rgba(0,0,0,0.25)]',
  // Emoji pengganti maskot bila gambar maskot belum ada
  mascotEmoji: { idle: '🦉', happy: '🥳', sad: '🤗' },
};

/* ---------------------------------------------------------------------
 * 4. GAME_SETTINGS — ATURAN MAIN
 * ------------------------------------------------------------------- */
export const GAME_SETTINGS = {
  title: 'Petualangan Kuis',
  subtitle: 'Belajar sambil bermain — sentuh teks untuk mendengarkan!',

  /**
   * Mode menjawab:
   *  'confirm' → sentuh pilihan = dibacakan + dipilih, lalu tekan "Kunci Jawaban".
   *              (disarankan untuk anak-anak: bisa mendengar dulu sebelum menjawab)
   *  'tap'     → sentuh pilihan = langsung menjawab (seperti Kahoot);
   *              dengarkan lewat ikon speaker di tiap pilihan.
   */
  answerMode: 'confirm',

  /** Bacakan soal otomatis setiap kali soal baru muncul. */
  autoReadQuestion: true,

  timer: {
    enabled: true,
    seconds: 30, // batas waktu default per soal (bisa ditimpa per soal via `timeLimit`)
    pauseWhileSpeaking: true, // waktu berhenti saat suara sedang dibacakan
  },

  scoring: {
    basePoints: 1000, // poin maksimal per jawaban benar
    speedBonus: true, // makin cepat menjawab → makin besar poin (min. 50% dari basePoints)
    streakBonus: 100, // tambahan poin per jawaban benar beruntun (mulai jawaban ke-2)
  },

  // Batas akurasi (%) untuk jumlah bintang di layar hasil
  starThresholds: { three: 80, two: 50, one: 1 },

  shuffleQuestions: false,
  shuffleOptions: false,

  // Nilai awal pengaturan di layar awal (pilihan pemain disimpan di browser)
  defaults: { sfx: true, voice: true, voiceLang: 'auto' },

  speech: {
    defaultLang: 'id-ID', // dipakai bila teks tidak punya `lang`
    rate: 0.92, // kecepatan bicara (0.5 – 2) — sedikit lebih lambat agar jelas
    pitch: 1.05,
    volume: 1,
  },

  leaderboard: {
    enabled: true,
    size: 5, // jumlah skor teratas yang disimpan
    storageKey: 'kuis-leaderboard-v1',
  },
  settingsStorageKey: 'kuis-settings-v1',
};

/* ---------------------------------------------------------------------
 * 5. UI_TEXT — SEMUA TEKS ANTARMUKA
 * ------------------------------------------------------------------- */
export const UI_TEXT = {
  playerNameLabel: 'Nama Pemain (opsional)',
  playerNamePlaceholder: 'Tulis namamu…',
  anonymousPlayer: 'Pemain',
  play: 'Mulai Belajar',
  sfxLabel: 'Efek Suara (SFX)',
  sfxDesc: 'Klik, benar, salah & fanfare',
  voiceLabel: 'Suara Pembaca',
  voiceDesc: 'Bacakan teks saat disentuh',
  voiceLangLabel: 'Bahasa Suara',
  voiceLangOptions: [
    { value: 'auto', label: 'Otomatis' },
    { value: 'id-ID', label: 'Indonesia' },
    { value: 'en-US', label: 'English' },
  ],
  voiceLangHint: 'Otomatis = mengikuti bahasa setiap soal & pilihan.',
  voiceTest: 'Tes suara',
  voiceTestText: {
    'id-ID': 'Halo! Sentuh teks mana saja untuk mendengarkan.',
    'en-US': 'Hello! Tap any text to listen.',
  },
  noSpeech: 'Browser ini belum mendukung suara pembaca. Gunakan Chrome, Edge, atau Safari terbaru.',
  questionCount: (n) => `${n} soal`,
  perQuestion: (s) => `${s} detik/soal`,
  noTimer: 'tanpa batas waktu',

  question: 'Soal',
  tapToListen: 'Sentuh teks untuk mendengarkan',
  confirmHint: 'Sentuh pilihan untuk mendengar & memilih, lalu tekan Kunci Jawaban.',
  tapHint: 'Sentuh pilihan untuk menjawab · tekan ikon speaker untuk mendengar.',
  confirm: 'Kunci Jawaban',
  chooseFirst: 'Pilih jawaban dulu',
  timerPaused: 'Waktu dijeda saat suara diputar',
  streak: (n) => `${n}× beruntun!`,

  correct: 'Benar!',
  wrong: 'Kurang Tepat!',
  timeUp: 'Waktu Habis!',
  points: 'poin',
  streakBonus: 'bonus beruntun',
  correctAnswerIs: 'Jawaban yang benar:',
  explanation: 'Penjelasan',
  next: 'Soal Berikutnya',
  seeResult: 'Lihat Hasil',

  quit: 'Keluar',
  quitTitle: 'Keluar dari permainan?',
  quitBody: 'Progres permainan saat ini akan hilang.',
  quitYes: 'Ya, keluar',
  quitNo: 'Lanjut main',

  correctCount: 'Benar',
  wrongCount: 'Salah',
  accuracy: 'Akurasi',
  replay: 'Main Lagi',
  review: 'Review Jawaban',
  home: 'Kembali ke Menu Awal',
  leaderboard: 'Papan Peringkat',
  leaderboardEmpty: 'Belum ada skor tersimpan.',
  you: 'Kamu',

  reviewTitle: 'Review Jawaban',
  backToResult: 'Kembali ke Hasil',
  yourAnswer: 'Jawabanmu',
  notAnswered: 'Tidak dijawab (waktu habis)',

  tiers: {
    3: { title: 'Luar Biasa', message: 'Kamu menguasai materi ini. Pertahankan!' },
    2: { title: 'Hebat', message: 'Sedikit lagi menuju sempurna. Ayo ulangi!' },
    1: { title: 'Bagus', message: 'Terus berlatih, kamu pasti bisa!' },
    0: { title: 'Ayo Coba Lagi', message: 'Jangan menyerah — dengarkan penjelasannya lalu ulangi.' },
  },
  langNames: { 'id-ID': 'Bahasa Indonesia', 'en-US': 'English' },
};
