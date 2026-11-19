/**
 * defaultSlides.js — Isi bawaan game, dirangkai dari aset Canva "ICT ELEMENT".
 *
 * Posisi & ukuran elemen diambil dari assetManifest.json (hasil scripts/build_assets.py)
 * sehingga tata letaknya sama persis dengan desain "gambaran" di Canva.
 *
 * Koordinat elemen memakai PERSEN dari panggung 16:9 (x, y, w, h).
 * Ukuran font memakai "px desain" pada kanvas 1920 × 1080 (otomatis diskalakan).
 *
 * Proyek ini juga yang dipulihkan oleh tombol "Reset ke Default" di Admin Panel.
 */
import M from './assetManifest.json';

export const PROJECT_VERSION = 2;

const r1 = (v) => Math.round(v * 100) / 100;
const pct = ([x0, y0, x1, y1]) => ({
  x: r1((x0 / 1920) * 100),
  y: r1((y0 / 1080) * 100),
  w: r1(((x1 - x0) / 1920) * 100),
  h: r1(((y1 - y0) / 1080) * 100),
});
const grow = ([x0, y0, x1, y1], dx, dy = dx) => [x0 - dx, y0 - dy, x1 + dx, y1 + dy];

export const SKINS = {
  cream: M._ui.buttonCream,
  pink: M._ui.buttonPink,
};

/* Gaya teks siap pakai (bisa diubah per elemen di Admin Panel) */
export const TEXT_PRESETS = {
  story: { font: 'story', size: 50, color: '#a8231f', weight: 700, italic: true, align: 'center', lineHeight: 1.34 },
  bubble: { font: 'story', size: 62, color: '#a8231f', weight: 700, italic: true, align: 'center', lineHeight: 1.2 },
  question: { font: 'spartan', size: 66, color: '#000000', weight: 700, italic: false, align: 'center', lineHeight: 1.15 },
  questionSans: { font: 'sans', size: 76, color: '#000000', weight: 700, italic: false, align: 'center', lineHeight: 1.2 },
  option: { font: 'spartan', size: 60, color: '#000000', weight: 700, italic: false, align: 'center', lineHeight: 1 },
  optionSans: { font: 'sans', size: 62, color: '#000000', weight: 700, italic: false, align: 'center', lineHeight: 1 },
  label: { font: 'sans', size: 44, color: '#000000', weight: 700, italic: false, align: 'center', lineHeight: 1 },
  title: { font: 'fun', size: 118, color: '#000000', weight: 400, italic: false, align: 'center', lineHeight: 1, letterSpacing: 0.12 },
};

const el = (id, data) => ({
  id,
  kind: 'image',
  x: 0,
  y: 0,
  w: 10,
  h: 10,
  anim: 'pop',
  loop: 'none',
  delay: 0,
  speakText: '',
  audio: '',
  lang: 'auto',
  action: 'none',
  highlight: false,
  ...data,
});

/** Gambar (karakter/hewan/objek) dari manifest. */
const img = (sk, key, extra = {}) =>
  el(`${sk}-${key}`, { kind: 'image', src: M[sk].elements[key].src, ...pct(M[sk].elements[key].box), ...extra });

/** Teks biasa (tanpa kotak). */
const text = (id, box, value, preset, { style, ...rest } = {}) =>
  el(id, {
    kind: 'text',
    text: value,
    ...pct(box),
    anim: 'fade',
    autoRead: false,
    ...rest,
    style: { ...TEXT_PRESETS[preset], skin: '', glow: false, ...style },
  });

/** Teks di atas kotak tombol (skin). */
const boxed = (id, box, value, preset, skin = SKINS.cream, { style, ...rest } = {}) =>
  text(id, box, value, preset, { ...rest, style: { skin, ...style } });

/** Pilihan jawaban kuis. */
const option = (id, box, label, correct, preset = 'option', { style, ...rest } = {}) =>
  el(id, {
    kind: 'option',
    text: label,
    correct,
    src: '',
    ...pct(box),
    anim: 'pop',
    ...rest,
    style: { ...TEXT_PRESETS[preset], skin: SKINS.cream, glow: false, ...style },
  });

/** Area sentuh tak terlihat di atas gambar background. */
const hotspot = (id, box, speakText) => el(id, { kind: 'hotspot', ...pct(box), speakText, anim: 'none' });

const slide = (sk, data) => ({
  id: sk,
  name: '',
  type: 'story',
  background: M[sk].bg,
  reference: M[sk].reference,
  correctText: '',
  wrongMode: 'default',
  elements: [],
  ...data,
});

