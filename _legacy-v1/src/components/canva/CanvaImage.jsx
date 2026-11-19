/**
 * CanvaImage — <img> dengan fallback otomatis.
 *
 *   <CanvaImage src={ASSETS.logo} fallback={<JudulTeks />} />
 *
 * Gambar Canva tampil jika file ada; jika belum ada → `fallback` yang tampil.
 */
import { useAssetStatus } from '../../hooks/useAssetStatus';

export default function CanvaImage({ src, alt = '', className = '', fallback = null, ...rest }) {
  const status = useAssetStatus(src);
  if (status !== 'ok') return fallback;
  return <img src={src} alt={alt} className={className} draggable={false} {...rest} />;
}
