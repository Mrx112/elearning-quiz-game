/**
 * SlideList — Daftar slide: pilih, urutkan (naik/turun atau seret), duplikat, hapus, tambah baru.
 */
import { useState } from 'react';
import { ChevronDown, ChevronUp, Copy, GripVertical, Plus, Trash2 } from 'lucide-react';
import { useMediaUrl } from '../hooks/useMediaUrl';
import { SLIDE_TEMPLATES } from './templates';

const TYPE_BADGE = {
  story: ['Cerita', 'bg-sky-100 text-sky-700'],
  quiz: ['Kuis', 'bg-amber-100 text-amber-800'],
  ending: ['Penutup', 'bg-violet-100 text-violet-700'],
};

function SlideThumb({ slide }) {
  const url = useMediaUrl(slide.background);
  return (
    <div className="relative aspect-video w-20 shrink-0 overflow-hidden rounded-md bg-slate-200 ring-1 ring-slate-300">
      {url && <img src={url} alt="" className="h-full w-full object-cover" />}
    </div>
  );
}

export default function SlideList({ slides, currentId, onSelect, onMove, onReorder, onDuplicate, onDelete, onAdd }) {
  const [adding, setAdding] = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);
  const [dragId, setDragId] = useState(null);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b px-3 py-2">
        <h2 className="text-sm font-extrabold text-slate-700">Slide ({slides.length})</h2>
        <button type="button" onClick={() => setAdding((a) => !a)} className="flex items-center gap-1 rounded-lg bg-amber-400 px-2.5 py-1 text-xs font-bold text-amber-950 hover:bg-amber-300">
          <Plus className="h-4 w-4" /> Slide baru
        </button>
      </div>
      {adding && (
        <div className="space-y-1 border-b bg-amber-50 p-2">
          {SLIDE_TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                onAdd(t.id);
                setAdding(false);
              }}
              className="block w-full rounded-lg bg-white px-3 py-1.5 text-left ring-1 ring-amber-200 hover:ring-amber-400"
            >
              <span className="block text-sm font-bold text-slate-700">{t.label}</span>
              <span className="block text-[11px] text-slate-500">{t.desc}</span>
            </button>
          ))}
          <p className="px-1 text-[11px] text-amber-700">Slide baru disisipkan setelah slide yang sedang dipilih.</p>
        </div>
      )}
      <ol className="admin-scroll min-h-0 flex-1 space-y-1 overflow-auto p-2">
        {slides.map((s, i) => {
          const [label, cls] = TYPE_BADGE[s.type] || TYPE_BADGE.story;
          const active = s.id === currentId;
          return (
            <li
              key={s.id}
              draggable
              onDragStart={() => setDragId(s.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragId && dragId !== s.id) onReorder(dragId, i);
                setDragId(null);
              }}
              className={`group rounded-xl p-1.5 ring-1 transition ${active ? 'bg-amber-50 ring-2 ring-amber-400' : 'bg-white ring-slate-200 hover:ring-slate-300'} ${dragId === s.id ? 'opacity-40' : ''}`}
            >
              <button type="button" onClick={() => onSelect(s.id)} className="flex w-full items-center gap-2 text-left">
                <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-slate-300" />
                <span className="w-5 shrink-0 text-center text-xs font-bold text-slate-400">{i + 1}</span>
                <SlideThumb slide={s} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-bold text-slate-700">{s.name || 'Tanpa nama'}</span>
                  <span className={`mt-0.5 inline-block rounded px-1.5 text-[10px] font-bold ${cls}`}>{label}</span>
                </span>
              </button>
              {active && (
                <div className="mt-1.5 flex flex-wrap items-center gap-1 pl-7">
                  <IconBtn label="Naikkan" onClick={() => onMove(s.id, -1)} disabled={i === 0}>
                    <ChevronUp className="h-4 w-4" />
                  </IconBtn>
                  <IconBtn label="Turunkan" onClick={() => onMove(s.id, 1)} disabled={i === slides.length - 1}>
                    <ChevronDown className="h-4 w-4" />
                  </IconBtn>
                  <IconBtn label="Duplikat" onClick={() => onDuplicate(s.id)}>
                    <Copy className="h-4 w-4" />
                  </IconBtn>
                  {confirmDel === s.id ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-red-600">
                      Hapus?
                      <button type="button" className="rounded bg-red-600 px-1.5 py-0.5 text-white" onClick={() => onDelete(s.id)}>
                        Ya
                      </button>
                      <button type="button" className="rounded bg-slate-200 px-1.5 py-0.5 text-slate-700" onClick={() => setConfirmDel(null)}>
                        Batal
                      </button>
                    </span>
                  ) : (
                    <IconBtn label="Hapus slide" onClick={() => setConfirmDel(s.id)} disabled={slides.length <= 1} danger>
                      <Trash2 className="h-4 w-4" />
                    </IconBtn>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function IconBtn({ children, label, onClick, disabled, danger }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-md p-1 ring-1 transition disabled:opacity-30 ${danger ? 'text-red-600 ring-red-200 hover:bg-red-50' : 'text-slate-600 ring-slate-200 hover:bg-slate-100'}`}
    >
      {children}
    </button>
  );
}
