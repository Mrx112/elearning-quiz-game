/**
 * Stage — Panggung 16:9 (kanvas desain 1920 × 1080) yang otomatis menyesuaikan ukuran wadah.
 * Variabel CSS --u = 1 "px desain", jadi semua ukuran ikut terskala di laptop, tablet, maupun HP.
 */
import { forwardRef, useLayoutEffect, useRef, useState } from 'react';

export const DESIGN_W = 1920;
export const DESIGN_H = 1080;

const Stage = forwardRef(function Stage({ children, className = '', fit = 'contain', style }, ref) {
  const wrapRef = useRef(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return undefined;
    const measure = () => {
      const { width, height } = el.getBoundingClientRect();
      let w = width;
      let h = (width * DESIGN_H) / DESIGN_W;
      if (fit === 'contain' && h > height) {
        h = height;
        w = (height * DESIGN_W) / DESIGN_H;
      }
      setSize({ w: Math.floor(w), h: Math.floor(h) });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [fit]);

  return (
    <div ref={wrapRef} className="flex h-full w-full items-center justify-center">
      {size.w > 0 && (
        <div
          ref={ref}
          className={`stage shadow-2xl ${className}`}
          style={{ width: size.w, height: size.h, '--u': `${size.w / DESIGN_W}px`, ...style }}
        >
          {children}
        </div>
      )}
    </div>
  );
});

export default Stage;