/* ─── posisi bantu ─── */
const S = (sk) => M[sk];
const trafficOptions = (sk, centerX, correct) => {
  const w = 200;
  const gap = 24;
  const y0 = S(sk).texts.kalimat[3] + 28;
  const start = centerX - (w * 3 + gap * 2) / 2;
  const colors = { Red: '#d62828', Yellow: '#d99100', Green: '#2e9e44' };
  return ['Red', 'Yellow', 'Green'].map((c, i) =>
    option(`${sk}-opt-${c.toLowerCase()}`, [start + i * (w + gap), y0, start + i * (w + gap) + w, y0 + 82], c, c === correct, 'optionSans', {
      style: { color: colors[c], size: 50 },
      delay: 0.15 * i,
    }),
  );
};
const centerOf = ([x0, , x1]) => (x0 + x1) / 2;

const mapSlide = (sk, name, target) => {
  const R = S(sk).rects;
  const labels = [
    ['air-paradise', 'air paradise'],
    ['wild-safari', 'wild safari'],
    ['sea-world', 'sea world'],
  ];
  return slide(sk, {
    name,
    type: 'story',
    elements: labels.map(([k, label], i) =>
      boxed(`${sk}-${k}`, R[k], label, 'label', SKINS.pink, {
        anim: 'pop',
        delay: 0.15 * i,
        action: k === target ? 'next' : 'none',
        highlight: k === target,
      }),
    ),
  });
};

/**
 * Ukuran font hasil kalibrasi terhadap desain Canva (lebar teks render = lebar teks di layer asli).
 * Dihasilkan dengan mengukur teks tiap slide; ubah per elemen lewat Admin Panel bila perlu.
 */
const FONT_SIZES = {
  's01-kalimat': 53, 's02-father': 86, 's02-mother': 82, 's03-letsgo': 70,
  's04-kalimat': 50, 's05-kalimat': 50, 's06-kalimat': 46,
  's09-air-paradise': 62, 's09-wild-safari': 62, 's09-sea-world': 62,
  's11-air-paradise': 62, 's11-wild-safari': 62, 's11-sea-world': 62,
  's14-air-paradise': 62, 's14-wild-safari': 62, 's14-sea-world': 62,
  's09-1-question': 92, 's09-1-opt-swan': 104, 's09-1-opt-rabbit': 104,
  's10-question': 92, 's10-opt-butterfly': 102, 's10-opt-bird': 102,
  's11-1-question': 93, 's11-1-opt-big': 76, 's11-1-opt-small': 76,
  's12-question': 112, 's12-opt-meat': 110, 's12-opt-grass': 110,
  's13-question': 112, 's13-opt-yes': 84, 's13-opt-no': 84,
  's14-1-monkey': 112, 's15-turtle': 100, 's15-dolphin': 100, 's15-whale': 106,
  's16-thanks': 128,
};

export function createDefaultSlides() {
  return buildSlides().map((s) => ({
    ...s,
    elements: s.elements.map((e) => (FONT_SIZES[e.id] && e.style ? { ...e, style: { ...e.style, size: FONT_SIZES[e.id] } } : e)),
  }));
}

