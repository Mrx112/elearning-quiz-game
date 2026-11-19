/**
 * AppBackground — Latar belakang seluruh aplikasi.
 *   - Belum ada gambar → gradien Tailwind + dekorasi lingkaran blur.
 *   - Ada bg-main.png   → dipakai di layar lebar (≥ 768px).
 *   - Ada bg-mobile.png → dipakai di HP (jika tidak ada, HP memakai bg-main.png).
 */
import { ASSETS, THEME } from '../../config/gameConfig';
import { useAssetStatus } from '../../hooks/useAssetStatus';

export default function AppBackground({ children }) {
  const hasDesktop = useAssetStatus(ASSETS.background) === 'ok';
  const hasMobile = useAssetStatus(ASSETS.backgroundMobile) === 'ok';
  const mobileSrc = hasMobile ? ASSETS.backgroundMobile : hasDesktop ? ASSETS.background : null;

  return (
    <div className={`relative min-h-dvh overflow-x-hidden ${THEME.background}`}>
      <Decorations />

      {mobileSrc && (
        <div
          aria-hidden
          className="fixed inset-0 bg-cover bg-center md:hidden"
          style={{ backgroundImage: `url("${mobileSrc}")` }}
        />
      )}
      {hasDesktop && (
        <div
          aria-hidden
          className="fixed inset-0 hidden bg-cover bg-center md:block"
          style={{ backgroundImage: `url("${ASSETS.background}")` }}
        />
      )}

      <div className="relative z-10">{children}</div>
    </div>
  );
}

function Decorations() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute -left-24 -top-24 size-80 rounded-full bg-fuchsia-400/40 blur-3xl" />
      <div className="absolute -right-20 top-1/3 size-96 rounded-full bg-sky-400/30 blur-3xl" />
      <div className="absolute -bottom-32 left-1/4 size-96 rounded-full bg-amber-300/25 blur-3xl" />
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: 'radial-gradient(circle, white 1.5px, transparent 1.5px)',
          backgroundSize: '28px 28px',
        }}
      />
    </div>
  );
}
