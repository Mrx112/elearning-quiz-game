/**
 * SpeakableText — Teks yang dibacakan saat disentuh/diklik.
 *
 *   <SpeakableText
 *     id="q1-question"           ← id unik (untuk highlight saat dibacakan)
 *     text="Teks yang tampil"
 *     speakText="Teks bacaan"     ← opsional, jika pelafalan perlu beda
 *     lang="id-ID"                ← bahasa suara
 *     audioSrc="/assets/audio/…"  ← opsional, file rekaman (fallback ke TTS)
 *     variant="light" | "dark"    ← dark = di atas latar berwarna
 *   />
 *
 * Saat sedang dibacakan: latar menyala kuning + efek pulse + ikon gelombang suara.
 */
import { AudioLines, Volume2, VolumeX } from 'lucide-react';
import { useAudio } from '../../audio/AudioProvider';

const STYLES = {
  light: {
    idle: 'hover:bg-indigo-50',
    active: 'bg-amber-100 ring-4 ring-amber-300 animate-speak-pulse',
    badge: 'bg-indigo-100 text-indigo-600 group-hover/speak:bg-indigo-200',
    badgeActive: 'bg-amber-400 text-amber-950',
  },
  dark: {
    idle: 'hover:bg-white/10',
    active: 'bg-white/20 ring-4 ring-amber-300 animate-speak-pulse',
    badge: 'bg-white/20 text-white group-hover/speak:bg-white/30',
    badgeActive: 'bg-amber-300 text-amber-950',
  },
};

export default function SpeakableText({
  id,
  text,
  speakText,
  lang,
  audioSrc,
  variant = 'light',
  block = false,
  className = '',
  textClassName = '',
  children,
}) {
  const { speak, speakingId, voiceEnabled } = useAudio();
  const active = speakingId === id;
  const s = STYLES[variant];

  const handleClick = (event) => {
    event.stopPropagation();
    speak({ id, text: speakText || text, lang, audioSrc });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={active}
      title={voiceEnabled ? 'Sentuh untuk mendengarkan' : 'Suara pembaca nonaktif'}
      className={`group/speak items-start gap-3 rounded-2xl px-3 py-2 text-left transition-all duration-200 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-amber-300 ${
        block ? 'flex w-full' : 'inline-flex'
      } ${active ? s.active : s.idle} ${className}`}
    >
      <span className={`min-w-0 flex-1 ${textClassName}`}>{children ?? text}</span>
      <SpeakerBadge active={active} disabled={!voiceEnabled} className={active ? s.badgeActive : s.badge} />
      <span className="sr-only">(dengarkan)</span>
    </button>
  );
}

export function SpeakerBadge({ active, disabled, className = '' }) {
  const Icon = active ? AudioLines : disabled ? VolumeX : Volume2;
  return (
    <span
      aria-hidden
      className={`mt-0.5 grid size-9 shrink-0 place-items-center rounded-full transition-colors ${className}`}
    >
      <Icon className={`size-5 ${active ? 'animate-pulse' : ''}`} />
    </span>
  );
}
