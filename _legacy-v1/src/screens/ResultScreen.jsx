/**
 * ResultScreen — Skor total, benar/salah, akurasi, bintang, badge & papan peringkat.
 */
import { Award, Crown, House, ListChecks, Medal, RotateCcw, Star, Trophy } from 'lucide-react';
import { ASSETS, GAME_SETTINGS, UI_TEXT } from '../config/gameConfig';
import { useCountUp } from '../hooks/useCountUp';
import CanvaImage from '../components/canva/CanvaImage';
import Confetti from '../components/game/Confetti';
import GameButton from '../components/ui/GameButton';

/** Tentukan jumlah bintang & jenis badge dari akurasi. */
function getTier(accuracy) {
  const t = GAME_SETTINGS.starThresholds;
  const stars = accuracy >= t.three ? 3 : accuracy >= t.two ? 2 : accuracy >= t.one ? 1 : 0;
  const badge = stars === 3 ? 'gold' : stars === 2 ? 'silver' : 'bronze';
  return { stars, badge, ...UI_TEXT.tiers[stars] };
}

export default function ResultScreen({ result, playerName, leaderboard, onReplay, onReview, onHome }) {
  const { score, answers, entryId } = result;
  const total = answers.length;
  const correct = answers.filter((a) => a.isCorrect).length;
  const accuracy = total ? Math.round((correct / total) * 100) : 0;
  const tier = getTier(accuracy);
  const displayScore = useCountUp(score, { duration: 1400, from: 0 });

  return (
    <main className="flex min-h-dvh justify-center px-4 py-8">
      {tier.stars >= 2 && <Confetti count={tier.stars === 3 ? 120 : 60} />}

      <div className="flex w-full max-w-2xl flex-col gap-5">
        <section className="relative mt-16 rounded-3xl bg-white/95 p-6 text-center sm:mt-20 shadow-2xl shadow-indigo-950/30 animate-slide-up sm:p-8">
          <ResultBadge type={tier.badge} />

          <h1 className="mt-3 font-display text-3xl font-bold text-slate-800 sm:text-4xl">
            {tier.title}
            {playerName ? `, ${playerName}` : ''}!
          </h1>
          <p className="mt-1 font-semibold text-slate-500">{tier.message}</p>

          <Stars count={tier.stars} />

          <div className="mt-2 font-display text-6xl font-bold tabular-nums text-indigo-700">
            {displayScore.toLocaleString('id-ID')}
          </div>
          <p className="font-extrabold uppercase tracking-widest text-slate-400">{UI_TEXT.points}</p>

          <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
            <Stat label={UI_TEXT.correctCount} value={correct} className="bg-emerald-50 text-emerald-700 ring-emerald-200" />
            <Stat label={UI_TEXT.wrongCount} value={total - correct} className="bg-rose-50 text-rose-700 ring-rose-200" />
            <Stat label={UI_TEXT.accuracy} value={`${accuracy}%`} className="bg-indigo-50 text-indigo-700 ring-indigo-200" />
          </div>

          <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-linear-to-r from-emerald-400 to-emerald-500 transition-[width] duration-1000"
              style={{ width: `${accuracy}%` }}
            />
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <GameButton icon={RotateCcw} onClick={onReplay}>
              {UI_TEXT.replay}
            </GameButton>
            <GameButton variant="secondary" icon={ListChecks} onClick={onReview}>
              {UI_TEXT.review}
            </GameButton>
          </div>
          <button
            type="button"
            onClick={onHome}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl px-3 py-2 font-extrabold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          >
            <House className="size-4" />
            {UI_TEXT.home}
          </button>
        </section>

        {GAME_SETTINGS.leaderboard.enabled && <Leaderboard list={leaderboard} highlightId={entryId} />}
      </div>
    </main>
  );
}

