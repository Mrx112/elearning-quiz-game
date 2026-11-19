/**
 * templates.js — Template slide & elemen baru untuk Admin Panel.
 */
import M from '../data/assetManifest.json';
import { SKINS, TEXT_PRESETS } from '../data/defaultSlides';
import { uid } from '../lib/projectStore';

const baseEl = {
  anim: 'pop',
  loop: 'none',
  delay: 0,
  speakText: '',
  audio: '',
  lang: 'auto',
  action: 'none',
  highlight: false,
  autoRead: false,
};

export function newText(extra = {}) {
  return {
    ...baseEl,
    id: uid('teks'),
    kind: 'text',
    text: 'Teks baru — klik untuk mengedit',
    x: 25,
    y: 8,
    w: 50,
    h: 12,
    anim: 'fade',
    style: { ...TEXT_PRESETS.question, skin: '', glow: false },
    ...extra,
  };
}

export function newOption(extra = {}) {
  return {
    ...baseEl,
    id: uid('opsi'),
    kind: 'option',
    text: 'Jawaban',
    correct: false,
    src: '',
    x: 40,
    y: 40,
    w: 18,
    h: 11,
    style: { ...TEXT_PRESETS.option, skin: SKINS.cream, glow: false },
    ...extra,
  };
}

export function newImage(src = '', box = null, extra = {}) {
  const pos = box
    ? { x: (box[0] / 1920) * 100, y: (box[1] / 1080) * 100, w: ((box[2] - box[0]) / 1920) * 100, h: ((box[3] - box[1]) / 1080) * 100 }
    : { x: 35, y: 30, w: 30, h: 40 };
  return { ...baseEl, id: uid('gambar'), kind: 'image', src, ...pos, ...extra };
}

export function newHotspot(extra = {}) {
  return { ...baseEl, id: uid('area'), kind: 'hotspot', x: 40, y: 40, w: 15, h: 20, anim: 'none', speakText: 'Teks yang dibacakan', ...extra };
}

/** Kuis n pilihan, susunan otomatis. */
function quizOptions(n) {
  const w = n <= 2 ? 22 : n === 3 ? 20 : 18;
  const gap = 4;
  const total = n * w + (n - 1) * gap;
  const start = (100 - total) / 2;
  return Array.from({ length: n }, (_, i) =>
    newOption({ text: `Pilihan ${i + 1}`, correct: i === 0, x: start + i * (w + gap), y: 22, w, h: 12, delay: i * 0.12 }),
  );
}

export const SLIDE_TEMPLATES = [
  { id: 'story', label: 'Slide cerita / materi', desc: 'Background + teks yang bisa dibacakan' },
  { id: 'quiz2', label: 'Kuis 2 pilihan', desc: 'Pertanyaan + 2 tombol jawaban' },
  { id: 'quiz3', label: 'Kuis 3 pilihan', desc: 'Pertanyaan + 3 tombol jawaban' },
  { id: 'quiz4', label: 'Kuis 4 pilihan', desc: 'Pertanyaan + 4 tombol jawaban' },
];

export function createSlide(template, background) {
  const id = uid('slide');
  const bg = background || M['s09-1']?.bg || 's09-1/bg.webp';
  if (template === 'story') {
    return {
      id,
      name: 'Slide baru',
      type: 'story',
      background: bg,
      reference: '',
      correctText: '',
      wrongMode: 'default',
      elements: [newText({ text: 'Tulis kalimat materi di sini.', style: { ...TEXT_PRESETS.story, skin: '', glow: true }, autoRead: true })],
    };
  }
  const n = { quiz2: 2, quiz3: 3, quiz4: 4 }[template] || 2;
  return {
    id,
    name: 'Kuis baru',
    type: 'quiz',
    background: bg,
    reference: '',
    correctText: 'Jawaban benar: Pilihan 1',
    wrongMode: 'default',
    elements: [newText({ text: 'Tulis pertanyaan di sini?', x: 20, y: 4, w: 60, h: 12, style: { ...TEXT_PRESETS.question, skin: SKINS.cream, glow: false }, autoRead: true, anim: 'drop' }), ...quizOptions(n)],
  };
}

/** Salin slide (id baru untuk slide & elemennya). */
export function cloneSlide(slide) {
  return {
    ...JSON.parse(JSON.stringify(slide)),
    id: uid('slide'),
    name: `${slide.name} (salinan)`,
    elements: slide.elements.map((e) => ({ ...JSON.parse(JSON.stringify(e)), id: uid(e.kind) })),
  };
}

/** Pustaka aset bawaan (semua layer ICT ELEMENT dalam bentuk cutout transparan). */
export const LIBRARY = Object.entries(M)
  .filter(([k]) => !k.startsWith('_'))
  .map(([key, entry]) => ({
    key,
    folder: entry.folder,
    items: [
      { name: 'background slide (bersih)', src: entry.bg, box: [0, 0, 1920, 1080], full: true },
      ...Object.values(entry.elements).map((e) => ({ name: e.src.split('/').pop().replace('.webp', ''), src: e.src, box: e.box })),
      ...entry.library,
    ],
  }));
