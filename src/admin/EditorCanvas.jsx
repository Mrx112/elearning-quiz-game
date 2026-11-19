/**
 * EditorCanvas — Kanvas visual Admin Panel.
 *   • klik elemen = pilih   • seret = pindahkan   • tarik titik sudut = ubah ukuran
 *   • panah keyboard = geser halus (Shift = lebih jauh)   • Delete = hapus elemen
 *   • "Tampilkan desain Canva" = overlay gambar 'gambaran' semi-transparan untuk mencocokkan posisi
 */
import { useEffect, useRef } from 'react';
import Stage from '../components/stage/Stage';
import SlideView from '../components/stage/SlideView';
import { useMediaUrl } from '../hooks/useMediaUrl';

const KIND_COLOR = {
  image: 'ring-sky-400',
  text: 'ring-fuchsia-400',
  option: 'ring-amber-400',
  hotspot: 'ring-emerald-400',
};
const KIND_LABEL = { image: 'Gambar', text: 'Teks', option: 'Pilihan', hotspot: 'Area sentuh' };
const HANDLES = ['nw', 'ne', 'sw', 'se'];

function Reference({ src, opacity }) {
  const url = useMediaUrl(src);
  if (!url) return null;
  return <img src={url} alt="" className="pointer-events-none absolute inset-0 z-[400] h-full w-full object-cover" style={{ opacity }} />;
}

export default function EditorCanvas({ slide, settings, selectedId, onSelect, onChangeEl, onDeleteEl, refOpacity, showRef, showBoxes }) {
  const stageRef = useRef(null);
  const drag = useRef(null);

  const startDrag = (e, el, mode) => {
    e.stopPropagation();
    e.preventDefault();
    onSelect(el.id);
    const rect = stageRef.current.getBoundingClientRect();
    drag.current = { mode, id: el.id, sx: e.clientX, sy: e.clientY, rect, orig: { x: el.x, y: el.y, w: el.w, h: el.h }, keepRatio: e.shiftKey };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const onMove = (e) => {
    const d = drag.current;
    if (!d) return;
    const dx = ((e.clientX - d.sx) / d.rect.width) * 100;
    const dy = ((e.clientY - d.sy) / d.rect.height) * 100;
    const o = d.orig;
    const r2 = (v) => Math.round(v * 100) / 100;
    if (d.mode === 'move') {
      onChangeEl(d.id, { x: r2(o.x + dx), y: r2(o.y + dy) });
      return;
    }
    let { x, y, w, h } = o;
    if (d.mode.includes('e')) w = o.w + dx;
    if (d.mode.includes('s')) h = o.h + dy;
    if (d.mode.includes('w')) {
      w = o.w - dx;
      x = o.x + dx;
    }
    if (d.mode.includes('n')) {
      h = o.h - dy;
      y = o.y + dy;
    }
    if (e.shiftKey) {
      // jaga rasio
      const ratio = o.h / o.w;
      h = w * ratio;
      if (d.mode.includes('n')) y = o.y + o.h - h;
    }
    if (w < 1 || h < 1) return;
    onChangeEl(d.id, { x: r2(x), y: r2(y), w: r2(w), h: r2(h) });
  };

  const endDrag = () => {
    drag.current = null;
  };

  // keyboard: geser & hapus
  useEffect(() => {
    const onKey = (e) => {
      if (!selectedId) return;
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      const el = slide.elements.find((x) => x.id === selectedId);
      if (!el) return;
      const step = e.shiftKey ? 1 : 0.2;
      const moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
      if (moves[e.key]) {
        e.preventDefault();
        const [mx, my] = moves[e.key];
        onChangeEl(el.id, { x: Math.round((el.x + mx) * 100) / 100, y: Math.round((el.y + my) * 100) / 100 });
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        onDeleteEl(el.id);
      } else if (e.key === 'Escape') {
        onSelect(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedId, slide, onChangeEl, onDeleteEl, onSelect]);

  return (
    <Stage ref={stageRef} className="editing">
      <SlideView slide={slide} settings={settings} mode="edit" />
      {showRef && <Reference src={slide.reference} opacity={refOpacity} />}
      <div className="absolute inset-0 z-[500]" onPointerDown={() => onSelect(null)} onPointerMove={onMove} onPointerUp={endDrag} onPointerCancel={endDrag}>
        {slide.elements.map((el) => {
          const sel = el.id === selectedId;
          return (
            <div
              key={el.id}
              role="button"
              tabIndex={-1}
              aria-label={`${KIND_LABEL[el.kind]}: ${el.text || el.speakText || ''}`}
              onPointerDown={(e) => startDrag(e, el, 'move')}
              className={`absolute cursor-move touch-none ${sel ? `ring-2 ${KIND_COLOR[el.kind]} bg-white/10` : showBoxes ? `ring-1 ${KIND_COLOR[el.kind]} ring-dashed hover:bg-white/10` : 'hover:ring-1 hover:ring-white/80'}`}
              style={{ left: `${el.x}%`, top: `${el.y}%`, width: `${el.w}%`, height: `${el.h}%`, outline: showBoxes && !sel ? '1px dashed rgba(255,255,255,0.6)' : undefined }}
            >
              {(sel || showBoxes) && (
                <span className={`pointer-events-none absolute -top-5 left-0 whitespace-nowrap rounded px-1 text-[10px] font-bold text-white ${sel ? 'bg-slate-900' : 'bg-slate-900/60'}`}>
                  {KIND_LABEL[el.kind]}
                  {el.kind === 'option' && el.correct ? ' ✓ benar' : ''}
                </span>
              )}
              {sel &&
                HANDLES.map((h) => (
                  <span
                    key={h}
                    onPointerDown={(e) => startDrag(e, el, h)}
                    className="absolute h-3.5 w-3.5 touch-none rounded-full border-2 border-white bg-amber-500 shadow"
                    style={{
                      left: h.includes('w') ? -7 : undefined,
                      right: h.includes('e') ? -7 : undefined,
                      top: h.includes('n') ? -7 : undefined,
                      bottom: h.includes('s') ? -7 : undefined,
                      cursor: h === 'nw' || h === 'se' ? 'nwse-resize' : 'nesw-resize',
                    }}
                  />
                ))}
            </div>
          );
        })}
      </div>
    </Stage>
  );
}
