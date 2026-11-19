/**
 * LibraryPicker — Pilih gambar dari pustaka ICT ELEMENT (cutout transparan) atau dari file yang pernah diunggah.
 */
import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { LIBRARY } from './templates';
import { deleteMedia, getMediaRecord, listMedia } from '../lib/mediaStore';
import { Thumb, UploadButton, IMAGE_ACCEPT } from './fields';

export default function LibraryPicker({ onPick, onClose, title = 'Pustaka Aset' }) {
  const [tab, setTab] = useState(LIBRARY[0]?.key || 'upload');
  const [uploads, setUploads] = useState([]);

  const refreshUploads = async () => {
    try {
      const refs = await listMedia();
      const recs = await Promise.all(refs.map(async (r) => ({ ref: r, rec: await getMediaRecord(r) })));
      setUploads(recs.filter((x) => x.rec?.type?.startsWith('image/')));
    } catch {
      setUploads([]);
    }
  };
  useEffect(() => {
    refreshUploads();
  }, []);

  const group = useMemo(() => LIBRARY.find((g) => g.key === tab), [tab]);

  return (
    <div className="fixed inset-0 z-[1100] grid place-items-center bg-slate-950/60 p-3" role="dialog" aria-modal="true" aria-label={title} onClick={onClose}>
      <div className="flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center gap-2 border-b px-4 py-3">
          <h2 className="flex-1 font-display text-lg font-bold text-slate-800">{title}</h2>
          <button type="button" onClick={onClose} className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100" aria-label="Tutup">
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="flex min-h-0 flex-1 flex-col sm:flex-row">
          <nav className="admin-scroll flex shrink-0 gap-1 overflow-auto border-b bg-slate-50 p-2 sm:w-44 sm:flex-col sm:border-b-0 sm:border-r">
            <button type="button" onClick={() => setTab('upload')} className={`shrink-0 rounded-lg px-3 py-1.5 text-left text-sm font-bold ${tab === 'upload' ? 'bg-amber-400 text-amber-950' : 'text-slate-600 hover:bg-slate-200'}`}>
              📁 Unggahan saya
            </button>
            {LIBRARY.map((g) => (
              <button key={g.key} type="button" onClick={() => setTab(g.key)} className={`shrink-0 rounded-lg px-3 py-1.5 text-left text-sm font-semibold capitalize ${tab === g.key ? 'bg-amber-400 text-amber-950' : 'text-slate-600 hover:bg-slate-200'}`}>
                {g.folder}
              </button>
            ))}
          </nav>
          <div className="admin-scroll min-h-0 flex-1 overflow-auto p-3">
            {tab === 'upload' ? (
              <>
                <div className="mb-3 flex items-center gap-2">
                  <UploadButton
                    variant="primary"
                    accept={IMAGE_ACCEPT}
                    onUploaded={async (ref) => {
                      await refreshUploads();
                      onPick({ src: ref, name: 'unggahan' });
                    }}
                  >
                    Unggah gambar baru (.png / .jpg / .webp)
                  </UploadButton>
                </div>
                {uploads.length === 0 && <p className="text-sm text-slate-500">Belum ada gambar yang diunggah.</p>}
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {uploads.map(({ ref, rec }) => (
                    <div key={ref} className="group relative">
                      <button type="button" onClick={() => onPick({ src: ref, name: rec.name })} className="w-full rounded-xl p-1.5 text-left ring-1 ring-slate-200 hover:ring-2 hover:ring-amber-400">
                        <Thumb src={ref} className="h-24 w-full" />
                        <span className="mt-1 block truncate text-[11px] text-slate-500">{rec.name}</span>
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          await deleteMedia(ref);
                          refreshUploads();
                        }}
                        className="absolute right-2 top-2 hidden rounded-full bg-white/90 px-2 text-xs font-bold text-red-600 shadow group-hover:block"
                      >
                        Hapus
                      </button>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {group?.items.map((it, i) => (
                  <button key={`${it.src}-${i}`} type="button" onClick={() => onPick(it)} className="rounded-xl p-1.5 text-left ring-1 ring-slate-200 hover:ring-2 hover:ring-amber-400">
                    <Thumb src={it.src} className="h-24 w-full" />
                    <span className="mt-1 block truncate text-[11px] text-slate-500">{it.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
