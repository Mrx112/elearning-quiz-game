/**
 * sfx.js — Efek suara instan dengan Web Audio API (tanpa file).
 * File audio custom "Benar"/"Salah" dari Admin Panel ditangani AudioProvider;
 * bila tidak ada / gagal diputar, synthesizer di bawah ini yang dipakai.
 */

let ctx = null;

/** AudioContext dibuat sekali, setelah ada interaksi pengguna (aturan browser). */
function getContext() {
  if (typeof window === 'undefined') return null;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

/** Satu nada sederhana dengan envelope (fade in/out) agar tidak "klik". */
function tone(ac, { freq, start = 0, duration = 0.15, type = 'sine', gain = 0.2, slideTo }) {
  const t0 = ac.currentTime + start;
  const osc = ac.createOscillator();
  const amp = ac.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + duration);

  amp.gain.setValueAtTime(0.0001, t0);
  amp.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

  osc.connect(amp).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.05);
}

// Frekuensi not musik (Hz)
const N = { C5: 523.25, E5: 659.25, G5: 783.99, C6: 1046.5, E6: 1318.5, G6: 1568 };

/** Resep tiap efek suara. */
const SYNTHS = {
  click: (ac) => tone(ac, { freq: 620, slideTo: 940, duration: 0.07, type: 'triangle', gain: 0.14 }),

  select: (ac) => tone(ac, { freq: 480, slideTo: 760, duration: 0.1, type: 'sine', gain: 0.16 }),

  // "Ding" naik: arpeggio C-E-G-C
  correct: (ac) => {
    [N.C5, N.E5, N.G5, N.C6].forEach((freq, i) =>
      tone(ac, { freq, start: i * 0.07, duration: 0.35, type: 'sine', gain: 0.18 }),
    );
    tone(ac, { freq: N.G6, start: 0.28, duration: 0.5, type: 'triangle', gain: 0.07 });
  },

  // "Buzz" turun
  wrong: (ac) => {
    tone(ac, { freq: 220, slideTo: 120, duration: 0.28, type: 'sawtooth', gain: 0.1 });
    tone(ac, { freq: 180, slideTo: 85, start: 0.2, duration: 0.38, type: 'square', gain: 0.07 });
  },

  // Fanfare kemenangan
  win: (ac) => {
    const melody = [
      [N.C5, 0, 0.14],
      [N.E5, 0.14, 0.14],
      [N.G5, 0.28, 0.14],
      [N.C6, 0.42, 0.3],
      [N.G5, 0.74, 0.12],
      [N.C6, 0.88, 0.7],
    ];
    melody.forEach(([freq, start, duration]) =>
      tone(ac, { freq, start, duration, type: 'triangle', gain: 0.18 }),
    );
    [N.C5, N.E5, N.G5].forEach((freq) =>
      tone(ac, { freq, start: 0.88, duration: 0.9, type: 'sine', gain: 0.08 }),
    );
    tone(ac, { freq: N.E6, start: 1.0, duration: 0.6, type: 'sine', gain: 0.05 });
  },

  // Desir saat pindah slide
  whoosh: (ac) => tone(ac, { freq: 300, slideTo: 900, duration: 0.18, type: 'sine', gain: 0.06 }),
};

/** Panggil dari klik pertama agar AudioContext aktif (aturan autoplay browser). */
export function unlockAudio() {
  getContext();
}

/**
 * Putar efek suara synthesizer.
 * @param {keyof SYNTHS} name
 */
export function playSfx(name) {
  // dipakai skrip perekam video demo (docs/tools/record_demo.py) untuk menyinkronkan suara
  if (typeof window !== 'undefined' && Array.isArray(window.__sfxLog)) window.__sfxLog.push({ name, t: Date.now() });
  const ac = getContext();
  const recipe = SYNTHS[name];
  if (ac && recipe) recipe(ac);
}
