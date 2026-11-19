/**
 * SkinSurface — Wadah (div/button) yang bisa "dikuliti" gambar Canva.
 *
 *   <SkinSurface
 *     src={ASSETS.cardFrame}
 *     className="rounded-3xl"                 ← selalu dipakai
 *     fallbackClassName="bg-white shadow-2xl" ← dipakai jika gambar BELUM ada
 *     skinClassName="px-[9%] py-[8%]"         ← dipakai jika gambar SUDAH ada
 *   />
 *
 * Saat gambar Canva tersedia, warna/bayangan bawaan dilepas dan gambar
 * dipasang sebagai background (stretch / cover / contain).
 */
import { useAssetStatus } from '../../hooks/useAssetStatus';

const FIT = { stretch: '100% 100%', cover: 'cover', contain: 'contain' };

export default function SkinSurface({
  as: Tag = 'div',
  src,
  fit = 'stretch',
  className = '',
  fallbackClassName = '',
  skinClassName = '',
  style,
  children,
  ...rest
}) {
  const skinned = useAssetStatus(src) === 'ok';

  const skinStyle = skinned
    ? {
        backgroundImage: `url("${src}")`,
        backgroundSize: FIT[fit] ?? FIT.stretch,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        ...style,
      }
    : style;

  return (
    <Tag
      className={`${className} ${skinned ? skinClassName : fallbackClassName}`}
      style={skinStyle}
      data-skinned={skinned || undefined}
      {...rest}
    >
      {children}
    </Tag>
  );
}
