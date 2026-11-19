/**
 * ResultPanel — Skor akhir di slide penutup + tombol "Main Lagi".
 */
import { useEffect } from 'react';
import { Home, RotateCcw, Star } from 'lucide-react';
import { useAudio } from '../../audio/AudioProvider';
import { useCountUp } from '../../hooks/useCountUp';

export default function ResultPanel({ box = { x: 22, y: 33, w: 56, h: 40 }, score, stats, onReplay, onHome }) {
  const { sfx } = useAudio();
  const shown = useCountUp(score, { duration: 1200, from: 0 });
  const ratio = stats.total ? stats.correct / stats.total : 0;
  const stars = stats.total ? (ratio >= 0.9 ? 3 : ratio >= 0.6 ? 2 : ratio > 0 ? 1 : 0) : 3;
  const message = stars === 3 ? 'Luar biasa! Kamu juara!' : stars === 2 ? 'Hebat! Terus berlatih ya!' : 'Ayo coba lagi, kamu pasti bisa!';

  useEffect(() => {
    const t = setTimeout(() => sfx('win'), 400);
    return () => clearTimeout(t);
  }, [sfx]);

  return (
    <div
      className="absolute z-[150] flex animate-slide-up flex-col items-center justify-center text-center"
      style={{ left: `${box.x}%`, top: `${box.y}%`, width: `${box.w}%`, height: `${box.h}%`, animationDelay: '0.5s' }}
    >
      <div className="flex items-end gap-[calc(var(--u)*18)]" aria-label={`${stars} dari 3 bintang`}>
        {[0, 1, 2].map((i) => (
          <Star
            key={i}
            className="animate-star drop-shadow"
            style={{
              width: `calc(var(--u)*${i === 1 ? 120 : 92})`,
              height: `calc(var(--u)*${i === 1 ? 120 : 92})`,
              animationDelay: `${0.7 + i * 0.25}s`,
              color: i < stars ? '#f59e0b' : '#cbd5e1',
              fill: i < stars ? '#fbbf24' : '#e2e8f0',
            }}
          />
        ))}
      </div>
      <p className="mt-[calc(var(--u)*10)] font-display font-bold text-slate-800" style={{ fontSize: 'calc(var(--u)*44)' }}>
        {message}
      </p>
      <p className="font-display font-bold text-amber-600" style={{ fontSize: 'calc(var(--u)*92)', lineHeight: 1 }}>
        {shown} <span style={{ fontSize: 'calc(var(--u)*40)' }}>poin</span>
      </p>
      <p className="font-semibold text-slate-600" style={{ fontSize: 'calc(var(--u)*32)' }}>
        Benar {stats.correct} dari {stats.total} soal · {stats.firstTry} benar di percobaan pertama
      </p>
      <div className="mt-[calc(var(--u)*24)] flex gap-[calc(var(--u)*20)]">
        <button
          type="button"
          onClick={onReplay}
          className="flex items-center gap-[calc(var(--u)*12)] rounded-full bg-gradient-to-b from-amber-400 to-orange-500 px-[calc(var(--u)*44)] py-[calc(var(--u)*18)] font-display font-bold text-white shadow-lg ring-[calc(var(--u)*5)] ring-white transition hover:scale-105"
          style={{ fontSize: 'calc(var(--u)*42)' }}
        >
          <RotateCcw style={{ width: 'calc(var(--u)*44)', height: 'calc(var(--u)*44)' }} strokeWidth={3} /> Main Lagi
        </button>
        <button
          type="button"
          onClick={onHome}
          className="flex items-center gap-[calc(var(--u)*12)] rounded-full bg-white px-[calc(var(--u)*36)] py-[calc(var(--u)*18)] font-display font-bold text-slate-700 shadow-lg ring-[calc(var(--u)*5)] ring-slate-200 transition hover:scale-105"
          style={{ fontSize: 'calc(var(--u)*38)' }}
        >
          <Home style={{ width: 'calc(var(--u)*40)', height: 'calc(var(--u)*40)' }} /> Beranda
        </button>
      </div>
    </div>
  );
}
