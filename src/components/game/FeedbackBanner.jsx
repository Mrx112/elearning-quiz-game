/**
 * FeedbackBanner — Popup umpan balik di atas panggung (gaya Kahoot / Quizizz).
 *   correct → hijau, "+poin", teks jawaban benar, tombol Lanjut
 *   wrong   → merah, "Coba lagi!"
 *   reveal  → oranye, menampilkan jawaban benar (mode "lanjut walau salah")
 */
import { ArrowRight, PartyPopper, RotateCcw, Lightbulb } from 'lucide-react';

const THEMES = {
  correct: { bg: 'from-green-500 to-emerald-600', title: 'Benar! Hebat!', Icon: PartyPopper },
  wrong: { bg: 'from-rose-500 to-red-600', title: 'Belum tepat — coba lagi!', Icon: RotateCcw },
  reveal: { bg: 'from-amber-500 to-orange-600', title: 'Belum tepat', Icon: Lightbulb },
};

export default function FeedbackBanner({ feedback, onNext, onClose }) {
  const t = THEMES[feedback.type] || THEMES.wrong;
  const { Icon } = t;
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-[5%] z-[200] flex justify-center px-[4%]" role="status" aria-live="assertive">
      <div
        className={`pointer-events-auto flex animate-slide-up items-center gap-[calc(var(--u)*28)] rounded-[calc(var(--u)*36)] bg-gradient-to-r ${t.bg} px-[calc(var(--u)*40)] py-[calc(var(--u)*22)] text-white shadow-2xl ring-[calc(var(--u)*6)] ring-white/70`}
        style={{ maxWidth: '92%' }}
      >
        <span className="grid shrink-0 place-items-center rounded-full bg-white/25" style={{ width: 'calc(var(--u)*96)', height: 'calc(var(--u)*96)' }}>
          <Icon style={{ width: '58%', height: '58%' }} strokeWidth={2.4} />
        </span>
        <div className="min-w-0">
          <p className="font-display font-bold leading-tight" style={{ fontSize: 'calc(var(--u)*56)' }}>
            {t.title}
            {feedback.type === 'correct' && feedback.points > 0 && (
              <span className="ml-[calc(var(--u)*16)] inline-block animate-star rounded-full bg-white/25 px-[calc(var(--u)*18)] align-middle" style={{ fontSize: 'calc(var(--u)*40)' }}>
                +{feedback.points}
              </span>
            )}
          </p>
          {feedback.text && feedback.type !== 'wrong' && (
            <p className="font-semibold text-white/95" style={{ fontSize: 'calc(var(--u)*36)' }}>
              {feedback.text}
            </p>
          )}
        </div>
        {feedback.type !== 'wrong' && onNext && (
          <button
            type="button"
            onClick={onNext}
            className="flex shrink-0 items-center gap-[calc(var(--u)*10)] rounded-full bg-white px-[calc(var(--u)*34)] py-[calc(var(--u)*16)] font-display font-bold text-slate-800 shadow-lg transition hover:scale-105"
            style={{ fontSize: 'calc(var(--u)*38)' }}
          >
            Lanjut <ArrowRight style={{ width: 'calc(var(--u)*40)', height: 'calc(var(--u)*40)' }} />
          </button>
        )}
        {feedback.type === 'wrong' && (
          <button type="button" onClick={onClose} className="sr-only">
            Tutup
          </button>
        )}
      </div>
    </div>
  );
}
