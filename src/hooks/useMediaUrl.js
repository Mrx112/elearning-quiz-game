import { useEffect, useState } from 'react';
import { isMediaRef, resolveMediaUrl, resolveUrlSync } from '../lib/mediaStore';

/** Ubah referensi aset ("s01/bg.webp" / "media:abc") menjadi URL siap pakai. */
export function useMediaUrl(ref) {
  const [url, setUrl] = useState(() => resolveUrlSync(ref));

  useEffect(() => {
    let alive = true;
    const sync = resolveUrlSync(ref);
    setUrl(sync);
    if (isMediaRef(ref) && !sync) {
      resolveMediaUrl(ref)
        .then((u) => alive && setUrl(u))
        .catch(() => alive && setUrl(''));
    }
    return () => {
      alive = false;
    };
  }, [ref]);

  return url;
}
