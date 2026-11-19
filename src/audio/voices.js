/**
 * voices.js — Memilih suara TTS terbaik & mendeteksi bahasa teks (Inggris / Indonesia).
 */
const normalize = (lang = '') => lang.replace('_', '-').toLowerCase();
const QUALITY = /google|natural|neural|online|siri|premium|enhanced/i;

export function pickVoice(voices, lang) {
  if (!voices?.length || !lang) return null;
  const target = normalize(lang);
  const base = target.split('-')[0];
  const exact = voices.filter((v) => normalize(v.lang) === target);
  const sameBase = voices.filter((v) => normalize(v.lang).split('-')[0] === base);
  const pool = exact.length ? exact : sameBase;
  return pool.find((v) => QUALITY.test(v.name)) || pool.find((v) => v.default) || pool[0] || null;
}

// Kata-kata umum bahasa Indonesia → dipakai untuk deteksi otomatis
const ID_WORDS = new Set(
  (
    'yang dan di ke dari ini itu apa siapa adalah ada tidak bukan dengan untuk pada saya kamu kita kami ' +
    'mereka dia akan sudah belum bisa harus jawaban benar salah coba lagi hebat bagus pilih hewan warna ' +
    'besar kecil tinggi pendek makan rumput daging ayah ibu anak rumah mobil lampu merah kuning hijau ' +
    'berapa bagaimana mengapa kenapa dimana kapan sedang juga atau tetapi lihat ayo mari selamat terima kasih'
  ).split(' '),
);

/** Tebak bahasa teks. Mengembalikan 'id-ID' bila mayoritas kata dikenali sebagai bahasa Indonesia. */
export function detectLang(text = '', fallback = 'en-US') {
  const words = text.toLowerCase().match(/[a-z]+/g);
  if (!words?.length) return fallback;
  const hits = words.filter((w) => ID_WORDS.has(w)).length;
  return hits / words.length >= 0.3 || (hits >= 2 && words.length <= 6) ? 'id-ID' : fallback === 'id-ID' ? 'en-US' : fallback;
}
