/**
 * =====================================================================
 *  questionsData.js — BANK SOAL
 * =====================================================================
 *  Format satu soal:
 *  {
 *    id:          'q1',                 // unik
 *    lang:        'id-ID' | 'en-US',    // bahasa suara untuk soal & penjelasan
 *    question:    'Teks soal',          // teks yang TAMPIL
 *    speak:       '',                   // (opsional) teks khusus untuk DIBACAKAN
 *                                       //   misal "7 × 8" → "tujuh dikali delapan"
 *    audio:       '',                   // (opsional) file suara rekaman: audio('voice/q1.mp3')
 *                                       //   jika file ada → diputar; jika tidak → Text-to-Speech
 *    image:       canva('questions/q1.png'), // (opsional) ilustrasi Canva 1200×675 px
 *    emoji:       '🪐',                 // (opsional) pengganti gambar bila belum ada
 *    timeLimit:   30,                   // (opsional) batas waktu khusus soal ini (detik)
 *    options: [                         // 2 sampai 4 pilihan
 *      { id: 'a', text: 'Mars', lang?: 'en-US', speak?: '', audio?: '' },
 *    ],
 *    correct:     'a',                  // id pilihan yang benar
 *    explanation: 'Penjelasan singkat', // (opsional) tampil setelah menjawab
 *    explanationSpeak: '',              // (opsional) versi bacaan penjelasan
 *    explanationLang:  '',              // (opsional) bahasa penjelasan jika beda dari soal
 *    explanationAudio: '',              // (opsional) file suara penjelasan
 *  }
 * =====================================================================
 */
// Bila memakai file suara rekaman, ubah menjadi: import { audio, canva } from '../config/gameConfig';
import { canva } from '../config/gameConfig';

export const QUESTIONS = [
  // 1 — Bahasa Indonesia · 4 pilihan · dengan slot gambar
  {
    id: 'q1',
    lang: 'id-ID',
    question: 'Planet manakah yang dikenal sebagai "Planet Merah"?',
    audio: '', // contoh file rekaman: audio('voice/q1.mp3')
    image: canva('questions/q1.png'),
    emoji: '🪐',
    options: [
      { id: 'a', text: 'Mars' },
      { id: 'b', text: 'Venus' },
      { id: 'c', text: 'Jupiter' },
      { id: 'd', text: 'Saturnus' },
    ],
    correct: 'a',
    explanation:
      'Mars tampak kemerahan karena permukaannya banyak mengandung besi oksida — mirip karat pada besi.',
  },

  // 2 — English · 4 pilihan
  {
    id: 'q2',
    lang: 'en-US',
    question: 'Which animal is known as the "King of the Jungle"?',
    image: canva('questions/q2.png'),
    emoji: '🦁',
    options: [
      { id: 'a', text: 'Elephant' },
      { id: 'b', text: 'Lion' },
      { id: 'c', text: 'Tiger' },
      { id: 'd', text: 'Giraffe' },
    ],
    correct: 'b',
    explanation:
      'The lion is called the King of the Jungle because of its strength, its loud roar, and its majestic mane.',
  },

  // 3 — Bahasa Indonesia · demo `speak` (teks bacaan berbeda dari teks tampilan)
  {
    id: 'q3',
    lang: 'id-ID',
    question: 'Berapakah hasil dari 7 × 8?',
    speak: 'Berapakah hasil dari tujuh dikali delapan?',
    image: canva('questions/q3.png'),
    emoji: '🧮',
    timeLimit: 20,
    options: [
      { id: 'a', text: '54' },
      { id: 'b', text: '48' },
      { id: 'c', text: '56' },
      { id: 'd', text: '64' },
    ],
    correct: 'c',
    explanation: '7 × 8 = 56. Trik mudah mengingatnya: 5, 6, 7, 8 → 56 = 7 × 8!',
    explanationSpeak:
      'Tujuh dikali delapan sama dengan lima puluh enam. Trik mudah mengingatnya: lima, enam, tujuh, delapan. Lima puluh enam sama dengan tujuh dikali delapan!',
  },

  // 4 — English · 2 pilihan (Benar / Salah)
  {
    id: 'q4',
    lang: 'en-US',
    question: 'True or False: The Sun rises in the West.',
    image: canva('questions/q4.png'),
    emoji: '🌅',
    options: [
      { id: 'a', text: 'True' },
      { id: 'b', text: 'False' },
    ],
    correct: 'b',
    explanation: 'False! The Sun rises in the East and sets in the West.',
  },

  // 5 — Soal Bahasa Indonesia, pilihan jawaban Bahasa Inggris (bahasa per teks) · 3 pilihan
  {
    id: 'q5',
    lang: 'id-ID',
    question: 'Apa bahasa Inggris dari kata "Kucing"?',
    image: canva('questions/q5.png'),
    emoji: '🐱',
    options: [
      { id: 'a', text: 'Dog', lang: 'en-US' },
      { id: 'b', text: 'Cat', lang: 'en-US' },
      { id: 'c', text: 'Bird', lang: 'en-US' },
    ],
    correct: 'b',
    explanation: '"Kucing" dalam bahasa Inggris adalah "Cat". Dog artinya anjing, Bird artinya burung.',
    explanationSpeak:
      'Kucing dalam bahasa Inggris adalah Cat. Dog artinya anjing. Bird artinya burung.',
  },
];
