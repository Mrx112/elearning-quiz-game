/**
 * StartScreen — Halaman pembuka. Slide pertama tampil sebagai latar, ditambah tombol "Mulai Bermain".
 * Klik pertama juga "membuka kunci" audio browser (aturan autoplay).
 */
import { Play, Settings, Volume2 } from 'lucide-react';
import Stage from '../components/stage/Stage';
import SlideView from '../components/stage/SlideView';

export default function StartScreen({ project, onStart, onAdmin }) {
  const first = project.slides[0];
  const quizCount = project.slides.filter((s) => s.type === 'quiz').length;
  return (
    <div className="relative flex h-full flex-col bg-gradient-to-b from-sky-900 via-slate-900 to-slate-950">
      <div className="relative min-h-0 flex-1 p-2 sm:p-4">
        <Stage>
          {first && <SlideView slide={first} settings={project.settings} mode="thumb" />}
          <div className="absolute inset-0 z-[300] flex items-center justify-center bg-slate-900/35 backdrop-blur-[2px]">
            <div className="flex w-[62%] animate-slide-up flex-col items-center rounded-[calc(var(--u)*48)] bg-white/95 px-[5%] py-[3.5%] text-center shadow-2xl ring-[calc(var(--u)*8)] ring-amber-300">
              <p className="font-display font-semibold uppercase tracking-widest text-sky-600" style={{ fontSize: 'calc(var(--u)*30)' }}>
                Game E-Learning Interaktif
              </p>
              <h1 className="font-fun leading-none text-orange-500 drop-shadow-[0_3px_0_rgba(0,0,0,0.15)]" style={{ fontSize: 'calc(var(--u)*112)', marginTop: 'calc(var(--u)*10)' }}>
                {project.title}
              </h1>
              <p className="font-semibold text-slate-600" style={{ fontSize: 'calc(var(--u)*34)', marginTop: 'calc(var(--u)*14)' }}>
                {project.subtitle}
              </p>
              <p className="flex items-center gap-[calc(var(--u)*10)] font-semibold text-slate-500" style={{ fontSize: 'calc(var(--u)*28)', marginTop: 'calc(var(--u)*12)' }}>
                <Volume2 style={{ width: 'calc(var(--u)*34)', height: 'calc(var(--u)*34)' }} className="text-amber-500" />
                Sentuh teks atau gambar untuk mendengarkan suaranya · {project.slides.length} slide · {quizCount} kuis
              </p>
              <button
                type="button"
                onClick={onStart}
                className="flex items-center gap-[calc(var(--u)*16)] rounded-full bg-gradient-to-b from-amber-400 to-orange-500 font-display font-bold text-white shadow-[0_calc(var(--u)*10)_0_#c2410c] ring-[calc(var(--u)*6)] ring-white transition hover:translate-y-[calc(var(--u)*-3)] active:translate-y-[calc(var(--u)*6)] active:shadow-none"
                style={{ fontSize: 'calc(var(--u)*60)', padding: 'calc(var(--u)*22) calc(var(--u)*72)', marginTop: 'calc(var(--u)*36)' }}
              >
                <Play style={{ width: 'calc(var(--u)*60)', height: 'calc(var(--u)*60)' }} className="fill-white" /> Mulai Bermain
              </button>
            </div>
          </div>
        </Stage>
      </div>
      <button
        type="button"
        onClick={onAdmin}
        className="absolute right-3 top-3 z-[600] flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-sm font-bold text-slate-700 shadow-lg ring-1 ring-slate-200 transition hover:bg-white sm:right-5 sm:top-5"
      >
        <Settings className="h-4 w-4" /> Admin / Kelola Konten
      </button>
    </div>
  );
}