function buildSlides() {
  return [
    slide('s01', {
      name: 'Pembuka — Hello, I’m Liam!',
      elements: [
        img('s01', 'ayah', { anim: 'slide-left', speakText: 'Father', delay: 0.1 }),
        img('s01', 'ibu', { anim: 'slide-right', speakText: 'Mother', delay: 0.2 }),
        img('s01', 'liam', { anim: 'pop', loop: 'bounce', speakText: 'Liam', delay: 0.35 }),
        text('s01-kalimat', grow(S('s01').texts.kalimat, 20, 6), 'Hello, I’m Liam! Today,\nI’m going to the zoo with\nmy parents', 'story', {
          autoRead: true,
          delay: 0.5,
        }),
      ],
    }),
    slide('s02', {
      name: 'Kenalan — Father & Mother',
      elements: [
        img('s02', 'ayah', { anim: 'slide-left', speakText: 'Father' }),
        img('s02', 'ibu', { anim: 'slide-right', speakText: 'Mother' }),
        img('s02', 'bubble-ayah', { anim: 'pop', delay: 0.4 }),
        img('s02', 'bubble-ibu', { anim: 'pop', delay: 0.6 }),
        text('s02-father', [560, 120, 920, 215], 'Father', 'bubble', { delay: 0.45, autoRead: true }),
        text('s02-mother', [890, 355, 1250, 455], 'Mother', 'bubble', { delay: 0.65, autoRead: true }),
      ],
    }),
    slide('s03', {
      name: 'Berangkat — Let’s go!',
      elements: [
        img('s03', 'mobil', { anim: 'slide-left', loop: 'rumble', speakText: 'Car' }),
        img('s03', 'bubble', { anim: 'pop', delay: 0.5 }),
        text('s03-letsgo', [1370, 270, 1740, 370], 'Let’s go!!!', 'bubble', {
          style: { color: '#111111', size: 58 },
          delay: 0.55,
          autoRead: true,
        }),
      ],
    }),
    ...[
      ['s04', 'Lampu Merah', 'Red', 'merah'],
      ['s05', 'Lampu Kuning', 'Yellow', 'kuning'],
      ['s06', 'Lampu Hijau', 'Green', 'hijau'],
    ].map(([sk, name, color]) => {
      const tcolor = { Red: '#b0222a', Yellow: '#e8913a', Green: '#4c9a3f' }[color];
      const tb = S(sk).texts.kalimat;
      return slide(sk, {
        name: `Kuis — ${name}`,
        type: 'quiz',
        correctText: `Jawaban benar: ${color}`,
        elements: [
          img(sk, 'mobil', { anim: 'slide-left', loop: 'rumble', speakText: 'Car' }),
          img(sk, 'lampu', { anim: 'drop', speakText: `Traffic light. The light is ${color.toLowerCase()}.` }),
          img(sk, 'panah', { anim: 'fade', loop: 'pulse', delay: 0.4 }),
          text(`${sk}-kalimat`, grow(tb, 24, 4), 'Look at the traffic light!!\nWhat is the color?', 'story', {
            style: { color: tcolor, size: 40, glow: true },
            autoRead: true,
            delay: 0.2,
          }),
          ...trafficOptions(sk, centerOf(tb), color),
        ],
      });
    }),
    slide('s08', {
      name: 'Sampai di Kebun Binatang',
      elements: [
        img('s08', 'mobil', { anim: 'slide-left', speakText: 'Car' }),
        img('s08', 'bubble', { anim: 'pop', delay: 0.6 }),
        (() => {
          const [x0, y0, x1] = S('s08').elements.bubble.box;
          const w = x1 - x0;
          return text('s08-arrive', [x0 + w * 0.08, y0 + 25, x1 - w * 0.08, y0 + 175], 'Yeay!!! We are arrive >.<', 'bubble', {
            style: { color: '#111111', size: 34, lineHeight: 1.45 },
            speakText: 'Yeay! We are arrive!',
            delay: 0.7,
            autoRead: true,
          });
        })(),
        hotspot('s08-zoo', [800, 60, 1160, 200], 'Zoo'),
        hotspot('s08-giraffe', [410, 520, 560, 900], 'Giraffe'),
        hotspot('s08-monkey', [320, 170, 460, 330], 'Monkey'),
      ],
    }),
    mapSlide('s09', 'Peta — Air Paradise', 'air-paradise'),
    slide('s09-1', {
      name: 'Kuis — Swan',
      type: 'quiz',
      correctText: 'Jawaban benar: swan',
      elements: [
        img('s09-1', 'angsa', { anim: 'fade', loop: 'float', speakText: 'Swan' }),
        boxed('s09-1-question', S('s09-1').rects.question, 'What is this animal?', 'question', SKINS.cream, { autoRead: true, anim: 'drop' }),
        option('s09-1-opt-swan', S('s09-1').rects['opt-swan'], 'swan', true),
        option('s09-1-opt-rabbit', S('s09-1').rects['opt-rabbit'], 'rabbit', false, 'option', { delay: 0.15 }),
      ],
    }),
    slide('s10', {
      name: 'Kuis — Butterfly',
      type: 'quiz',
      correctText: 'Jawaban benar: butterfly',
      elements: [
        img('s10', 'kupu', { anim: 'fade', loop: 'flutter', speakText: 'Butterfly' }),
        boxed('s10-question', [545, 28, 1422, 186], 'What is this animal?', 'question', SKINS.cream, { autoRead: true, anim: 'drop', style: { size: 70 } }),
        option('s10-opt-butterfly', S('s10').rects['opt-butterfly'], 'butterfly', true, 'option', { style: { size: 66 } }),
        option('s10-opt-bird', S('s10').rects['opt-bird'], 'bird', false, 'option', { delay: 0.15, style: { size: 66 } }),
      ],
    }),
    mapSlide('s11', 'Peta — Wild Safari', 'wild-safari'),
    slide('s11-1', {
      name: 'Kuis — Elephant',
      type: 'quiz',
      correctText: 'Jawaban benar: big',
      elements: [
        img('s11-1', 'gajah', { anim: 'fade', speakText: 'Elephant' }),
        text('s11-1-question', grow(S('s11-1').texts.question, 10, 4), 'Is the elephant big or small?', 'question', { autoRead: true, anim: 'drop', style: { size: 70 } }),
        option('s11-1-opt-big', S('s11-1').rects['opt-big'], 'Big', true, 'optionSans', { style: { size: 54 } }),
        option('s11-1-opt-small', S('s11-1').rects['opt-small'], 'small', false, 'optionSans', { delay: 0.15, style: { size: 54 } }),
      ],
    }),
    slide('s12', {
      name: 'Kuis — Leopard',
      type: 'quiz',
      correctText: 'Jawaban benar: meat',
      elements: [
        hotspot('s12-leopard', [40, 420, 800, 1060], 'Leopard'),
        text('s12-question', grow(S('s12').texts.question, 10, 4), 'What does the animal\nbeside it eat?', 'questionSans', { autoRead: true, anim: 'drop' }),
        option('s12-opt-meat', S('s12').rects['opt-meat'], 'meat', true, 'optionSans', { style: { size: 76 } }),
        option('s12-opt-grass', S('s12').rects['opt-grass'], 'grass', false, 'optionSans', { delay: 0.15, style: { size: 76 } }),
      ],
    }),
    slide('s13', {
      name: 'Kuis — Giraffe',
      type: 'quiz',
      correctText: 'Jawaban benar: Yes',
      elements: [
        img('s13', 'jerapah', { anim: 'fade', speakText: 'Giraffe' }),
        text('s13-question', grow(S('s13').texts.question, 10, 4), 'Is the giraffe tall?', 'questionSans', { autoRead: true, anim: 'drop' }),
        option('s13-opt-yes', S('s13').rects['opt-yes'], 'Yes', true, 'optionSans', { style: { size: 58 } }),
        option('s13-opt-no', S('s13').rects['opt-no'], 'No', false, 'optionSans', { delay: 0.15, style: { size: 58 } }),
      ],
    }),
    mapSlide('s14', 'Peta — Sea World', 'sea-world'),
    slide('s14-1', {
      name: 'Kosakata — Monkey',
      elements: [
        boxed('s14-1-monkey', S('s14-1').rects['label-monkey'], 'monkey', 'optionSans', SKINS.cream, { autoRead: true, style: { size: 70 } }),
        hotspot('s14-1-hs-left', [40, 560, 520, 960], 'Monkey'),
        hotspot('s14-1-hs-right', [1580, 720, 1820, 930], 'Monkey'),
      ],
    }),
    slide('s15', {
      name: 'Kosakata — Sea World',
      elements: [
        img('s15', 'paus', { anim: 'slide-right', loop: 'float', speakText: 'Whale', sticker: true }),
        img('s15', 'kura', { anim: 'pop', loop: 'float', speakText: 'Turtle', delay: 0.2, sticker: true }),
        img('s15', 'lumba', { anim: 'pop', loop: 'float', speakText: 'Dolphin', delay: 0.35, sticker: true }),
        boxed('s15-turtle', S('s15').rects['label-turtle'], 'turtle', 'optionSans', SKINS.cream, { style: { size: 56 }, delay: 0.3 }),
        boxed('s15-dolphin', S('s15').rects['label-dolphin'], 'dolphin', 'optionSans', SKINS.cream, { style: { size: 56 }, delay: 0.45 }),
        boxed('s15-whale', [1396, 762, 1852, 920], 'whale', 'optionSans', SKINS.cream, { style: { size: 62 }, delay: 0.6 }),
      ],
    }),
    slide('s16', {
      name: 'Penutup — Thank You & Skor',
      type: 'ending',
      elements: [text('s16-thanks', [500, 190, 1420, 345], 'THANK YOU', 'title', { anim: 'pop', autoRead: true, speakText: 'Thank you!' })],
      resultBox: { x: 22, y: 33, w: 56, h: 40 },
    }),
  ];
}

export function createDefaultProject() {
  return {
    version: PROJECT_VERSION,
    title: 'Liam Goes to the Zoo',
    subtitle: 'Petualangan belajar bahasa Inggris bersama Liam',
    settings: {
      pin: '1234',
      requirePin: true,
      voiceLang: 'auto', // 'auto' | 'en-US' | 'id-ID'
      defaultLang: 'en-US',
      speechRate: 0.85,
      autoRead: true,
      showSpeakerIcons: true,
      wrongMode: 'retry', // 'retry' = coba lagi | 'next' = tampilkan jawaban lalu lanjut
      pointsCorrect: 10,
      pointsRetry: 5,
      autoNextDelay: 2.2,
      correctVoice: 'Correct! Great job!',
      wrongVoice: 'Oops! Try again.',
      correctAudio: '',
      wrongAudio: '',
    },
    slides: createDefaultSlides(),
  };
}
