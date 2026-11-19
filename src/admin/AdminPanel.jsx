/**
 * AdminPanel — Mode Pengelola (No-Code Customizer).
 *   Tab "Slide & Soal"   : daftar slide + kanvas visual + panel properti
 *   Tab "Pengaturan"     : judul, PIN, suara, aturan kuis
 *   Tab "Backup & Reset" : export/import .json, reset ke aset ICT ELEMENT
 *   Tab "Panduan"        : cara pakai singkat
 */
import { useCallback, useState } from 'react';
import { CheckCircle2, CircleDashed, Eye, Image as ImageIcon, LayoutGrid, LogOut, MousePointerClick, Play, Square, Type, AlertTriangle, ListChecks } from 'lucide-react';
import { useProject } from '../lib/projectStore';
import SlideList from './SlideList';
import EditorCanvas from './EditorCanvas';
import { ElementInspector, SlideInspector } from './Inspector';
import LibraryPicker from './LibraryPicker';
import SettingsTab from './SettingsTab';
import BackupTab from './BackupTab';
import GuideTab from './GuideTab';
import { cloneSlide, createSlide, newHotspot, newImage, newOption, newText } from './templates';
import { uid } from '../lib/projectStore';

const TABS = [
  ['slides', 'Slide & Soal'],
  ['settings', 'Pengaturan'],
  ['backup', 'Backup & Reset'],
  ['guide', 'Panduan'],
];

