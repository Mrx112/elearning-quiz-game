/**
 * GameScreen — Layar bermain.
 *
 * Tugas komponen ini hanya "menyambungkan":
 *   useQuizGame (logika)  +  useAudio (suara)  +  komponen tampilan.
 */
import { useEffect, useRef, useState } from 'react';
import { Lock, Pointer } from 'lucide-react';
import { ASSETS, GAME_SETTINGS, THEME, UI_TEXT } from '../config/gameConfig';
import { useAudio } from '../audio/AudioProvider';
import { useQuizGame } from '../hooks/useQuizGame';
import TopBar from '../components/game/TopBar';
import QuestionCard, { questionSpeechId } from '../components/game/QuestionCard';
import OptionButton from '../components/game/OptionButton';
import FeedbackPanel from '../components/game/FeedbackPanel';
import GameButton from '../components/ui/GameButton';

const optionSpeechId = (q, opt) => `${q.id}-opt-${opt.id}`;

export default function GameScreen({ questions, playerName, onFinish, onQuit }) {
  const { speak, stop, speakingId, sfx } = useAudio();
  const [quitOpen, setQuitOpen] = useState(false);

  const timerPaused = (GAME_SETTINGS.timer.pauseWhileSpeaking && speakingId !== null) || quitOpen;
  const game = useQuizGame(questions, { paused: timerPaused });
  const { question, phase, selectedId, lastResult } = game;
  const confirmMode = GAME_SETTINGS.answerMode === 'confirm';

  /* ── Bacakan soal otomatis saat soal baru muncul ── */
  const speakRef = useRef(speak);
  speakRef.current = speak;
  useEffect(() => {
    if (!GAME_SETTINGS.autoReadQuestion) return undefined;
    const t = setTimeout(() => {
      speakRef.current({
        id: questionSpeechId(question),
        text: question.speak || question.question,
        lang: question.lang,
        audioSrc: question.audio,
      });
    }, 450);
    return () => clearTimeout(t);
  }, [question]);

  /* ── Efek suara benar/salah ── */
  useEffect(() => {
    if (!lastResult) return;
    stop();
    sfx(lastResult.isCorrect ? 'correct' : 'wrong');
  }, [lastResult, stop, sfx]);

  /* ── Detak 5 detik terakhir ── */
  const secondsLeft = Math.ceil(game.timeLeft);
  useEffect(() => {
    if (game.timeLimit && phase === 'answering' && secondsLeft > 0 && secondsLeft <= 5) sfx('tick');
  }, [secondsLeft]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Aksi pemain ── */
  const speakOption = (opt) =>
    speak({
      id: optionSpeechId(question, opt),
      text: opt.speak || opt.text,
      lang: opt.lang || question.lang,
      audioSrc: opt.audio,
    });

  const handleOptionPress = (opt) => {
    if (phase !== 'answering') return;
    if (confirmMode) {
      game.select(opt.id);
      sfx('select');
      speakOption(opt); // sentuh pilihan = dibacakan
    } else {
      game.submit(opt.id);
    }
  };

  const handleConfirm = () => {
    if (phase === 'answering' && selectedId) game.submit();
  };

  const handleNext = () => {
    stop();
    if (game.isLast) {
      sfx('win');
      onFinish({ score: game.score, answers: game.answers });
    } else {
      game.next();
    }
  };

  /* ── Keyboard: 1–4 memilih, Enter mengunci ── */
  useEffect(() => {
    const onKey = (e) => {
      if (quitOpen || phase !== 'answering' || e.target.tagName === 'INPUT') return;
      const n = Number(e.key);
      if (n >= 1 && n <= question.options.length) {
        e.preventDefault();
        handleOptionPress(question.options[n - 1]);
      } else if (e.key === 'Enter' && confirmMode && selectedId && e.target.tagName !== 'BUTTON') {
        // preventDefault: cegah Enter yang sama ikut "menekan" tombol Soal Berikutnya yang langsung fokus
        e.preventDefault();
        handleConfirm();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  /* ── Status visual tiap pilihan ── */
  const statusOf = (opt) => {
    if (phase === 'answering') return selectedId === opt.id ? 'selected' : 'idle';
    if (opt.id === question.correct) return selectedId === opt.id ? 'correct' : 'reveal';
    return opt.id === selectedId ? 'wrong' : 'dimmed';
  };

  const gridCols =
    question.options.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2';

  return (
    <div className="flex min-h-dvh flex-col">
      <TopBar
        index={game.index}
        total={game.total}
        answers={game.answers}
        score={game.score}
        streak={game.streak}
        timeLeft={game.timeLeft}
        timeLimit={game.timeLimit}
        timerPaused={timerPaused && phase === 'answering'}
        playerName={playerName}
        onQuit={() => setQuitOpen(true)}
      />

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 px-4 pb-72 pt-4 sm:gap-5 sm:pt-5">
        <QuestionCard key={question.id} question={question} index={game.index} />

        <p className="flex items-center justify-center gap-1.5 text-center text-sm font-bold text-white/90">
          <Pointer className="size-4 shrink-0" />
          {confirmMode ? UI_TEXT.confirmHint : UI_TEXT.tapHint}
        </p>

        <div className={`grid gap-3 sm:gap-4 ${gridCols}`}>
          {question.options.map((opt, i) => (
            <OptionButton
              key={`${question.id}-${opt.id}`}
              option={opt}
              styleDef={THEME.options[i % THEME.options.length]}
              skinSrc={ASSETS.optionButtons[i]}
              status={statusOf(opt)}
              speaking={speakingId === optionSpeechId(question, opt)}
              disabled={phase !== 'answering'}
              onPress={() => handleOptionPress(opt)}
              onSpeak={() => speakOption(opt)}
            />
          ))}
        </div>

        {confirmMode && phase === 'answering' && (
          <div className="sticky bottom-4 z-20 mt-2 flex justify-center">
            <GameButton
              icon={Lock}
              disabled={!selectedId}
              onClick={handleConfirm}
              sound={null}
              className="w-full max-w-sm shadow-2xl"
            >
              {selectedId ? UI_TEXT.confirm : UI_TEXT.chooseFirst}
            </GameButton>
          </div>
        )}
      </main>

      {phase === 'feedback' && lastResult && (
        <FeedbackPanel result={lastResult} isLast={game.isLast} onNext={handleNext} />
      )}

      {quitOpen && (
        <QuitDialog
          onCancel={() => setQuitOpen(false)}
          onConfirm={() => {
            stop();
            onQuit();
          }}
        />
      )}
    </div>
  );
}

function QuitDialog({ onCancel, onConfirm }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quit-title"
      className="fixed inset-0 z-50 grid place-items-center bg-indigo-950/60 p-4 backdrop-blur-sm animate-fade-in"
    >
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl animate-slide-up">
        <h2 id="quit-title" className="font-display text-2xl font-bold text-slate-800">
          {UI_TEXT.quitTitle}
        </h2>
        <p className="mt-1 font-semibold text-slate-500">{UI_TEXT.quitBody}</p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <GameButton size="md" variant="secondary" onClick={onCancel} autoFocus>
            {UI_TEXT.quitNo}
          </GameButton>
          <GameButton size="md" variant="danger" onClick={onConfirm}>
            {UI_TEXT.quitYes}
          </GameButton>
        </div>
      </div>
    </div>
  );
}
