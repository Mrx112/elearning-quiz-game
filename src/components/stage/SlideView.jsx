/**
 * SlideView — Menggambar satu slide: background + elemen berlapis (gambar, teks, pilihan jawaban, hotspot).
 *
 *  mode="play"  → interaktif (klik teks = dibacakan, klik opsi = menjawab)
 *  mode="edit"  → statis, dipakai kanvas Admin Panel
 *  mode="thumb" → statis, untuk thumbnail
 */
import { useState } from 'react';
import { Check, Hand, Volume2, X } from 'lucide-react';
import { useMediaUrl } from '../../hooks/useMediaUrl';
import { useAudio } from '../../audio/AudioProvider';

export const FONT_CLASS = {
  story: 'font-story',
  spartan: 'font-spartan',
  sans: 'font-osans',
  fun: 'font-fun',
  rounded: 'font-rounded',
  nunito: 'font-nunito',
};

export function textStyle(style = {}) {
  return {
    fontSize: `calc(var(--u) * ${style.size || 40})`,
    color: style.color || '#000',
    fontWeight: style.weight || 700,
    fontStyle: style.italic ? 'italic' : 'normal',
    textAlign: style.align || 'center',
    lineHeight: style.lineHeight || 1.2,
    letterSpacing: style.letterSpacing ? `${style.letterSpacing}em` : undefined,
    justifyContent: { left: 'flex-start', right: 'flex-end' }[style.align] || 'center',
  };
}

const posStyle = (el, index) => ({
  left: `${el.x}%`,
  top: `${el.y}%`,
  width: `${el.w}%`,
  height: `${el.h}%`,
  zIndex: 10 + index,
});

function SpeakerBadge({ onClick }) {
  return (
    <span
      className="speaker-badge"
      role="button"
      aria-label="Dengarkan"
      onClick={(e) => {
        if (onClick) {
          e.stopPropagation();
          onClick();
        }
      }}
    >
      <Volume2 strokeWidth={2.6} />
    </span>
  );
}

function SkinBox({ skin, className = '', style, children }) {
  const url = useMediaUrl(skin);
  return (
    <div className={`skin ${className}`} style={{ ...style, backgroundImage: url ? `url("${url}")` : undefined }}>
      {children}
    </div>
  );
}

function TextContent({ el, style, badge }) {
  const s = el.style || {};
  return (
    <SkinBox
      skin={s.skin}
      className={`flex h-full w-full items-center whitespace-pre-line ${FONT_CLASS[s.font] || ''} ${s.glow ? 'text-glow' : ''}`}
      style={{ ...textStyle(s), padding: s.skin ? `0 calc(var(--u) * 8)` : undefined, borderRadius: 'calc(var(--u) * 14)', ...style }}
    >
      {/* teks tanpa kotak: ikon speaker menempel di ujung teks */}
      {badge && !s.skin ? (
        <span className="relative inline-block max-w-full">
          {el.text}
          {badge}
        </span>
      ) : (
        <span className="block w-full">{el.text}</span>
      )}
    </SkinBox>
  );
}

function ImageContent({ src, sticker }) {
  const url = useMediaUrl(src);
  if (!url) return null;
  return <img src={url} alt="" className={`stage-img ${sticker ? 'sticker' : ''}`} draggable={false} />;
}

