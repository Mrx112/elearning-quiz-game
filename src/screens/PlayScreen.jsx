/**
 * PlayScreen — Alur permainan slide demi slide.
 *
 *  story  → elemen bisa disentuh untuk dibacakan, tombol "Lanjut" untuk pindah slide
 *  quiz   → pilih jawaban: BENAR = suara "benar" + skor + lanjut otomatis
 *                          SALAH = suara "salah" + coba lagi (atau tampilkan jawaban, sesuai pengaturan)
 *  ending → layar skor akhir + tombol "Main Lagi"
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Home, Languages, Settings, Star, Volume2, VolumeX, Music, Music2, Smartphone } from 'lucide-react';
import Stage from '../components/stage/Stage';
import SlideView from '../components/stage/SlideView';
import FeedbackBanner from '../components/game/FeedbackBanner';
import ResultPanel from '../components/game/ResultPanel';
import Confetti from '../components/game/Confetti';
import { useAudio } from '../audio/AudioProvider';

const isQuiz = (s) => s?.type === 'quiz' && s.elements.some((e) => e.kind === 'option');

export function quizStats(slides, answers) {
  const quizzes = slides.filter(isQuiz);
  const correct = quizzes.filter((s) => answers[s.id]?.correct).length;
  const firstTry = quizzes.filter((s) => answers[s.id]?.correct && answers[s.id]?.attempts === 1).length;
  return { total: quizzes.length, correct, firstTry };
}

function HudButton({ onClick, label, children, active = true }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`hud-btn grid h-9 w-9 place-items-center rounded-full transition sm:h-10 sm:w-10 ${
        active ? 'bg-white/15 text-white hover:bg-white/25' : 'bg-white/5 text-white/50 hover:bg-white/15'
      }`}
    >
      {children}
    </button>
  );
}

export default function PlayScreen({ project, prefs, onPrefsChange, onHome, onAdmin }) {
  const { slides, settings } = project;
  const audio = useAudio();
  const [index, setIndex] = useState(0);
  const [visit, setVisit] = useState(0); // naik tiap pindah slide → animasi diputar ulang
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState({}); // slideId → { correct, attempts }
  const [quiz, setQuiz] = useState({ status: {}, locked: false, reveal: false });
  const [feedback, setFeedback] = useState(null);
  const [confetti, setConfetti] = useState(0);
  const timers = useRef([]);
  const slide = slides[Math.min(index, slides.length - 1)];
  const quizSlide = isQuiz(slide);
  const answered = !!answers[slide?.id]?.done;

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));

  const goTo = useCallback(
    (i) => {
      clearTimers();
      audio.stop();
      setFeedback(null);
      setIndex(Math.max(0, Math.min(slides.length - 1, i)));
      setVisit((v) => v + 1);
      audio.sfx('whoosh');
    },
    [audio, slides.length],
  );
  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = () => goTo(index - 1);

  // Reset state kuis tiap masuk slide (jawaban sebelumnya tetap ditampilkan bila sudah dijawab)
  useEffect(() => {
    const a = answers[slide?.id];
    if (a?.done) {
      const correctEl = slide.elements.find((e) => e.kind === 'option' && e.correct);
      setQuiz({ status: correctEl ? { [correctEl.id]: 'correct' } : {}, locked: true, reveal: true });
    } else {
      setQuiz({ status: {}, locked: false, reveal: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visit]);

  // Narasi otomatis: bacakan teks bertanda "autoRead" secara berurutan
  useEffect(() => {
    if (!settings.autoRead || !prefs.voice || !slide) return undefined;
    let cancelled = false;
    const items = slide.elements.filter((e) => e.autoRead && (e.text || e.speakText || e.audio));
    const run = async () => {
      await new Promise((r) => setTimeout(r, 700));
      for (const e of items) {
        if (cancelled) return;
        await audio.speakAsync({ id: e.id, text: e.speakText || e.text, lang: e.lang, audio: e.audio });
        await new Promise((r) => setTimeout(r, 250));
      }
    };
    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visit, prefs.voice]);

  useEffect(() => () => clearTimers(), []);

  const onOption = (el) => {
    if (quiz.locked || quiz.status[el.id]) return;
    audio.stop();
    const prevA = answers[slide.id] || { attempts: 0 };
    const attempts = prevA.attempts + 1;
    const wrongMode = slide.wrongMode && slide.wrongMode !== 'default' ? slide.wrongMode : settings.wrongMode;

    if (el.correct) {
      const gained = attempts === 1 ? Number(settings.pointsCorrect) || 0 : Number(settings.pointsRetry) || 0;
      setScore((s) => s + gained);
      setAnswers((a) => ({ ...a, [slide.id]: { correct: true, attempts, done: true, chosen: el.text } }));
      setQuiz((q) => ({ ...q, status: { ...q.status, [el.id]: 'correct' }, locked: true }));
      setFeedback({ type: 'correct', points: gained, text: slide.correctText });
      setConfetti((c) => c + 1);
      audio.sfx('correct', settings.correctAudio);
      later(() => audio.speakAsync({ id: 'fb', text: settings.correctVoice, lang: 'auto' }), 450);
      if (settings.autoNextDelay > 0) later(next, settings.autoNextDelay * 1000 + 600);
      return;
    }

    // SALAH
    setQuiz((q) => ({ ...q, status: { ...q.status, [el.id]: 'wrong' } }));
    audio.sfx('wrong', settings.wrongAudio);
    if (wrongMode === 'next') {
      setAnswers((a) => ({ ...a, [slide.id]: { correct: false, attempts, done: true, chosen: el.text } }));
      setQuiz((q) => ({ ...q, locked: true, reveal: true }));
      setFeedback({ type: 'reveal', text: slide.correctText });
      later(() => audio.speakAsync({ id: 'fb', text: slide.correctText || settings.wrongVoice, lang: 'auto' }), 500);
      if (settings.autoNextDelay > 0) later(next, settings.autoNextDelay * 1000 + 1800);
    } else {
      setAnswers((a) => ({ ...a, [slide.id]: { correct: false, attempts, done: false } }));
      setFeedback({ type: 'wrong' });
      later(() => audio.speakAsync({ id: 'fb', text: settings.wrongVoice, lang: 'auto' }), 450);
      later(() => setFeedback((f) => (f?.type === 'wrong' ? null : f)), 1900);
    }
  };

  const replay = () => {
    clearTimers();
    audio.stop();
    setScore(0);
    setAnswers({});
    setFeedback(null);
    setIndex(0);
    setVisit((v) => v + 1);
  };

  const onAction = (action) => {
    if (action === 'next') next();
  };

  const stats = quizStats(slides, answers);
  const isLast = index >= slides.length - 1;
  const canNext = !isLast && (!quizSlide || answered);
  const langLabel = { auto: 'Auto', 'en-US': 'EN', 'id-ID': 'ID' }[prefs.lang] || 'Auto';
  const cycleLang = () => onPrefsChange({ lang: { auto: 'en-US', 'en-US': 'id-ID', 'id-ID': 'auto' }[prefs.lang] || 'auto' });

  if (!slide) return null;

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-sky-900 via-slate-900 to-slate-950">
      {/* ── HUD atas ── */}
      <header className="hud-bar flex shrink-0 items-center gap-2 px-2 py-1.5 text-white sm:px-4">
        <HudButton onClick={onHome} label="Beranda">
          <Home className="h-5 w-5" />
        </HudButton>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-sm font-semibold leading-tight sm:text-base">{project.title}</p>
          <p className="hud-sub truncate text-[11px] text-white/60 sm:text-xs">
            Slide {index + 1} / {slides.length} · {slide.name}
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-1 font-display text-base font-bold text-amber-950 shadow sm:text-lg" aria-live="polite">
          <Star className="h-4 w-4 fill-amber-950 sm:h-5 sm:w-5" /> {score}
        </div>
        <HudButton onClick={cycleLang} label={`Bahasa suara: ${langLabel}`}>
          <span className="flex flex-col items-center leading-none">
            <Languages className="h-4 w-4" />
            <span className="text-[9px] font-bold">{langLabel}</span>
          </span>
        </HudButton>
        <HudButton onClick={() => onPrefsChange({ voice: !prefs.voice })} label={prefs.voice ? 'Matikan suara baca' : 'Nyalakan suara baca'} active={prefs.voice}>
          {prefs.voice ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
        </HudButton>
        <HudButton onClick={() => onPrefsChange({ sfx: !prefs.sfx })} label={prefs.sfx ? 'Matikan efek suara' : 'Nyalakan efek suara'} active={prefs.sfx}>
          {prefs.sfx ? <Music2 className="h-5 w-5" /> : <Music className="h-5 w-5" />}
        </HudButton>
        <HudButton onClick={onAdmin} label="Admin / Kelola Konten">
          <Settings className="h-5 w-5" />
        </HudButton>
      </header>

      {/* ── Panggung ── */}
      <main className="relative min-h-0 flex-1 px-1 sm:px-3">
        <Stage>
          <SlideView key={`${slide.id}-${visit}`} slide={slide} settings={settings} quiz={quiz} onOption={onOption} onAction={onAction}>
            {slide.type === 'ending' && <ResultPanel box={slide.resultBox} score={score} stats={stats} onReplay={replay} onHome={onHome} />}
          </SlideView>
          {feedback && <FeedbackBanner feedback={feedback} onNext={!isLast ? next : null} onClose={() => setFeedback(null)} />}
        </Stage>
        {confetti > 0 && feedback?.type === 'correct' && <Confetti key={confetti} count={70} />}
        <p className="rotate-hint pointer-events-none absolute inset-x-0 bottom-[12%] items-center justify-center gap-2 px-6 text-center text-sm font-semibold text-white/70">
          <Smartphone className="h-5 w-5 rotate-90" /> Putar HP ke posisi mendatar agar tampilan lebih besar
        </p>
      </main>

      {/* ── Navigasi bawah ── */}
      <footer className="hud-bar flex shrink-0 items-center gap-2 px-2 py-1.5 sm:px-4 sm:py-2">
        <button
          type="button"
          onClick={prev}
          disabled={index === 0}
          className="flex items-center gap-1 rounded-full bg-white/15 px-3 py-2 font-display text-sm font-semibold text-white transition hover:bg-white/25 disabled:opacity-30 sm:px-4"
        >
          <ArrowLeft className="h-5 w-5" /> <span className="hidden sm:inline">Kembali</span>
        </button>
        <div className="flex min-w-0 flex-1 items-center justify-center gap-1 overflow-hidden" aria-hidden>
          {slides.map((s, i) => (
            <span
              key={s.id}
              className={`h-2 shrink-0 rounded-full transition-all ${i === index ? 'w-6 bg-amber-400' : 'w-2'} ${
                i !== index ? (answers[s.id]?.correct ? 'bg-green-400' : answers[s.id]?.done ? 'bg-red-400' : i < index ? 'bg-white/60' : 'bg-white/20') : ''
              }`}
            />
          ))}
        </div>
        {quizSlide && !answered && <span className="hidden text-xs font-semibold text-white/70 sm:inline">Pilih jawaban dulu ya!</span>}
        <button
          type="button"
          onClick={next}
          disabled={!canNext}
          className={`flex items-center gap-1 rounded-full px-4 py-2 font-display text-sm font-bold transition disabled:opacity-30 sm:px-5 sm:text-base ${
            canNext ? 'bg-amber-400 text-amber-950 shadow-lg hover:bg-amber-300' : 'bg-white/15 text-white'
          }`}
        >
          <span>Lanjut</span> <ArrowRight className="h-5 w-5" />
        </button>
      </footer>
    </div>
  );
}
