/**
 * Mascot — Karakter/maskot dengan 3 ekspresi (idle | happy | sad).
 * Fallback: emoji di dalam lingkaran putih.
 */
import { ASSETS, THEME } from '../../config/gameConfig';
import CanvaImage from './CanvaImage';

export default function Mascot({ mood = 'idle', className = 'size-24', emojiClassName = 'text-5xl', float = false }) {
  const motion = float ? 'animate-float' : '';
  return (
    <CanvaImage
      src={ASSETS.mascot[mood]}
      alt=""
      className={`${className} object-contain drop-shadow-xl ${motion}`}
      fallback={
        <span
          aria-hidden
          className={`${className} ${emojiClassName} ${motion} grid shrink-0 place-items-center rounded-full bg-white shadow-xl ring-4 ring-white/50`}
        >
          {THEME.mascotEmoji[mood]}
        </span>
      }
    />
  );
}