function ElementView({ el, index, mode, settings, quiz, onOption, onAction }) {
  const audio = useAudio();
  const [wiggleKey, setWiggleKey] = useState(0);
  const playing = mode === 'play';
  const speakTxt = el.speakText || el.text || '';
  const canSpeak = playing && !!(speakTxt || el.audio);
  const speaking = audio.speakingId === el.id;
  const showBadge = playing && settings?.showSpeakerIcons && (el.kind === 'text' || el.kind === 'option') && !!speakTxt;

  const speak = () => audio.speak({ id: el.id, text: speakTxt, lang: el.lang, audio: el.audio });

  const activate = async () => {
    if (!playing) return;
    if (el.kind === 'option') {
      onOption?.(el);
      return;
    }
    if (canSpeak) {
      setWiggleKey((k) => k + 1);
      const p = speak();
      if (el.action === 'next') {
        audio.sfx('click');
        await p;
        onAction?.('next', el);
      }
    } else if (el.action === 'next') {
      onAction?.('next', el);
    }
  };

  const entrance = playing && el.anim && el.anim !== 'none' ? `anim-${el.anim}` : '';
  const loop = playing && el.loop && el.loop !== 'none' ? `loop-${el.loop}` : '';
  const outerStyle = { ...posStyle(el, index), animationDelay: `${el.delay || 0}s` };

  // ── pilihan jawaban ──
  if (el.kind === 'option') {
    const status = quiz?.status?.[el.id];
    const reveal = quiz?.reveal && el.correct;
    const locked = !playing || quiz?.locked || status === 'wrong';
    const cls = status === 'correct' || reveal ? 'option-correct' : status === 'wrong' ? 'option-wrong' : quiz?.locked ? 'option-dim' : '';
    return (
      <div className={`stage-el ${entrance}`} style={outerStyle}>
        <button
          type="button"
          disabled={locked}
          onClick={activate}
          className={`option-btn relative h-full w-full ${cls} ${speaking ? 'is-speaking' : ''}`}
          aria-label={`Jawaban: ${el.text}`}
        >
          {el.src ? (
            <div className="flex h-full w-full flex-col items-center justify-center">
              <div className="min-h-0 w-full flex-1">
                <ImageContent src={el.src} />
              </div>
              {el.text ? (
                <div className="w-full" style={{ height: '30%' }}>
                  <TextContent el={el} />
                </div>
              ) : null}
            </div>
          ) : (
            <TextContent el={el} />
          )}
          {showBadge && <SpeakerBadge onClick={speak} />}
          {(status === 'correct' || reveal) && (
            <span className="option-mark bg-green-500">
              <Check strokeWidth={4} className="h-3/5 w-3/5" />
            </span>
          )}
          {status === 'wrong' && (
            <span className="option-mark bg-red-500">
              <X strokeWidth={4} className="h-3/5 w-3/5" />
            </span>
          )}
        </button>
      </div>
    );
  }

  // ── hotspot ──
  if (el.kind === 'hotspot') {
    return (
      <div className="stage-el" style={outerStyle}>
        <button
          type="button"
          aria-label={speakTxt || 'Area sentuh'}
          onClick={activate}
          disabled={!playing}
          className={`hotspot h-full w-full ${speaking ? 'is-speaking' : ''} ${el.highlight && playing ? 'highlight-ring' : ''}`}
        />
      </div>
    );
  }

  // ── teks & gambar ──
  const interactive = canSpeak || (playing && el.action === 'next');
  return (
    <div className={`stage-el ${entrance}`} style={outerStyle}>
      <div className={`el-inner ${loop}`}>
        <div
          key={wiggleKey}
          role={interactive ? 'button' : undefined}
          tabIndex={interactive ? 0 : undefined}
          aria-label={interactive ? speakTxt : undefined}
          onClick={interactive ? activate : undefined}
          onKeyDown={interactive ? (e) => (e.key === 'Enter' || e.key === ' ') && activate() : undefined}
          className={`relative h-full w-full ${interactive ? 'speakable' : ''} ${speaking ? 'is-speaking' : ''} ${wiggleKey && el.kind === 'image' ? 'wiggle' : ''} ${
            el.highlight && playing ? 'highlight-ring' : ''
          }`}
        >
          {el.kind === 'text' ? <TextContent el={el} badge={showBadge && !el.style?.skin ? <SpeakerBadge /> : null} /> : <ImageContent src={el.src} sticker={el.sticker} />}
          {showBadge && !!el.style?.skin && <SpeakerBadge />}
          {el.highlight && playing && (
            <Hand className="tap-hand pointer-events-none absolute text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.6)]" style={{ right: '-18%', bottom: '-55%', width: 'calc(var(--u) * 64)', height: 'calc(var(--u) * 64)' }} fill="#facc15" />
          )}
        </div>
      </div>
    </div>
  );
}

function Background({ src }) {
  const url = useMediaUrl(src);
  if (!url) return <div className="absolute inset-0 bg-gradient-to-b from-sky-200 to-lime-100" />;
  return <img src={url} alt="" className="absolute inset-0 h-full w-full object-cover" draggable={false} />;
}

export default function SlideView({ slide, settings, mode = 'play', quiz, onOption, onAction, children }) {
  return (
    <div className={`absolute inset-0 ${mode === 'play' ? 'slide-enter' : ''}`}>
      <Background src={slide.background} />
      {slide.elements.map((el, i) => (
        <ElementView key={el.id} el={el} index={i} mode={mode} settings={settings} quiz={quiz} onOption={onOption} onAction={onAction} />
      ))}
      {children}
    </div>
  );
}
