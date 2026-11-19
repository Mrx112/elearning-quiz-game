/**
 * GameButton — Tombol bergaya "game" (efek tekan 3D) + suara klik.
 * Varian 'primary' bisa diganti gambar Canva (ASSETS.primaryButton).
 */
import { ASSETS } from '../../config/gameConfig';
import { useAudio } from '../../audio/AudioProvider';
import SkinSurface from '../canva/SkinSurface';

const VARIANTS = {
  primary: 'bg-amber-400 text-amber-950 border-amber-600 enabled:hover:bg-amber-300',
  secondary: 'bg-white text-slate-800 border-slate-300 enabled:hover:bg-slate-50',
  danger: 'bg-rose-500 text-white border-rose-700 enabled:hover:bg-rose-400',
};

const SIZES = {
  md: 'min-h-12 px-5 text-lg',
  lg: 'min-h-16 px-8 text-xl sm:text-2xl',
};

export default function GameButton({
  variant = 'primary',
  size = 'lg',
  icon: Icon,
  iconRight: IconRight,
  sound = 'click',
  className = '',
  onClick,
  children,
  ...rest
}) {
  const { sfx } = useAudio();

  const handleClick = (event) => {
    if (sound) sfx(sound);
    onClick?.(event);
  };

  return (
    <SkinSurface
      as="button"
      type="button"
      src={variant === 'primary' ? ASSETS.primaryButton : ''}
      onClick={handleClick}
      className={`inline-flex select-none items-center justify-center gap-2.5 rounded-2xl font-display font-bold transition-all duration-150 enabled:active:translate-y-1 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-white ${SIZES[size]} ${className}`}
      fallbackClassName={`${VARIANTS[variant]} border-b-[6px] shadow-lg shadow-black/20 enabled:active:border-b-2`}
      skinClassName="text-white drop-shadow-[0_2px_0_rgba(0,0,0,0.3)]"
      {...rest}
    >
      {Icon && <Icon className="size-6 shrink-0" strokeWidth={2.5} />}
      <span>{children}</span>
      {IconRight && <IconRight className="size-6 shrink-0" strokeWidth={2.5} />}
    </SkinSurface>
  );
}