export default function AdminPanel({ onExit, onPreview }) {
  const { project, setProject, updateSlide, updateElement, saveState } = useProject();
  const [tab, setTab] = useState('slides');
  const [slideId, setSlideId] = useState(project.slides[0]?.id);
  const [selectedId, setSelectedId] = useState(null);
  const [picker, setPicker] = useState(null); // callback(item) | null
  const [showRef, setShowRef] = useState(false);
  const [refOpacity, setRefOpacity] = useState(0.5);
  const [showBoxes, setShowBoxes] = useState(true);
  const [mobilePane, setMobilePane] = useState('canvas');

  const slide = project.slides.find((s) => s.id === slideId) || project.slides[0];
  const el = slide?.elements.find((e) => e.id === selectedId);

  const setSlides = (fn) => setProject((p) => ({ ...p, slides: fn(p.slides) }));

  const selectSlide = (id) => {
    setSlideId(id);
    setSelectedId(null);
    setMobilePane('canvas');
  };

  const addSlide = (template) => {
    const idx = project.slides.findIndex((s) => s.id === slide?.id);
    const s = createSlide(template, slide?.background);
    setSlides((arr) => [...arr.slice(0, idx + 1), s, ...arr.slice(idx + 1)]);
    selectSlide(s.id);
  };
  const moveSlide = (id, dir) =>
    setSlides((arr) => {
      const i = arr.findIndex((s) => s.id === id);
      const j = i + dir;
      if (j < 0 || j >= arr.length) return arr;
      const a = [...arr];
      [a[i], a[j]] = [a[j], a[i]];
      return a;
    });
  const reorderSlide = (id, to) =>
    setSlides((arr) => {
      const a = [...arr];
      const from = a.findIndex((s) => s.id === id);
      const [s] = a.splice(from, 1);
      a.splice(to, 0, s);
      return a;
    });
  const duplicateSlide = (id) => {
    const idx = project.slides.findIndex((s) => s.id === id);
    const c = cloneSlide(project.slides[idx]);
    setSlides((arr) => [...arr.slice(0, idx + 1), c, ...arr.slice(idx + 1)]);
    selectSlide(c.id);
  };
  const deleteSlide = (id) => {
    const idx = project.slides.findIndex((s) => s.id === id);
    const rest = project.slides.filter((s) => s.id !== id);
    setSlides(() => rest);
    selectSlide(rest[Math.max(0, idx - 1)]?.id);
  };

  // ── elemen ──
  const addElement = (e) => {
    updateSlide(slide.id, (s) => ({ elements: [...s.elements, e] }));
    setSelectedId(e.id);
    setMobilePane('canvas');
  };
  const changeEl = useCallback((id, patch) => updateElement(slide.id, id, patch), [slide?.id, updateElement]);
  const deleteEl = useCallback(
    (id) => {
      updateSlide(slide.id, (s) => ({ elements: s.elements.filter((e) => e.id !== id) }));
      setSelectedId(null);
    },
    [slide?.id, updateSlide],
  );
  const duplicateEl = () => {
    const c = { ...JSON.parse(JSON.stringify(el)), id: uid(el.kind), x: el.x + 2, y: el.y + 2 };
    addElement(c);
  };
  const layerEl = (op) =>
    updateSlide(slide.id, (s) => {
      const a = [...s.elements];
      const i = a.findIndex((e) => e.id === el.id);
      const [item] = a.splice(i, 1);
      const to = { front: a.length, back: 0, up: Math.min(a.length, i + 1), down: Math.max(0, i - 1) }[op];
      a.splice(to, 0, item);
      return { elements: a };
    });

  const quizWarnings = project.slides.filter((s) => s.type === 'quiz' && !s.elements.some((e) => e.kind === 'option' && e.correct));

  return (
    <div className="flex h-full flex-col bg-slate-100 text-slate-800">
      {/* ── Bar atas ── */}
      <header className="flex shrink-0 flex-wrap items-center gap-2 bg-slate-900 px-3 py-2 text-white">
        <div className="mr-2 flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-400 font-display font-bold text-amber-950">A</span>
          <div className="leading-tight">
            <p className="font-display text-sm font-bold">Mode Pengelola</p>
            <p className="max-w-[160px] truncate text-[11px] text-white/60">{project.title}</p>
          </div>
        </div>
        <nav className="flex flex-1 flex-wrap gap-1">
          {TABS.map(([k, l]) => (
            <button key={k} type="button" onClick={() => setTab(k)} className={`rounded-lg px-3 py-1.5 text-sm font-bold transition ${tab === k ? 'bg-white text-slate-900' : 'text-white/80 hover:bg-white/10'}`}>
              {l}
            </button>
          ))}
        </nav>
        <span className={`flex items-center gap-1 text-xs font-semibold ${saveState === 'error' ? 'text-red-300' : 'text-white/70'}`} aria-live="polite">
          {saveState === 'saving' ? <CircleDashed className="h-4 w-4 animate-spin" /> : saveState === 'error' ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4 text-green-400" />}
          {saveState === 'saving' ? 'Menyimpan…' : saveState === 'error' ? 'Gagal simpan (penyimpanan penuh?)' : 'Tersimpan otomatis'}
        </span>
        <button type="button" onClick={onPreview} className="flex items-center gap-1.5 rounded-lg bg-amber-400 px-3 py-1.5 text-sm font-bold text-amber-950 hover:bg-amber-300">
          <Play className="h-4 w-4 fill-amber-950" /> Main / Pratinjau
        </button>
        <button type="button" onClick={onExit} className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-sm font-bold hover:bg-white/20">
          <LogOut className="h-4 w-4" /> Keluar
        </button>
      </header>

      {tab === 'settings' && <SettingsTab />}
      {tab === 'backup' && <BackupTab />}
      {tab === 'guide' && <GuideTab />}

      {tab === 'slides' && slide && (
        <>
          {/* pemilih panel untuk layar kecil */}
          <div className="flex shrink-0 gap-1 border-b bg-white p-1.5 lg:hidden">
            {[
              ['list', 'Daftar slide'],
              ['canvas', 'Kanvas'],
              ['props', 'Properti'],
            ].map(([k, l]) => (
              <button key={k} type="button" onClick={() => setMobilePane(k)} className={`flex-1 rounded-lg py-1.5 text-sm font-bold ${mobilePane === k ? 'bg-amber-400 text-amber-950' : 'text-slate-600'}`}>
                {l}
              </button>
            ))}
          </div>
          <div className="flex min-h-0 flex-1">
            <aside className={`${mobilePane === 'list' ? 'flex' : 'hidden'} w-full shrink-0 flex-col border-r bg-white lg:flex lg:w-72`}>
              <SlideList
                slides={project.slides}
                currentId={slide.id}
                onSelect={selectSlide}
                onMove={moveSlide}
                onReorder={reorderSlide}
                onDuplicate={duplicateSlide}
                onDelete={deleteSlide}
                onAdd={addSlide}
              />
            </aside>

            <section className={`${mobilePane === 'canvas' ? 'flex' : 'hidden'} min-w-0 flex-1 flex-col lg:flex`}>
              {/* toolbar */}
              <div className="flex shrink-0 flex-wrap items-center gap-1.5 border-b bg-white px-3 py-2">
                <span className="mr-1 text-xs font-bold uppercase text-slate-400">Tambah:</span>
                <ToolBtn icon={Type} label="Teks" onClick={() => addElement(newText())} />
                <ToolBtn icon={Square} label="Pilihan jawaban" onClick={() => addElement(newOption())} />
                <ToolBtn icon={ImageIcon} label="Gambar" onClick={() => setPicker(() => (it) => addElement(newImage(it.src, it.full ? null : it.box)))} />
                <ToolBtn icon={MousePointerClick} label="Area sentuh" onClick={() => addElement(newHotspot())} />
                <span className="mx-1 h-5 w-px bg-slate-200" />
                <label className="flex items-center gap-1 text-xs font-semibold text-slate-600">
                  <input type="checkbox" checked={showBoxes} onChange={(e) => setShowBoxes(e.target.checked)} className="accent-amber-500" />
                  <LayoutGrid className="h-3.5 w-3.5" /> Garis elemen
                </label>
                <label className="flex items-center gap-1 text-xs font-semibold text-slate-600">
                  <input type="checkbox" checked={showRef} onChange={(e) => setShowRef(e.target.checked)} className="accent-amber-500" disabled={!slide.reference} />
                  <Eye className="h-3.5 w-3.5" /> Desain Canva
                </label>
                {showRef && <input type="range" min={0.1} max={1} step={0.05} value={refOpacity} onChange={(e) => setRefOpacity(Number(e.target.value))} className="w-20 accent-amber-500" aria-label="Transparansi desain acuan" />}
              </div>
              <div className="relative min-h-[240px] flex-1 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] bg-[length:16px_16px] p-3 sm:p-5">
                <EditorCanvas
                  slide={slide}
                  settings={project.settings}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  onChangeEl={changeEl}
                  onDeleteEl={deleteEl}
                  showRef={showRef}
                  refOpacity={refOpacity}
                  showBoxes={showBoxes}
                />
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 border-t bg-white px-3 py-1.5 text-[11px] text-slate-500">
                <span className="font-bold text-slate-700">
                  Slide {project.slides.findIndex((s) => s.id === slide.id) + 1}: {slide.name}
                </span>
                <span>{slide.elements.length} elemen</span>
                {quizWarnings.length > 0 && (
                  <span className="flex items-center gap-1 font-bold text-red-600">
                    <ListChecks className="h-3.5 w-3.5" /> {quizWarnings.length} kuis belum punya jawaban benar
                  </span>
                )}
                <span className="ml-auto hidden sm:inline">Klik area kosong = pengaturan slide · Delete = hapus elemen · Panah = geser</span>
              </div>
            </section>

            <aside key={el?.id || `slide-${slide.id}`} className={`${mobilePane === 'props' ? 'block' : 'hidden'} admin-scroll w-full shrink-0 overflow-auto border-l bg-white lg:block lg:w-[340px]`}>
              {el ? (
                <ElementInspector
                  key={el.id}
                  el={el}
                  slide={slide}
                  onChange={(patch) => changeEl(el.id, patch)}
                  onDelete={() => deleteEl(el.id)}
                  onDuplicate={duplicateEl}
                  onLayer={layerEl}
                  onPickLibrary={(cb) => setPicker(() => cb)}
                />
              ) : (
                <SlideInspector slide={slide} onChange={(patch) => updateSlide(slide.id, patch)} onPickLibrary={(cb) => setPicker(() => cb)} />
              )}
            </aside>
          </div>
        </>
      )}

      {picker && (
        <LibraryPicker
          onClose={() => setPicker(null)}
          onPick={(it) => {
            picker(it);
            setPicker(null);
          }}
        />
      )}
    </div>
  );
}

function ToolBtn({ icon: Icon, label, onClick }) {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-700 ring-1 ring-slate-200 transition hover:bg-amber-100 hover:ring-amber-300">
      <Icon className="h-4 w-4" /> {label}
    </button>
  );
}
