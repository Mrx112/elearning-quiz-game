/**
 * projectStore.jsx — Sumber data tunggal game (slide, teks, kunci jawaban, pengaturan).
 *
 *  - Disimpan otomatis ke localStorage setiap ada perubahan dari Admin Panel.
 *  - File unggahan disimpan terpisah di IndexedDB (lihat mediaStore.js).
 *  - exportBackup()  → file .json berisi data + semua file unggahan (base64).
 *  - importBackup()  → memulihkan dari file .json tersebut.
 *  - resetProject()  → kembali ke isi bawaan (aset ICT ELEMENT).
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createDefaultProject, PROJECT_VERSION } from '../data/defaultSlides';
import { clearMedia, exportMedia, importMedia, isMediaRef } from './mediaStore';

const STORAGE_KEY = 'elearning-quiz-project';
const Ctx = createContext(null);

function loadProject() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      if (p?.version === PROJECT_VERSION && Array.isArray(p.slides)) {
        const def = createDefaultProject();
        return { ...def, ...p, settings: { ...def.settings, ...p.settings } };
      }
    }
  } catch {
    /* data rusak / storage diblokir → pakai default */
  }
  return createDefaultProject();
}

/** Kumpulkan semua referensi "media:" di dalam proyek. */
export function collectMediaRefs(obj, out = new Set()) {
  if (typeof obj === 'string') {
    if (isMediaRef(obj)) out.add(obj);
  } else if (Array.isArray(obj)) {
    obj.forEach((v) => collectMediaRefs(v, out));
  } else if (obj && typeof obj === 'object') {
    Object.values(obj).forEach((v) => collectMediaRefs(v, out));
  }
  return out;
}

export const uid = (prefix = 'el') => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export function ProjectProvider({ children }) {
  const [project, setProject] = useState(loadProject);
  const [saveState, setSaveState] = useState('saved'); // 'saved' | 'saving' | 'error'
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return undefined;
    }
    setSaveState('saving');
    const t = setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
        setSaveState('saved');
      } catch {
        setSaveState('error');
      }
    }, 350);
    return () => clearTimeout(t);
  }, [project]);

  const updateSlide = useCallback((slideId, patch) => {
    setProject((p) => ({
      ...p,
      slides: p.slides.map((s) => (s.id === slideId ? { ...s, ...(typeof patch === 'function' ? patch(s) : patch) } : s)),
    }));
  }, []);

  const updateElement = useCallback((slideId, elId, patch) => {
    setProject((p) => ({
      ...p,
      slides: p.slides.map((s) =>
        s.id !== slideId
          ? s
          : {
              ...s,
              elements: s.elements.map((e) => {
                if (e.id !== elId) return e;
                const next = typeof patch === 'function' ? patch(e) : patch;
                return { ...e, ...next, style: next.style ? { ...e.style, ...next.style } : e.style };
              }),
            },
      ),
    }));
  }, []);

  const updateSettings = useCallback((patch) => {
    setProject((p) => ({ ...p, settings: { ...p.settings, ...patch } }));
  }, []);

  const resetProject = useCallback(async () => {
    try {
      await clearMedia();
    } catch {
      /* abaikan */
    }
    const def = createDefaultProject();
    setProject(def);
    return def;
  }, []);

  const exportBackup = useCallback(async () => {
    const refs = [...collectMediaRefs(project)];
    const media = await exportMedia(refs);
    const payload = { app: 'elearning-quiz-game', exportedAt: new Date().toISOString(), project, media };
    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
    const a = document.createElement('a');
    const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
    a.href = URL.createObjectURL(blob);
    a.download = `backup-kuis-${stamp}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    return { slides: project.slides.length, files: Object.keys(media).length };
  }, [project]);

  const importBackup = useCallback(async (file) => {
    const data = JSON.parse(await file.text());
    const p = data.project || data;
    if (!Array.isArray(p?.slides)) throw new Error('File bukan backup kuis yang valid.');
    await importMedia(data.media);
    const def = createDefaultProject();
    const next = { ...def, ...p, version: PROJECT_VERSION, settings: { ...def.settings, ...p.settings } };
    setProject(next);
    return { slides: next.slides.length, files: Object.keys(data.media || {}).length };
  }, []);

  const value = useMemo(
    () => ({ project, setProject, updateSlide, updateElement, updateSettings, resetProject, exportBackup, importBackup, saveState }),
    [project, updateSlide, updateElement, updateSettings, resetProject, exportBackup, importBackup, saveState],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useProject() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useProject() harus di dalam <ProjectProvider>');
  return c;
}
