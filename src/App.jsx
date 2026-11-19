/**
 * App.jsx — Pengatur layar.
 *
 *   start ──Mulai──► play ──(slide terakhir: Main Lagi)──► play
 *     │                │
 *     └── Admin ◄──────┘   (PIN default 1234, bisa diubah / dimatikan di Admin → Pengaturan)
 */
import { lazy, Suspense, useEffect, useState } from 'react';
import { AudioProvider, useAudio } from './audio/AudioProvider';
import { ProjectProvider, useProject } from './lib/projectStore';
import { storage } from './lib/storage';
import StartScreen from './screens/StartScreen';
import PlayScreen from './screens/PlayScreen';
import PinDialog from './admin/PinDialog';

const AdminPanel = lazy(() => import('./admin/AdminPanel'));

const PREFS_KEY = 'elearning-quiz-prefs';

function Screens({ prefs, setPrefs }) {
  const { project } = useProject();
  const { unlock, stop } = useAudio();
  const [screen, setScreen] = useState(() => (window.location.hash === '#admin' ? 'pin' : 'start'));
  const [round, setRound] = useState(0);
  const [returnTo, setReturnTo] = useState('start');

  useEffect(() => {
    document.title = project.title;
  }, [project.title]);

  const openAdmin = () => {
    stop();
    setReturnTo(screen === 'play' ? 'play' : 'start');
    setScreen(project.settings.requirePin ? 'pin' : 'admin');
  };

  return (
    <>
      {screen === 'start' && (
        <StartScreen
          project={project}
          onAdmin={openAdmin}
          onStart={() => {
            unlock();
            setRound((r) => r + 1);
            setScreen('play');
          }}
        />
      )}
      {screen === 'play' && (
        <PlayScreen
          key={round}
          project={project}
          prefs={prefs}
          onPrefsChange={(p) => setPrefs((x) => ({ ...x, ...p }))}
          onHome={() => {
            stop();
            setScreen('start');
          }}
          onAdmin={openAdmin}
        />
      )}
      {screen === 'pin' && (
        <>
          <StartScreen project={project} onAdmin={() => {}} onStart={() => {}} />
          <PinDialog pin={project.settings.pin} onSuccess={() => setScreen('admin')} onCancel={() => setScreen(returnTo === 'play' ? 'play' : 'start')} />
        </>
      )}
      {screen === 'admin' && (
        <Suspense fallback={<div className="grid h-full place-items-center text-white">Memuat Admin Panel…</div>}>
          <AdminPanel
            onExit={() => {
              if (window.location.hash === '#admin') window.history.replaceState(null, '', window.location.pathname);
              setRound((r) => r + 1);
              setScreen('start');
            }}
            onPreview={() => {
              unlock();
              setRound((r) => r + 1);
              setScreen('play');
            }}
          />
        </Suspense>
      )}
    </>
  );
}

function WithAudio({ children, prefs }) {
  const { project } = useProject();
  const settings = { ...project.settings, voiceLang: prefs.lang || project.settings.voiceLang };
  return (
    <AudioProvider settings={settings} sfxEnabled={prefs.sfx} voiceEnabled={prefs.voice}>
      {children}
    </AudioProvider>
  );
}

export default function App() {
  const [prefs, setPrefs] = useState(() => ({ voice: true, sfx: true, lang: '', ...storage.get(PREFS_KEY, {}) }));
  useEffect(() => storage.set(PREFS_KEY, prefs), [prefs]);
  return (
    <ProjectProvider>
      <WithAudio prefs={prefs}>
        <Screens prefs={{ ...prefs, lang: prefs.lang || 'auto' }} setPrefs={setPrefs} />
      </WithAudio>
    </ProjectProvider>
  );
}