const BADGE_FALLBACK = {
  gold: { Icon: Trophy, className: 'from-amber-300 to-yellow-500 text-amber-900' },
  silver: { Icon: Medal, className: 'from-slate-200 to-slate-400 text-slate-700' },
  bronze: { Icon: Award, className: 'from-orange-300 to-amber-700 text-orange-950' },
};

function ResultBadge({ type }) {
  const { Icon, className } = BADGE_FALLBACK[type];
  return (
    <CanvaImage
      src={ASSETS.badges[type]}
      alt=""
      className="mx-auto -mt-20 size-32 object-contain drop-shadow-xl animate-star sm:-mt-24 sm:size-40"
      fallback={
        <div
          className={`mx-auto -mt-20 grid size-28 place-items-center rounded-full bg-linear-to-br shadow-xl ring-8 ring-white animate-star sm:-mt-24 sm:size-32 ${className}`}
        >
          <Icon className="size-14 sm:size-16" strokeWidth={2} />
        </div>
      }
    />
  );
}

function Stars({ count }) {
  return (
    <div className="mt-4 flex items-end justify-center gap-2">
      {[0, 1, 2].map((i) => {
        const on = i < count;
        const size = i === 1 ? 'size-16' : 'size-12';
        return (
          <span key={i} className="animate-star" style={{ animationDelay: `${0.3 + i * 0.2}s` }}>
            <CanvaImage
              src={on ? ASSETS.stars.on : ASSETS.stars.off}
              alt=""
              className={`${size} object-contain`}
              fallback={
                <Star
                  className={`${size} ${on ? 'text-amber-400 drop-shadow-[0_3px_0_rgba(180,83,9,0.5)]' : 'text-slate-200'}`}
                  fill="currentColor"
                  strokeWidth={1}
                />
              }
            />
          </span>
        );
      })}
    </div>
  );
}

function Stat({ label, value, className }) {
  return (
    <div className={`rounded-2xl px-2 py-3 ring-2 ${className}`}>
      <div className="font-display text-3xl font-bold tabular-nums">{value}</div>
      <div className="text-xs font-extrabold uppercase tracking-wider opacity-80">{label}</div>
    </div>
  );
}

function Leaderboard({ list, highlightId }) {
  return (
    <section className="rounded-3xl bg-white/95 p-5 shadow-2xl shadow-indigo-950/30 animate-fade-in sm:p-6">
      <h2 className="mb-3 flex items-center gap-2 font-display text-2xl font-bold text-slate-800">
        <Crown className="size-6 text-amber-500" fill="currentColor" />
        {UI_TEXT.leaderboard}
      </h2>
      {list.length === 0 ? (
        <p className="font-semibold text-slate-500">{UI_TEXT.leaderboardEmpty}</p>
      ) : (
        <ol className="space-y-2">
          {list.map((entry, i) => {
            const isMe = entry.id === highlightId;
            return (
              <li
                key={entry.id}
                className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 ${
                  isMe ? 'bg-amber-50 ring-2 ring-amber-300' : 'bg-slate-50 ring-1 ring-slate-200'
                }`}
              >
                <span
                  className={`grid size-9 shrink-0 place-items-center rounded-xl font-display font-bold ${
                    i === 0 ? 'bg-amber-400 text-amber-950' : i === 1 ? 'bg-slate-300 text-slate-800' : i === 2 ? 'bg-orange-300 text-orange-950' : 'bg-white text-slate-500 ring-1 ring-slate-200'
                  }`}
                >
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1 truncate font-extrabold text-slate-800">
                  {entry.name}
                  {isMe && (
                    <span className="ml-2 rounded-full bg-amber-300 px-2 py-0.5 text-xs text-amber-950">{UI_TEXT.you}</span>
                  )}
                </span>
                <span className="text-sm font-bold text-slate-500">
                  {entry.correct}/{entry.total}
                </span>
                <span className="w-20 text-right font-display text-lg font-bold tabular-nums text-indigo-700">
                  {entry.score.toLocaleString('id-ID')}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
