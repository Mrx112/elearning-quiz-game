/* Quiz Game — app.js (shared logic for JS and PHP versions) */
(function () {
  'use strict';

  const STORAGE_PREFS = 'quizgame-prefs';
  const STORAGE_SLIDES = 'quizgame-slides';

  const DEFAULT_SETTINGS = {
    pin: '1234',
    requirePin: true,
    voiceLang: 'auto',
    autoRead: true,
    pointsCorrect: 10,
    pointsRetry: 5,
    autoNextDelay: 2,
    wrongMode: 'retry',
    wrongVoice: 'Oops! Try again.',
    correctVoice: 'Correct! Great job!'
  };

  const DEFAULT_SLIDES = [
    { id: 's01', type: 'story', title: 'Hello, I\u2019m Liam!', text: "Hello, I\u2019m Liam! Today, I\u2019m going to the zoo with my parents", speakText: "Hello, I'm Liam! Today, I'm going to the zoo with my parents", bg: '#2563eb', emoji: '\uD83E\uDD47\u200D\u2640\uFE0F' },
    { id: 's02', type: 'story', title: 'Father & Mother', text: 'Father \u00b7 Mother', speakText: 'Father. Mother.', bg: '#2563eb', emoji: '\uD83E\uDD3C\u200D\uD83E\uDD3E\u200D\uD83E\uDD47' },
    { id: 's03', type: 'story', title: "Let\u2019s go!!!", text: "Let\u2019s go!!!", speakText: "Let's go!!!", bg: '#2563eb', emoji: '\uD83D\uDE97' },
    { id: 's04', type: 'quiz', title: 'Traffic Light \u2014 Red', text: 'Look at the traffic light!! What is the color?', speakText: 'Traffic light. The light is red.', options: [{ label: 'Red', correct: true }, { label: 'Yellow', correct: false }, { label: 'Green', correct: false }], correctText: 'Jawaban benar: Red', bg: '#dc2626', emoji: '\uD83D\uDEA6' },
    { id: 's05', type: 'quiz', title: 'Traffic Light \u2014 Yellow', text: 'Look at the traffic light!! What is the color?', speakText: 'Traffic light. The light is yellow.', options: [{ label: 'Red', correct: false }, { label: 'Yellow', correct: true }, { label: 'Green', correct: false }], correctText: 'Jawaban benar: Yellow', bg: '#d97706', emoji: '\uD83D\uDEA6' },
    { id: 's06', type: 'quiz', title: 'Traffic Light \u2014 Green', text: 'Look at the traffic light!! What is the color?', speakText: 'Traffic light. The light is green.', options: [{ label: 'Red', correct: false }, { label: 'Yellow', correct: false }, { label: 'Green', correct: true }], correctText: 'Jawaban benar: Green', bg: '#15803d', emoji: '\uD83D\uDEA6' },
    { id: 's08', type: 'story', title: 'Sampai di Kebun Binatang', text: 'Yeay!!! We are arrive >.<', speakText: 'Yeay! We are arrive at the zoo!', bg: '#15803d', emoji: '\uD83E\uDD92' },
    { id: 's09', type: 'map', title: 'Peta \u2014 Pilih Area', text: 'Pilih area wisata:', choices: [{ label: 'Air Paradise', target: 8 }, { label: 'Wild Safari', target: 11 }, { label: 'Sea World', target: 15 }], bg: '#0369a1', emoji: '\uD83D\uDDFA\uFE0F' },
    { id: 's09-1', type: 'quiz', title: 'What is this animal?', text: 'What is this animal?', speakText: 'What is this animal?', options: [{ label: 'swan', correct: true }, { label: 'rabbit', correct: false }], correctText: 'Jawaban benar: swan', bg: '#2563eb', emoji: '\uD83E\uDD62' },
    { id: 's10', type: 'quiz', title: 'Butterfly', text: 'What is this animal?', speakText: 'What is this animal?', options: [{ label: 'butterfly', correct: true }, { label: 'bird', correct: false }], correctText: 'Jawaban benar: butterfly', bg: '#2563eb', emoji: '\uD83E\uDD8B' },
    { id: 's11', type: 'map', title: 'Peta \u2014 Pilih Area', text: 'Pilih area wisata:', choices: [{ label: 'Air Paradise', target: 8 }, { label: 'Wild Safari', target: 11 }, { label: 'Sea World', target: 15 }], bg: '#0369a1', emoji: '\uD83D\uDDFA\uFE0F' },
    { id: 's11-1', type: 'quiz', title: 'Elephant', text: 'Is the elephant big or small?', speakText: 'Is the elephant big or small?', options: [{ label: 'Big', correct: true }, { label: 'small', correct: false }], correctText: 'Jawaban benar: Big', bg: '#2563eb', emoji: '\uD83E\uDD71' },
    { id: 's12', type: 'quiz', title: 'Leopard', text: 'What does the animal beside it eat?', speakText: 'What does the animal beside it eat?', options: [{ label: 'meat', correct: true }, { label: 'grass', correct: false }], correctText: 'Jawaban benar: meat', bg: '#2563eb', emoji: '\uD83E\uDD86' },
    { id: 's13', type: 'quiz', title: 'Giraffe', text: 'Is the giraffe tall?', speakText: 'Is the giraffe tall?', options: [{ label: 'Yes', correct: true }, { label: 'No', correct: false }], correctText: 'Jawaban benar: Yes', bg: '#2563eb', emoji: '\uD83E\uDD78' },
    { id: 's14', type: 'map', title: 'Peta \u2014 Pilih Area', text: 'Pilih area wisata:', choices: [{ label: 'Air Paradise', target: 8 }, { label: 'Wild Safari', target: 11 }, { label: 'Sea World', target: 15 }], bg: '#0369a1', emoji: '\uD83D\uDDFA\uFE0F' },
    { id: 's14-1', type: 'story', title: 'Kosakata \u2014 Monkey', text: 'monkey', speakText: 'Monkey', bg: '#2563eb', emoji: '\uD83E\uDD6A' },
    { id: 's15', type: 'story', title: 'Kosakata \u2014 Sea World', text: 'turtle \u00b7 dolphin \u00b7 whale', speakText: 'Turtle. Dolphin. Whale.', bg: '#0369a1', emoji: '\uD83C\uDF0A' },
    { id: 's16', type: 'ending', title: 'THANK YOU', text: 'Terima kasih telah bermain!', speakText: 'Thank you!', bg: '#6b21a8', emoji: '\uD83C\uDF89' }
  ];

  const cfg = window.QUIZ_CONFIG || {};
  const useApi = !!cfg.apiBase;
  const apiBase = cfg.apiBase || '';

  const RANKS = [
    { min: 0, label: 'Coba Lagi', badge: '\uD83D\uDD35' },
    { min: 40, label: 'Cukup Baik', badge: '\uD83D\uDD37' },
    { min: 60, label: 'Baik', badge: '\uD83C\uDFC1\uFE0F' },
    { min: 80, label: 'Sangat Baik', badge: '\uD83D\uDCC4' },
    { min: 100, label: 'Sempurna', badge: '\uD83E\uDD29' }
  ];

  /* ---------- state ---------- */
  let project = { slides: [], settings: { ...DEFAULT_SETTINGS } };
  let prefs = { voice: true, sfx: true, lang: 'auto' };
  let answers = {};
  let score = 0;
  let index = null;
  let visit = 0;
  let quiz = { status: {}, locked: false, reveal: false };
  let feedback = null;
  let timer = null;
  let timeLeft = 30;
  let synth = window.speechSynthesis || null;
  let speaking = false;
  let sessionAdmin = false;

  const $ = (s) => document.querySelector(s);
  const app = $('#app');

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  /* ---------- storage ---------- */
  function loadPrefs() {
    try { const raw = localStorage.getItem(STORAGE_PREFS); if (raw) prefs = { ...prefs, ...JSON.parse(raw) }; } catch (e) { }
  }
  function savePrefs() { try { localStorage.setItem(STORAGE_PREFS, JSON.stringify(prefs)); } catch (e) { } }

  async function loadProject() {
    const def = () => { project.slides = [...DEFAULT_SLIDES]; project.settings = { ...DEFAULT_SETTINGS }; };
    if (useApi) {
      try {
        const res = await fetch(`${apiBase}?action=slides`, { cache: 'no-store' });
        const d = await res.json();
        if (d.ok && Array.isArray(d.slides)) {
          project.slides = d.slides;
          project.settings = { ...DEFAULT_SETTINGS, ...(d.settings || {}) };
          return;
        }
      } catch (e) { console.error(e); }
      def();
    } else {
      try {
        const raw = localStorage.getItem(STORAGE_SLIDES);
        if (raw) {
          const d = JSON.parse(raw);
          project.slides = Array.isArray(d.slides) ? d.slides : [...DEFAULT_SLIDES];
          project.settings = { ...DEFAULT_SETTINGS, ...(d.settings || {}) };
        } else def();
      } catch (e) { def(); }
    }
  }

  async function saveProject() {
    const payload = { slides: project.slides, settings: project.settings };
    if (useApi) {
      try { await fetch(`${apiBase}?action=save`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); } catch (e) { console.error(e); }
    } else { try { localStorage.setItem(STORAGE_SLIDES, JSON.stringify(payload)); } catch (e) { } }
  }

  /* ---------- audio ---------- */
  function speak(text, lang) {
    if (!prefs.voice || !text || !synth) return;
    if (speaking) synth.cancel();
    speaking = true;
    const u = new SpeechSynthesisUtterance(String(text));
    u.lang = (prefs.lang === 'auto' ? (lang || undefined) : prefs.lang) || undefined;
    u.rate = 0.9;
    u.onend = () => { speaking = false; };
    u.onerror = () => { speaking = false; };
    synth.speak(u);
  }

  function beep(type) {
    if (!prefs.sfx || typeof AudioContext === 'undefined' && typeof webkitAudioContext === 'undefined') return;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx = new Ctx();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    if (type === 'correct') {
      osc.type = 'sine'; osc.frequency.setValueAtTime(660, t); osc.frequency.exponentialRampToValueAtTime(1200, t + 0.15);
      gain.gain.setValueAtTime(0.15, t); gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
      osc.start(t); osc.stop(t + 0.25);
    } else if (type === 'wrong') {
      osc.type = 'square'; osc.frequency.setValueAtTime(180, t); osc.frequency.exponentialRampToValueAtTime(90, t + 0.2);
      gain.gain.setValueAtTime(0.2, t); gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
      osc.start(t); osc.stop(t + 0.3);
    } else if (type === 'click') {
      osc.type = 'square'; osc.frequency.setValueAtTime(1000, t);
      gain.gain.setValueAtTime(0.08, t); gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
      osc.start(t); osc.stop(t + 0.08);
    } else if (type === 'whoosh') {
      osc.type = 'sawtooth'; osc.frequency.setValueAtTime(400, t); osc.frequency.exponentialRampToValueAtTime(900, t + 0.12);
      gain.gain.setValueAtTime(0.1, t); gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
      osc.start(t); osc.stop(t + 0.15);
    }
    setTimeout(() => { try { ctx.close(); } catch (e) { } }, 400);
  }

  /* ---------- game logic ---------- */
  function slideAt(i) { return project.slides[Math.max(0, Math.min(project.slides.length - 1, i))]; }
  function quizSlide(s) { return s && s.type === 'quiz' && s.options && s.options.length; }
  function stats() {
    const qs = project.slides.filter(quizSlide);
    const correct = qs.filter((s) => answers[s.id] && answers[s.id].correct).length;
    return { total: qs.length, correct };
  }
  function rankLabel(pct) { let r = RANKS[0]; for (const x of RANKS) if (pct >= x.min) r = x; return r; }

  function startTimer() {
    stopTimer(); timeLeft = 30;
    timer = setInterval(() => {
      timeLeft--; if (timeLeft <= 0) { stopTimer(); onTimeUp(); }
      renderHud();
    }, 1000);
    renderHud();
  }
  function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }
  function onTimeUp() {
    const s = slideAt(index);
    if (!quizSlide(s) || (answers[s.id] && answers[s.id].done)) return;
    beep('wrong');
    answers[s.id] = { correct: false, attempts: ((answers[s.id] && answers[s.id].attempts) || 0) + 1, done: true, chosen: 'waktu habis' };
    quiz = { status: {}, locked: true, reveal: true };
    feedback = { type: 'reveal', text: s.correctText };
    speak(s.correctText || project.settings.wrongVoice);
    render();
  }

  async function goTo(i) {
    stopTimer(); beep('whoosh');
    index = Math.max(0, Math.min(project.slides.length - 1, i));
    visit++; feedback = null; quiz = { status: {}, locked: false, reveal: false };
    const s = slideAt(index);
    if (s.type === 'ending') { render(); return; }
    startTimer();
    render();
    if (project.settings.autoRead && prefs.voice && (s.text || s.speakText)) setTimeout(() => speak(s.speakText || s.text, s.lang), 400);
  }
  function nextSlide() {
    const s = slideAt(index);
    if (quizSlide(s) && (!answers[s.id] || !answers[s.id].done)) return;
    goTo(index + 1);
  }
  function prevSlide() { goTo(index - 1); }
  function replay() {
    stopTimer(); score = 0; answers = {}; feedback = null; quiz = { status: {}, locked: false, reveal: false };
    index = 0; visit++; goTo(0);
  }

  function onOption(optIdx) {
    const s = slideAt(index);
    if (!quizSlide(s) || quiz.locked) return;
    const opt = s.options[optIdx];
    if (!opt || quiz.status[optIdx]) return;
    beep('click');
    const prevA = answers[s.id] || { attempts: 0 };
    const attempts = prevA.attempts + 1;

    if (opt.correct) {
      const gained = attempts === 1 ? (Number(project.settings.pointsCorrect) || 0) : (Number(project.settings.pointsRetry) || 0);
      score += gained;
      answers[s.id] = { correct: true, attempts, done: true, chosen: opt.label };
      quiz = { status: { [optIdx]: 'correct' }, locked: true, reveal: false };
      feedback = { type: 'correct', points: gained, text: s.correctText };
      beep('correct');
      speak(s.correctText || project.settings.correctVoice, 'en-US');
      if (project.settings.autoNextDelay > 0) setTimeout(nextSlide, project.settings.autoNextDelay * 1000 + 500);
    } else {
      quiz = { ...quiz, status: { ...quiz.status, [optIdx]: 'wrong' } };
      beep('wrong');
      if (project.settings.wrongMode === 'next') {
        answers[s.id] = { correct: false, attempts, done: true, chosen: opt.label };
        quiz = { ...quiz, locked: true, reveal: true };
        feedback = { type: 'reveal', text: s.correctText };
        speak(s.correctText || project.settings.wrongVoice, 'en-US');
        if (project.settings.autoNextDelay > 0) setTimeout(nextSlide, project.settings.autoNextDelay * 1000 + 1000);
      } else {
        answers[s.id] = { correct: false, attempts, done: false, chosen: opt.label };
        feedback = { type: 'wrong' };
        speak(project.settings.wrongVoice, 'en-US');
        setTimeout(() => { if (feedback && feedback.type === 'wrong') feedback = null; render(); }, 1500);
      }
    }
    render();
  }

  /* ---------- admin ---------- */
  async function adminLogin(pin) {
    beep('click');
    if (useApi) {
      try {
        const res = await fetch(`${apiBase}?action=login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pin }) });
        const d = await res.json();
        if (d.ok) { sessionAdmin = true; renderAdmin(); } else alert('PIN salah');
      } catch (e) { alert('Gagal koneksi ke server'); }
    } else {
      if (pin === project.settings.pin) { sessionAdmin = true; renderAdmin(); } else alert('PIN salah');
    }
  }
  function adminLogout() { sessionAdmin = false; index = null; renderHome(); }

  async function adminSaveSettings(fd) {
    const s = { ...project.settings };
    for (const [k, v] of fd.entries()) {
      if (k === 'requirePin' || k === 'autoRead') s[k] = v === 'on';
      else if (k === 'pointsCorrect' || k === 'pointsRetry' || k === 'autoNextDelay') s[k] = Number(v) || 0;
      else s[k] = v;
    }
    project.settings = s;
    await saveProject();
    renderAdmin();
  }
  async function adminSetSlides(slides) { project.slides = slides; await saveProject(); renderAdmin(); }
  async function adminDeleteSlide(id) { if (!confirm('Hapus slide ini?')) return; project.slides = project.slides.filter((x) => x.id !== id); await saveProject(); renderAdmin(); }

  /* ---------- render ---------- */
  function renderHome() {
    const s = project.slides[0];
    const qCount = project.slides.filter(quizSlide).length;
    app.innerHTML = `
    <div class="relative flex h-full flex-col bg-gradient-to-b from-sky-900 via-slate-900 to-slate-950">
      <div class="relative min-h-0 flex-1 p-2 sm:p-4">
        <div class="slide-stage pop-in">
          <div class="slide-bg" style="background-color:${esc(s.bg)}"></div>
          <div class="absolute inset-0 flex items-center justify-center p-6">
            <div class="text-center">
              <div class="emoji-badge mx-auto mb-4">${esc(s.emoji)}</div>
              <p class="font-semibold uppercase tracking-widest text-sky-300 text-sm sm:text-base">Game E-Learning Interaktif</p>
              <h1 class="font-bold text-orange-400 drop-shadow-[0_3px_0_rgba(0,0,0,0.2)] text-4xl sm:text-6xl mb-2">${esc(project.title || 'Judul Game')}</h1>
              <p class="text-slate-300 text-sm sm:text-base mb-6">${esc(project.subtitle || '')}</p>
              <p class="text-slate-400 text-xs sm:text-sm mb-8">${project.slides.length} slide \u00b7 ${qCount} kuis \u00b7 sentuh teks untuk mendengarkan</p>
              <button id="btn-start" class="rounded-full bg-gradient-to-b from-amber-400 to-orange-500 font-bold text-white shadow-[0_4px_0_#c2410c] ring-4 ring-white hover:-translate-y-1 active:translate-y-1 active:shadow-none px-8 py-4 text-lg sm:text-xl font-display transition">Mulai Bermain</button>
            </div>
          </div>
        </div>
      </div>
      <button id="btn-admin" class="absolute right-3 top-3 z-50 flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-bold text-slate-200 backdrop-blur hover:bg-white/20" title="Admin / Kelola Konten">Admin / Kelola Konten</button>
    </div>
    `;
    $('#btn-start')?.addEventListener('click', () => { beep('click'); index = 0; goTo(0); });
    $('#btn-admin')?.addEventListener('click', () => { beep('click'); if (project.settings.requirePin) renderPin(); else { sessionAdmin = true; renderAdmin(); } });
  }

  function renderPin() {
    app.innerHTML = `
    <div class="flex h-full items-center justify-center bg-gradient-to-b from-sky-900 via-slate-900 to-slate-950 p-4">
      <div class="max-w-sm w-full bg-white/10 backdrop-blur border border-white/20 rounded-3xl p-8 text-center shadow-2xl">
        <div class="text-4xl mb-4">🔒</div>
        <h2 class="text-xl font-bold text-white mb-2">Admin / Kelola Konten</h2>
        <p class="text-slate-300 mb-6">Masukkan PIN</p>
        <input id="pin-input" type="password" maxlength="4" class="w-full py-3 px-4 rounded-xl text-center text-2xl font-mono font-bold text-white bg-white/5 border border-white/20 focus:outline-none focus:border-amber-400" placeholder="1234" autocomplete="off" />
        <div class="mt-6 flex gap-2">
          <button id="pin-ok" class="flex-1 rounded-xl bg-gradient-to-b from-amber-400 to-orange-500 font-bold text-white py-3">Masuk</button>
          <button id="pin-cancel" class="flex-1 rounded-xl bg-white/10 border border-white/20 font-bold text-slate-200 py-3 hover:bg-white/20">Batal</button>
        </div>
        <p class="mt-4 text-xs text-slate-400">PIN default: 1234</p>
      </div>
    </div>
    `;
    const inp = $('#pin-input');
    inp?.focus();
    $('#pin-ok')?.addEventListener('click', () => { adminLogin(inp.value || ''); });
    $('#pin-cancel')?.addEventListener('click', () => { beep('click'); index = null; renderHome(); });
    inp?.addEventListener('keydown', (e) => { if (e.key === 'Enter') adminLogin(inp.value || ''); });
  }

  function renderHeader() {
    const s = slideAt(index);
    const langLabel = { auto: 'Auto', 'en-US': 'EN', 'id-ID': 'ID' }[prefs.lang] || 'Auto';
    return `
    <header class="hud-bar shrink-0 items-center gap-2 px-2 py-1.5 sm:px-4 sm:py-2 bg-white/5 backdrop-blur border-b border-white/10">
      <button id="hud-home" class="hud-btn grid h-9 w-9 place-items-center rounded-full bg-white/15 text-white hover:bg-white/25 sm:h-10 sm:w-10" title="Beranda"><svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg></button>
      <div class="min-w-0 flex-1">
        <p class="truncate font-display text-xs font-semibold leading-tight sm:text-sm">${esc(project.title || 'Quiz Game')}</p>
        <p class="hud-sub truncate text-[10px] text-white/60 sm:text-xs">Slide ${index + 1} / ${project.slides.length} \u00b7 ${esc(s.title || '')}</p>
      </div>
      <div class="flex items-center gap-1 rounded-full bg-amber-400 px-3 py-1 font-display text-base font-bold text-amber-950 shadow sm:text-lg">\u2605 ${score}</div>
      <button id="hud-lang" class="hud-btn grid h-9 w-9 place-items-center rounded-full bg-white/15 text-white hover:bg-white/25 sm:h-10 sm:w-10" title="Bahasa suara: ${langLabel}"><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 011 1v2.45a2 2 0 012 1.55L10.83 16a2 2 0 002 1.84h3.28a2 2 0 002-2V7.82a2 2 0 00-.59-1.41l-5.48-2.74A2 2 0 009.28 3h-3.28a2 2 0 00-2 2v3.45zM3 12.18a2 2 0 012-2h3.28a1 1 0 001-1V5.82a2 2 0 012-2h3.28a2 2 0 012 2v3.45a1 1 0 001 1h3.28a2 2 0 012 1.78V18a2 2 0 01-2 2h-3.28a2 2 0 01-2-1.55v-2.45a1 1 0 00-1-1H5a2 2 0 01-2-2v1.18z"></path></svg><span class="text-[8px] font-bold">${langLabel}</span></button>
      <button id="hud-voice" class="hud-btn grid h-9 w-9 place-items-center rounded-full ${prefs.voice ? 'bg-white/15 text-white hover:bg-white/25' : 'bg-white/5 text-white/50 hover:bg-white/15'} sm:h-10 sm:w-10" title="${prefs.voice ? 'Matikan suara baca' : 'Nyalakan suara baca'}" aria-pressed="${prefs.voice}"><svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.8m8.485-11.314 0 0M11 12h4m-3.236 4.936a5.001 5.001 0 01-4.932-5.936l-1.51 1.51A3 3 0 018.485 15h3v-2.167a2 2 0 011.115-1.794l1.51-1.51z"></path></svg></button>
      <button id="hud-sfx" class="hud-btn grid h-9 w-9 place-items-center rounded-full ${prefs.sfx ? 'bg-white/15 text-white hover:bg-white/25' : 'bg-white/5 text-white/50 hover:bg-white/15'} sm:h-10 sm:w-10" title="${prefs.sfx ? 'Matikan efek suara' : 'Nyalakan efek suara'}" aria-pressed="${prefs.sfx}"><svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 12h4m-3.236 4.936a5.001 5.001 0 01-4.932-5.936l-1.51 1.51A3 3 0 018.485 15h3v-2.167a2 2 0 011.115-1.794l1.51-1.51z"></path></svg></button>
      <button id="hud-admin" class="hud-btn grid h-9 w-9 place-items-center rounded-full bg-white/15 text-white hover:bg-white/25 sm:h-10 sm:w-10" title="Admin / Kelola Konten"><svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.772 2.184-1.772 2.61 0M3.346 19.835a2 2 0 011.772 0L13.67 5.055c.525-.842 1.643-1.191 2.531-.787h1.106c1.034 0 1.923.63 2.273 1.54l1.111 1.69a2 2 0 01-.46 2.748l-1.177 1.292c-.384.422-1.055.422-1.439 0l-1.617-1.774a4 4 0 00-.31-.31l-1.774-1.617c-.422-.384-.422-1.055 0-1.439l1.292-1.177a2 2 0 012.748-.46l1.69 1.111c.91.35 1.54 1.239 1.54 2.273v1.106c0 .888-.355 2.006-.787 2.531L8.11 18.11a2 2 0 01-1.54 2.273v.472c0 .888-.612 1.678-1.54 2.273zM14.747 19.328c.426-1.772 2.184-1.772 2.61 0m-7.833-3.216a9 9 0 00-1.423 5.57 11.26 11.26 0 003.877 1.842q.587.19 1.174.19c.446 0 .885-.076 1.31-.198l1.51-1.51a3 3 0 014.242 4.242l-1.51 1.51c-.225.225-.524.348-.839.348s-.614-.123-.839-.348l-1.51-1.51a3 3 0 01-4.242-4.242l1.51 1.51z"></path></svg></button>
    </header>
    `;
  }

  function renderSlideStage() {
    const s = slideAt(index);
    const isQ = quizSlide(s);
    const answered = answers[s.id] && answers[s.id].done;
    let body = '';

    if (s.type === 'map') {
      body = `<div class="absolute inset-0 flex items-center justify-center p-8 text-center"><div class="max-w-xl"><p class="text-2xl font-bold text-white mb-8">${esc(s.text)}</p><div class="grid gap-3">${s.choices.map((c) => `<button class="choice-btn w-full py-4 rounded-2xl border-2 border-white/20 bg-white/10 text-left pl-6 pr-4 text-base font-semibold text-white hover:bg-white/20 active:scale-95 transition" onclick="appQuiz.chooseMap(${c.target})"><span>${esc(c.label)}</span><span class="absolute right-4 top-3 text-white/70">\u25B6</span></button>`).join('')}</div></div></div>`;
    } else if (s.type === 'ending') {
      const st = stats();
      const pct = st.total ? Math.round((st.correct / st.total) * 100) : 0;
      const rank = rankLabel(pct);
      body = `<div class="absolute inset-0 flex items-center justify-center p-6 text-center"><div class="emoji-badge mx-auto mb-6">${esc(s.emoji)}</div><h2 class="text-4xl sm:text-6xl font-bold text-white mb-2">${esc(s.title)}</h2><p class="text-slate-200 text-lg mb-6">${esc(s.text)}</p><div class="text-center mb-8"><div class="text-5xl font-bold text-amber-400 mb-1">${score}</div><div class="text-slate-300">${st.correct} / ${st.total} benar \u00b7 ${pct}% \u00b7 ${rank.badge} ${esc(rank.label)}</div></div><div class="flex flex-col sm:flex-row items-center justify-center gap-4"><button id="btn-replay" class="rounded-full bg-gradient-to-b from-amber-400 to-orange-500 font-bold text-white shadow-[0_4px_0_#c2410c] ring-4 ring-white px-8 py-3 text-lg">Main Lagi</button><button id="btn-home2" class="rounded-full bg-white/10 px-6 py-3 text-lg font-semibold text-white hover:bg-white/20">Beranda</button></div></div>`;
    } else {
      body = `<div class="absolute inset-0 flex flex-col items-center justify-center p-6 text-center"><div class="emoji-badge mx-auto mb-6">${esc(s.emoji)}</div>${s.text ? `<p class="text-2xl sm:text-3xl font-semibold text-white mb-6 max-w-lg mx-auto leading-relaxed">${esc(s.text)}</p>` : ''}${isQ ? `<div class="grid w-full max-w-md gap-3">${s.options.map((o, i) => `<button class="option-btn w-full py-4 rounded-xl border-2 border-white/30 bg-white/10 text-lg font-bold text-white text-left pl-6 pr-4 shadow-lg" onclick="appQuiz.onOption(${i})">${esc(o.label)}</button>`).join('')}</div>` : `<button id="btn-next" class="rounded-full bg-gradient-to-b from-amber-400 to-orange-500 font-bold text-white shadow-[0_4px_0_#c2410c] ring-4 ring-white px-8 py-3 text-lg">Lanjut</button>`}</div>`;
    }
    return `<main class="relative min-h-0 flex-1 px-2 sm:px-4"><div class="slide-stage"><div class="slide-bg" style="background-color:${esc(s.bg)}"></div><div class="absolute inset-0 z-10 flex items-center justify-center">${body}</div></div><p class="absolute inset-x-0 bottom-4 text-center text-xs font-semibold text-white/60">Putar HP ke posisi mendatar agar tampilan lebih besar</p></main>`;
  }

  function renderFeedback() {
    if (!feedback) return '';
    const s = slideAt(index);
    const correct = feedback.type === 'correct';
    const color = correct ? '#10b981' : '#ef4444';
    const icon = correct ? '\u2705' : '\u274C';
    let msg = '';
    if (feedback.type === 'correct') msg = `Benar! ${feedback.points > 0 ? `+${feedback.points}` : ''} ${feedback.text || ''}`;
    else if (feedback.type === 'wrong') msg = 'Salah, coba lagi.';
    else if (feedback.type === 'reveal') msg = feedback.text || '';
    return `<div class="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 pop-in px-6 py-4 rounded-2xl border border-white/20 bg-white/10 text-center shadow-2xl" style="border-color:${color}"><span class="text-2xl">${icon}</span><p class="font-bold text-white mt-1">${esc(msg)}</p></div>`;
  }

  function renderFooter() {
    const s = slideAt(index);
    const isQ = quizSlide(s);
    const answered = answers[s.id] && answers[s.id].done;
    const canNext = !(index >= project.slides.length - 1 || (isQ && !answered));
    return `<footer class="hud-bar shrink-0 items-center gap-2 px-2 py-1.5 sm:px-4 sm:py-2 bg-white/5 backdrop-blur border-t border-white/10">
      <button id="nav-prev" class="flex items-center gap-1 rounded-full bg-white/15 px-3 py-2 font-display text-sm font-semibold text-white transition hover:bg-white/25 ${index === 0 ? 'opacity-30 pointer-events-none' : ''}" ${index === 0 ? 'disabled' : ''}><svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg><span class="hidden sm:inline">Kembali</span></button>
      <div class="flex min-w-0 flex-1 items-center justify-center gap-1 overflow-hidden" aria-hidden>${project.slides.map((s, i) => { const a = answers[s.id]; let cls = 'h-2 shrink-0 rounded-full w-2 bg-white/20 transition-all'; if (i === index) cls = 'w-6 bg-amber-400'; else if (a && a.correct) cls = 'w-2 bg-green-400'; else if (a && a.done) cls = 'w-2 bg-red-400'; else if (i < index) cls = 'w-2 bg-white/60'; return `<span class="${cls}" title="${esc(s.title || s.id)}"></span>`; }).join('')}</div>
      ${isQ && !answered ? `<span class="hidden text-xs font-semibold text-white/70 sm:inline">Pilih jawaban dulu ya!</span>` : ''}
      <button id="nav-next" class="flex items-center gap-1 rounded-full px-4 py-2 font-display text-sm font-bold transition disabled:opacity-30 ${canNext ? 'bg-amber-400 text-amber-950 shadow-lg hover:bg-amber-300' : 'bg-white/15 text-white'}" ${!canNext ? 'disabled' : ''}><span>Lanjut</span><svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg></button>
    </footer>`;
  }

  function renderHud() {
    const el = document.getElementById('timer-hud');
    if (!el) return;
    el.innerHTML = timeLeft < 11 ? `<span class="timer-danger">${timeLeft}</span>` : `${timeLeft}`;
  }

  function renderPlay() {
    const s = slideAt(index);
    if (s.type === 'ending') { render(); return; }
    let html = renderHeader();
    html += renderSlideStage();
    html += renderFeedback();
    html += renderFooter();
    app.innerHTML = `<div class="flex h-full flex-col bg-gradient-to-b from-sky-900 via-slate-900 to-slate-950 text-white">${html}<span id="timer-hud" class="absolute top-4 right-4 z-40 text-xs font-bold text-white/70"></span></div>`;
    bindPlayEvents();
    renderHud();
    if (s.type !== 'ending') startTimer();
  }

  function render() {
    if (sessionAdmin) { renderAdmin(); return; }
    if (index === null) { renderHome(); return; }
    renderPlay();
  }

  function bindPlayEvents() {
    const on = (id, ev, fn) => { const el = $(id); if (el) el.addEventListener(ev, fn); };
    on('#hud-home', 'click', () => { beep('click'); index = null; renderHome(); });
    on('#hud-lang', 'click', () => { beep('click'); prefs.lang = { auto: 'en-US', 'en-US': 'id-ID', 'id-ID': 'auto' }[prefs.lang] || 'auto'; savePrefs(); render(); });
    on('#hud-voice', 'click', () => { beep('click'); prefs.voice = !prefs.voice; savePrefs(); render(); });
    on('#hud-sfx', 'click', () => { beep('click'); prefs.sfx = !prefs.sfx; savePrefs(); render(); });
    on('#hud-admin', 'click', () => { beep('click'); if (project.settings.requirePin) renderPin(); else { sessionAdmin = true; renderAdmin(); } });
    on('#nav-prev', 'click', prevSlide);
    on('#nav-next', 'click', nextSlide);
    on('#btn-next', 'click', nextSlide);
    on('#btn-replay', 'click', () => { beep('click'); index = null; renderHome(); });
    on('#btn-home2', 'click', () => { beep('click'); index = null; renderHome(); });
  }

  /* ---------- admin UI ---------- */
  function optionHtml(opt, idx, slideId) {
    return `<tr class="border-b border-white/10"><td class="py-3 text-xs text-slate-300">${esc(opt.label)}</td><td class="py-3 text-xs text-center">${opt.correct ? '<span class="text-green-400 font-bold">✓</span>' : ''}</td><td class="py-3 text-right"><button class="text-xs text-amber-400 hover:text-amber-300" onclick="appQuiz.adminToggleCorrect('${slideId}',${idx})">ubah</button></td></tr>`;
  }

  function renderAdmin() {
    const st = stats();
    app.innerHTML = `
    <div class="flex h-full bg-gradient-to-b from-sky-900 via-slate-900 to-slate-950">
      <aside class="hidden sm:flex w-20 flex-col items-center gap-2 p-3 border-r border-white/10 bg-white/5">
        <button id="ad-back" class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 text-white" title="Keluar"><svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1H12a1 1 0 01-1-1z"></path></svg></button>
        <button id="ad-home" class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 text-white" title="Lihat Hasil"><svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg></button>
      </aside>
      <div class="flex-1 overflow-y-auto p-4 sm:p-6">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-2xl font-bold text-white mb-1">Admin / Kelola Konten</h2>
            <p class="text-slate-300 text-sm">Atur slide, soal, dan pengaturan game</p>
          </div>
          <div class="flex gap-2">
            <button id="ad-export" class="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-sm font-semibold text-white hover:bg-white/20">Ekspor JSON</button>
            <label class="cursor-pointer px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-sm font-semibold text-white hover:bg-white/20">Impor JSON <input id="ad-import" type="file" accept=".json" class="hidden" /></label>
            <button id="ad-logout" class="px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/40 text-sm font-semibold text-red-300 hover:bg-red-500/30">Keluar</button>
          </div>
        </div>

        <div class="grid gap-6">
          <!-- Pengaturan -->
          <div class="admin-card rounded-2xl p-5">
            <h3 class="text-sm font-bold text-amber-300 uppercase tracking-wider mb-4">Pengaturan Game</h3>
            <form id="ad-settings" class="grid gap-3 sm:grid-cols-2">
              <div class="col-span-2"><label class="block text-xs text-slate-400 mb-1">Judul game</label><input id="st-title" class="w-full py-2 px-3 rounded-lg bg-white/5 border border-white/20 text-white focus:border-amber-400 focus:outline-none" value="${esc(project.title || '')}" /></div>
              <div class="col-span-2"><label class="block text-xs text-slate-400 mb-1">Subtitle</label><input id="st-subtitle" class="w-full py-2 px-3 rounded-lg bg-white/5 border border-white/20 text-white focus:border-amber-400 focus:outline-none" value="${esc(project.subtitle || '')}" /></div>
              <div><label class="block text-xs text-slate-400 mb-1">PIN admin</label><input id="st-pin" class="w-full py-2 px-3 rounded-lg bg-white/5 border border-white/20 text-white focus:border-amber-400 focus:outline-none" value="${esc(project.settings.pin || '')}" /></div>
              <div><label class="block text-xs text-slate-400 mb-1">Wajib PIN admin</label><select id="st-requirepin" class="w-full py-2 px-3 rounded-lg bg-white/5 border border-white/20 text-white focus:border-amber-400 focus:outline-none"><option value="1" ${project.settings.requirePin ? 'selected' : ''}>Ya</option><option value="0" ${!project.settings.requirePin ? 'selected' : ''}>Tidak</option></select></div>
              <div><label class="block text-xs text-slate-400 mb-1">Bahasa suara</label><select id="st-voicelang" class="w-full py-2 px-3 rounded-lg bg-white/5 border border-white/20 text-white focus:border-amber-400 focus:outline-none"><option value="auto" ${project.settings.voiceLang === 'auto' ? 'selected' : ''}>Auto</option><option value="en-US" ${project.settings.voiceLang === 'en-US' ? 'selected' : ''}>English</option><option value="id-ID" ${project.settings.voiceLang === 'id-ID' ? 'selected' : ''}>Indonesia</option></select></div>
              <div class="col-span-2"><label class="flex items-center gap-2"><input id="st-autoread" type="checkbox" ${project.settings.autoRead ? 'checked' : ''} class="rounded bg-white/5 border-white/20 focus:ring-amber-400" /> Narasi otomatis (autoRead)</label></div>
              <div class="col-span-2"><label class="flex items-center gap-2"><input id="st-wrongmode" type="checkbox" ${project.settings.wrongMode === 'retry' ? 'checked' : ''} class="rounded bg-white/5 border-white/20 focus:ring-amber-400" /> Mode coba lagi saat salah (retry) / tampilkan jawaban lalu lanjut (next)</label></div>
              <div><label class="block text-xs text-slate-400 mb-1">Poin benar (kali pertama)</label><input id="st-points-correct" class="w-full py-2 px-3 rounded-lg bg-white/5 border border-white/20 text-white focus:border-amber-400 focus:outline-none" type="number" value="${project.settings.pointsCorrect}" /></div>
              <div><label class="block text-xs text-slate-400 mb-1">Poin benar (coba lagi)</label><input id="st-points-retry" class="w-full py-2 px-3 rounded-lg bg-white/5 border border-white/20 text-white focus:border-amber-400 focus:outline-none" type="number" value="${project.settings.pointsRetry}" /></div>
              <div><label class="block text-xs text-slate-400 mb-1">Jeda lanjut otomatis (detik)</label><input id="st-autonext" class="w-full py-2 px-3 rounded-lg bg-white/5 border border-white/20 text-white focus:border-amber-400 focus:outline-none" type="number" step="0.1" value="${project.settings.autoNextDelay}" /></div>
            </form>
            <button id="ad-save-settings" class="mt-4 w-full py-3 rounded-xl bg-gradient-to-b from-amber-400 to-orange-500 font-bold text-white shadow hover:from-amber-300">Simpan Pengaturan</button>
          </div>

          <!-- Statistik -->
          <div class="admin-card rounded-2xl p-5">
            <h3 class="text-sm font-bold text-amber-300 uppercase tracking-wider mb-3">Statistik Sesi</h3>
            <div class="grid gap-2 text-sm">${st.total} kuis \u00b7 ${st.correct} benar \u00b7 Skor ${score}</div>
          </div>

          <!-- Daftar slide -->
          <div class="admin-card rounded-2xl p-5">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-bold text-amber-300 uppercase tracking-wider">Daftar Slide (${project.slides.length})</h3>
              <button id="ad-add-slide" class="px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-xs font-bold text-white hover:bg-white/20">+ Tambah Slide</button>
            </div>
            <div class="overflow-x-auto"><table class="w-full text-left border-collapse">
              <thead><tr class="border-b border-white/10"><th class="py-3 text-xs text-slate-400 font-semibold">ID</th><th class="py-3 text-xs text-slate-400 font-semibold">Judul</th><th class="py-3 text-xs text-slate-400 font-semibold text-center">Tipe</th><th class="py-3 text-xs text-slate-400 font-semibold text-right">Aksi</th></tr></thead>
              <tbody id="ad-slide-list">
                ${project.slides.map((s) => `<tr class="border-b border-white/10"><td class="py-3 text-xs font-mono text-slate-300">${esc(s.id)}</td><td class="py-3 text-xs text-white">${esc(s.title || s.id)}</td><td class="py-3 text-xs text-center text-slate-400">${s.type}</td><td class="py-3 text-right"><button class="text-xs text-amber-400 hover:text-amber-300 mr-3" onclick="appQuiz.adminEditSlide('${esc(s.id)}')">Edit</button><button class="text-xs text-red-400 hover:text-red-300" onclick="appQuiz.adminDeleteSlide('${esc(s.id)}')">Hapus</button></td></tr>`).join('')}
              </tbody>
            </table></div>
          </div>

          <!-- Form slide -->
          <div id="ad-slide-form" class="hidden admin-card rounded-2xl p-5">
            <h3 class="text-sm font-bold text-amber-300 uppercase tracking-wider mb-4" id="ad-form-title">Edit Slide</h3>
            <form id="ad-slide-editor" class="grid gap-3">
              <input id="ed-id" type="hidden" />
              <div><label class="block text-xs text-slate-400 mb-1">ID slide</label><input id="ed-id-text" class="w-full py-2 px-3 rounded-lg bg-white/5 border border-white/20 text-white focus:border-amber-400 focus:outline-none" /></div>
              <div><label class="block text-xs text-slate-400 mb-1">Judul</label><input id="ed-title" class="w-full py-2 px-3 rounded-lg bg-white/5 border border-white/20 text-white focus:border-amber-400 focus:outline-none" /></div>
              <div><label class="block text-xs text-slate-400 mb-1">Teks / Soal</label><textarea id="ed-text" class="w-full py-2 px-3 rounded-lg bg-white/5 border border-white/20 text-white focus:border-amber-400 focus:outline-none" rows="3"></textarea></div>
              <div><label class="block text-xs text-slate-400 mb-1">Teks dibacaan (speakText)</label><input id="ed-speak" class="w-full py-2 px-3 rounded-lg bg-white/5 border border-white/20 text-white focus:border-amber-400 focus:outline-none" /></div>
              <div><label class="block text-xs text-slate-400 mb-1>Warna bg</label><input id="ed-bg" class="w-full py-2 px-3 rounded-lg bg-white/5 border border-white/20 text-white focus:border-amber-400 focus:outline-none" /></div>
              <div><label class="block text-xs text-slate-400 mb-1">Emoji</label><input id="ed-emoji" class="w-full py-2 px-3 rounded-lg bg-white/5 border border-white/20 text-white focus:border-amber-400 focus:outline-none" /></div>
              <div id="ed-type-row"><label class="block text-xs text-slate-400 mb-1">Tipe</label><select id="ed-type" class="w-full py-2 px-3 rounded-lg bg-white/5 border border-white/20 text-white focus:border-amber-400 focus:outline-none"><option value="story">Cerita</option><option value="quiz">Kuis</option><option value="map">Peta (pilihan)</option><option value="ending">Penutup</option></select></div>
              <div id="ed-options-wrap" class="border border-white/10 rounded-lg p-3"></div>
              <div class="col-span-2 flex gap-2">
                <button type="button" id="ed-add-opt" class="flex-1 py-2 rounded-lg bg-white/10 border border-white/20 text-xs font-bold text-white hover:bg-white/20">+ Opsi</button>
                <button type="submit" class="flex-1 py-3 rounded-xl bg-gradient-to-b from-amber-400 to-orange-500 font-bold text-white">Simpan Slide</button>
                <button type="button" id="ed-cancel" class="flex-1 py-3 rounded-xl bg-white/10 border border-white/20 font-bold text-slate-200 hover:bg-white/20">Batal</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    `;
    $('#ad-back')?.addEventListener('click', () => { beep('click'); adminLogout(); });
    $('#ad-home')?.addEventListener('click', () => { beep('click'); sessionAdmin = false; index = null; renderHome(); });
    $('#ad-logout')?.addEventListener('click', () => { beep('click'); adminLogout(); });
    $('#ad-export')?.addEventListener('click', () => { beep('click'); const blob = new Blob([JSON.stringify({ slides: project.slides, settings: project.settings }, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'quizgame-backup.json'; a.click(); URL.revokeObjectURL(url); });
    $('#ad-import')?.addEventListener('change', async (e) => { beep('click'); const file = e.target.files[0]; if (!file) return; const text = await file.text(); try { const d = JSON.parse(text); if (Array.isArray(d.slides)) { await adminSetSlides(d.slides); if (d.settings) project.settings = { ...project.settings, ...d.settings }; await saveProject(); alert('Diimpor'); renderAdmin(); } else alert('Format JSON tidak valid'); } catch (err) { alert('Gagal impor JSON'); } });
    $('#ad-save-settings')?.addEventListener('click', (e) => { e.preventDefault(); beep('click'); adminSaveSettings(new FormData($('#ad-settings'))); });
    $('#ad-add-slide')?.addEventListener('click', () => { beep('click'); adminShowSlideForm(null); });
    $('#ed-cancel')?.addEventListener('click', () => { beep('click'); $('#ad-slide-form')?.classList.add('hidden'); });
    $('#ad-slide-editor')?.addEventListener('submit', (e) => { e.preventDefault(); beep('click'); adminSaveSlideFromForm(); });
    $('#ed-type')?.addEventListener('change', renderOptionInputs);
    $('#ed-add-opt')?.addEventListener('click', () => { beep('click'); addOptionRow(); });
    renderSlideListAdmin();
    renderOptionInputs();
    adminShowSlideForm(window.location.hash ? null : null);
  }

  function renderSlideListAdmin() {
    const el = $('#ad-slide-list');
    if (!el) return;
    el.innerHTML = project.slides.map((s) => `<tr class="border-b border-white/10"><td class="py-3 text-xs font-mono text-slate-300">${esc(s.id)}</td><td class="py-3 text-xs text-white">${esc(s.title || s.id)}</td><td class="py-3 text-xs text-center text-slate-400">${s.type}</td><td class="py-3 text-right"><button class="text-xs text-amber-400 hover:text-amber-300 mr-3" onclick="appQuiz.adminEditSlide('${esc(s.id)}')">Edit</button><button class="text-xs text-red-400 hover:text-red-300" onclick="appQuiz.adminDeleteSlide('${esc(s.id)}')">Hapus</button></td></tr>`).join('');
  }

  function adminShowSlideForm(slide) {
    const formBox = $('#ad-slide-form');
    if (!formBox) return;
    const isNew = !slide;
    const s = slide || { id: '', type: 'story', title: '', text: '', speakText: '', bg: '#2563eb', emoji: '\uD83D\uDE00', options: [] };
    $('#ed-id').value = s.id;
    $('#ed-id-text').value = s.id;
    $('#ed-title').value = s.title || '';
    $('#ed-text').value = s.text || '';
    $('#ed-speak').value = s.speakText || '';
    $('#ed-bg').value = s.bg || '#2563eb';
    $('#ed-emoji').value = s.emoji || '';
    $('#ed-type').value = s.type || 'story';
    $('#ad-form-title').textContent = isNew ? 'Tambah Slide Baru' : 'Edit Slide: ' + esc(s.id);
    formBox.classList.remove('hidden');
    renderOptionInputs(s.options || []);
  }

  function renderOptionInputs(options) {
    const wrap = $('#ed-options-wrap');
    if (!wrap) return;
    const opts = options || [];
    wrap.innerHTML = `<label class="block text-xs text-slate-400 mb-2">Opsi jawaban (hanya untuk kuis)</label>${opts.map((o, i) => `<div class="flex gap-2 mb-2"><input class="flex-1 py-2 px-3 rounded-lg bg-white/5 border border-white/20 text-white focus:border-amber-400 focus:outline-none" value="${esc(o.label)}" onchange="appQuiz.adminEditOptionLabel(${i}, this.value)"><select class="w-auto py-2 px-3 rounded-lg bg-white/5 border border-white/20 text-white focus:border-amber-400 focus:outline-none" onchange="appQuiz.adminToggleCorrectIdx(${i})"><option value="0" ${!o.correct ? 'selected' : ''}>Salah</option><option value="1" ${o.correct ? 'selected' : ''}>Benar</option></select><button class="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-300" onclick="appQuiz.adminRemoveOption(${i})">×</button></div>`).join('')}`;
  }

  function addOptionRow() {
    const s = slideAt(index);
    const editing = project.slides.find((x) => x.id === $('#ed-id-text').value);
    if (!editing) return;
    editing.options = editing.options || [];
    editing.options.push({ label: 'Opsi baru', correct: false });
    renderOptionInputs(editing.options);
  }

  function adminEditSlide(id) {
    const s = project.slides.find((x) => x.id === id);
    if (s) adminShowSlideForm(s);
  }

  function adminToggleCorrect(slideId, idx) {
    const s = project.slides.find((x) => x.id === slideId);
    if (s && s.options && s.options[idx]) { s.options[idx].correct = !s.options[idx].correct; renderOptionInputs(s.options); }
  }
  function adminToggleCorrectIdx(idx) {
    const editing = project.slides.find((x) => x.id === $('#ed-id-text').value);
    if (editing && editing.options && editing.options[idx]) { editing.options[idx].correct = !editing.options[idx].correct; }
  }
  function adminEditOptionLabel(idx, val) {
    const editing = project.slides.find((x) => x.id === $('#ed-id-text').value);
    if (editing && editing.options && editing.options[idx]) editing.options[idx].label = val;
  }
  function adminRemoveOption(idx) {
    const editing = project.slides.find((x) => x.id === $('#ed-id-text').value);
    if (editing && editing.options) { editing.options.splice(idx, 1); renderOptionInputs(editing.options); }
  }

  function adminSaveSlideFromForm() {
    const id = $('#ed-id-text').value.trim();
    const type = $('#ed-type').value;
    if (!id) { alert('ID slide wajib diisi'); return; }
    const opts = [];
    $('#ed-options-wrap')?.querySelectorAll('input').forEach((inp, i) => {
      const sel = $('#ed-options-wrap')?.querySelectorAll('select')[i];
      opts.push({ label: inp.value.trim() || `Opsi ${i + 1}`, correct: sel && sel.value === '1' });
    });
    const slide = {
      id, type, title: $('#ed-title').value.trim() || id, text: $('#ed-text').value.trim(),
      speakText: $('#ed-speak').value.trim(), bg: $('#ed-bg').value || '#2563eb', emoji: $('#ed-emoji').value || '\uD83D\uDE00',
      ...(type === 'quiz' ? { options: opts } : {}),
      ...(type === 'map' ? { choices: [] } : {})
    };
    const existing = project.slides.findIndex((x) => x.id === id);
    if (existing >= 0) project.slides[existing] = slide; else project.slides.push(slide);
    saveProject().then(() => { $('#ad-slide-form')?.classList.add('hidden'); renderSlideListAdmin(); renderAdmin(); });
  }

  /* ---------- public API ---------- */
  window.appQuiz = {
    onOption: (optIdx) => onOption(optIdx),
    chooseMap: (target) => { beep('click'); goTo(target); },
    adminLogin,
    adminEditSlide,
    adminToggleCorrect,
    adminToggleCorrectIdx,
    adminEditOptionLabel,
    adminRemoveOption,
    adminDeleteSlide: (id) => { adminDeleteSlide(id); },
    init: async () => {
      loadPrefs();
      await loadProject();
      index = null;
      renderHome();
    }
  };

})();
