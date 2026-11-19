/**
 * OptionButton — Kartu pilihan jawaban (warna + bentuk ala Kahoot).
 *
 * Status:
 *   idle      → normal
 *   selected  → dipilih (mode confirm), belum dikunci
 *   correct   → dipilih & benar
 *   wrong     → dipilih & salah (animasi getar)
 *   reveal    → jawaban benar yang tidak dipilih (ditunjukkan setelah menjawab)
 *   dimmed    → pilihan lain setelah menjawab (terkunci)
 */
import { AudioLines, Check, Circle, Diamond, Square, Triangle, Volume2, X } from 'lucide-react';
import { THEME } from '../../config/gameConfig';
import SkinSurface from '../canva/SkinSurface';

const SHAPES = { triangle: Triangle, diamond: Diamond, circle: Circle, square: Square };

const STATUS_CLASS = {
  idle: '',
  selected: 'ring-4 ring-white scale-[1.02] -translate-y-0.5',
  correct: 'ring-4 ring-emerald-300 animate-pop',
  wrong: 'ring-4 ring-rose-200 animate-shake',
  reveal: 'ring-4 ring-emerald-300',
  dimmed: 'opacity-40 saturate-50',
};

export default function OptionButton({ option, styleDef, skinSrc, status, speaking, disabled, onPress, onSpeak }) {
  const Shape = SHAPES[styleDef.shape] ?? Circle;

  return (
    <div className="relative">
      <SkinSurface
        as="button"
        type="button"
        src={skinSrc}
        onClick={onPress}
        disabled={disabled}
        aria-pressed={status === 'selected'}
        className={`relative flex min-h-[84px] w-full select-none items-center rounded-2xl py-3 pl-16 pr-16 text-left transition-all duration-200 enabled:active:translate-y-1 disabled:cursor-default focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-white sm:min-h-[108px] sm:pl-20 ${
          speaking ? 'ring-4 ring-amber-300 animate-speak-pulse' : ''
        } ${STATUS_CLASS[status]}`}
        fallbackClassName={`${styleDef.className} border-b-[6px] shadow-lg shadow-black/20`}
        skinClassName="bg-transparent drop-shadow-xl"
      >
        <span
          aria-hidden
          className="absolute left-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-xl bg-black/15 text-white sm:left-4 sm:size-12"
        >
          <Shape className="size-6 sm:size-7" fill="currentColor" strokeWidth={1.5} />
        </span>
        <span className={`font-display text-xl font-bold leading-tight sm:text-2xl ${THEME.optionText}`}>
          {option.text}
        </span>
      </SkinSurface>

      {/* Tombol speaker terpisah: selalu bisa ditekan, bahkan setelah menjawab */}
      <button
        type="button"
        onClick={onSpeak}
        aria-label={`Dengarkan pilihan: ${option.text}`}
        className={`absolute right-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full text-white transition focus-visible:outline-4 focus-visible:outline-white ${
          speaking ? 'bg-amber-300 text-amber-950' : 'bg-white/25 hover:bg-white/40'
        }`}
      >
        {speaking ? <AudioLines className="size-6 animate-pulse" /> : <Volume2 className="size-6" />}
      </button>

      {(status === 'correct' || status === 'reveal') && (
        <StatusBadge className="bg-emerald-500">
          <Check className="size-5" strokeWidth={3.5} />
        </StatusBadge>
      )}
      {status === 'wrong' && (
        <StatusBadge className="bg-rose-500">
          <X className="size-5" strokeWidth={3.5} />
        </StatusBadge>
      )}
    </div>
  );
}

function StatusBadge({ className, children }) {
  return (
    <span
      aria-hidden
      className={`absolute -right-2 -top-3 grid size-9 place-items-center rounded-full text-white shadow-lg ring-4 ring-white animate-star ${className}`}
    >
      {children}
    </span>
  );
}
