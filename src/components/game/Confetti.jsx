/**
 * Confetti — Hujan konfeti ringan, murni CSS (tanpa library).
 */
import { useMemo } from 'react';

const COLORS = ['#f43f5e', '#0ea5e9', '#f59e0b', '#10b981', '#a855f7', '#facc15', '#ffffff'];

export default function Confetti({ count = 90 }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 2.2 + Math.random() * 1.8,
        size: 7 + Math.random() * 8,
        drift: (Math.random() - 0.5) * 220,
        rotate: Math.random() * 360,
        round: Math.random() > 0.65,
        color: COLORS[i % COLORS.length],
      })),
    [count],
  );

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      {pieces.map((p, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.round ? p.size : p.size * 0.45,
            borderRadius: p.round ? '9999px' : '2px',
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            '--drift': `${p.drift}px`,
            '--rot': `${p.rotate}deg`,
          }}
        />
      ))}
    </div>
  );
}
