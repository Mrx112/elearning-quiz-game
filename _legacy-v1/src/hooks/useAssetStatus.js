/**
 * useAssetStatus — Mengecek apakah sebuah gambar Canva benar-benar ada.
 *
 * Mengembalikan:
 *   'none'    → path kosong (tidak memakai aset)
 *   'loading' → sedang dimuat
 *   'ok'      → gambar berhasil dimuat  → tampilkan aset Canva
 *   'error'   → file tidak ada / rusak  → pakai gaya Tailwind bawaan
 *
 * Hasil disimpan di cache agar setiap gambar hanya dicek sekali.
 * (Setelah menambah file baru ke /public, refresh browser.)
 */
import { useEffect, useState } from 'react';

const cache = new Map();

export function useAssetStatus(src) {
  const [status, setStatus] = useState(() => (src ? cache.get(src) ?? 'loading' : 'none'));

  useEffect(() => {
    if (!src) {
      setStatus('none');
      return undefined;
    }
    if (cache.has(src)) {
      setStatus(cache.get(src));
      return undefined;
    }

    let alive = true;
    setStatus('loading');
    const img = new Image();
    img.onload = () => {
      cache.set(src, 'ok');
      if (alive) setStatus('ok');
    };
    img.onerror = () => {
      cache.set(src, 'error');
      if (alive) setStatus('error');
    };
    img.src = src;

    return () => {
      alive = false;
    };
  }, [src]);

  return status;
}
