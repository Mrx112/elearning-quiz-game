/**
 * useCountUp — Animasi angka naik (mis. skor 0 → 1.850).
 */
import { useEffect, useRef, useState } from 'react';

export function useCountUp(value, { duration = 700, from } = {}) {
  const initial = from ?? value;
  const [display, setDisplay] = useState(initial);
  const displayRef = useRef(initial);

  useEffect(() => {
    const start = displayRef.current;
    if (start === value) return undefined;

    let raf;
    const t0 = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - (1 - p) ** 3; // ease-out cubic
      const next = Math.round(start + (value - start) * eased);
      displayRef.current = next;
      setDisplay(next);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return display;
}
