/**
 * TopBar — Tombol keluar, progress bar per soal, skor real-time, streak & timer.
 */
import { Flame, Pause, Star, Timer, User, X } from 'lucide-react';
import { UI_TEXT } from '../../config/gameConfig';
import { useCountUp } from '../../hooks/useCountUp';

export default function TopBar({
  index,
  total,
  answers,
  score,
  streak,
  timeLeft,
  timeLimit,
  timerPaused,
  playerName,
  onQuit,
}) {
  const displayScore = useCountUp(score);
  const ratio = timeLimit ? timeLeft / timeLimit : 0;
  const urgent = ratio < 0.25;

  return (
    <header className="mx-auto w-full max-w-5xl px-4 pt-4 sm:pt-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onQuit}
          aria-label={UI_TEXT.quit}
          className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white/15 text-white backdrop-blur transition hover:bg-white/25 focus-visible:outline-4 focus-visible:outline-white"
        >
          <X className="size-6" strokeWidth={2.5} />
        </button>

        {/* Progress per soal: hijau = benar, merah = salah, putih = soal aktif */}
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex items-center justify-between gap-2 text-sm font-extrabold text-white/90">
            <span>
              {UI_TEXT.question} {index + 1} / {total}
            </span>
            {playerName && (
              <span className="flex min-w-0 items-center gap-1">
                <User className="size-4 shrink-0" />
                <span className="truncate">{playerName}</span>
              </span>
            )}
          </div>
          <div className="flex gap-1.5" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={index + 1}>
            {Array.from({ length: total }, (_, i) => {
              const answer = answers[i];
              const color = answer
                ? answer.isCorrect
                  ? 'bg-emerald-400'
                  : 'bg-rose-400'
                : i === index
                  ? 'bg-white'
                  : 'bg-white/25';
              return <span key={i} className={`h-3 flex-1 rounded-full transition-colors duration-300 ${color}`} />;
            })}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
          <div className="flex items-center gap-1.5 rounded-2xl bg-white px-3 py-2 shadow-lg sm:px-4">
            <Star className="size-5 text-amber-400" fill="currentColor" />
            <span className="font-display text-xl font-bold tabular-nums text-slate-800">
              {displayScore.toLocaleString('id-ID')}
            </span>
          </div>
        </div>
      </div>

      {/* Timer */}
      {timeLimit > 0 && (
        <div className="mt-3 flex items-center gap-3">
          <div
            className={`flex min-w-[4.5rem] items-center justify-center gap-1.5 rounded-xl px-2.5 py-1 font-display text-lg font-bold tabular-nums ${
              urgent && !timerPaused ? 'animate-pulse bg-rose-500 text-white' : 'bg-white/20 text-white'
            }`}
          >
            {timerPaused ? <Pause className="size-4" /> : <Timer className="size-4" />}
            {Math.ceil(timeLeft)}s
          </div>
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-black/20">
            <div
              className={`h-full rounded-full transition-[width] duration-100 ease-linear ${
                urgent ? 'bg-rose-400' : ratio < 0.5 ? 'bg-amber-300' : 'bg-emerald-300'
              }`}
              style={{ width: `${ratio * 100}%` }}
            />
          </div>
          {streak >= 2 && (
            <span className="flex shrink-0 items-center gap-1 rounded-xl bg-orange-500 px-2.5 py-1 text-sm font-extrabold text-white shadow animate-pop">
              <Flame className="size-4" fill="currentColor" />
              {UI_TEXT.streak(streak)}
            </span>
          )}
        </div>
      )}
      {timerPaused && timeLimit > 0 && (
        <p className="mt-1 text-xs font-bold text-white/80">{UI_TEXT.timerPaused}</p>
      )}
    </header>
  );
}
