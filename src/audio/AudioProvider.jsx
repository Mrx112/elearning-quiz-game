/**
 * AudioProvider.jsx — Pusat semua suara di game.
 *
 * useAudio() menyediakan:
 *   speak({ id, text, lang, audio })  → bacakan teks (file audio custom bila ada, jika tidak → Web Speech API)
 *   speakAsync(...)                   → sama, tetapi mengembalikan Promise yang selesai saat suara berakhir
 *   stop()                            → hentikan suara
 *   speakingId                        → id elemen yang sedang dibacakan (untuk highlight)
 *   sfx(name, customAudio?)           → efek suara: click | correct | wrong | win | whoosh
 *   unlock()                          → panggil sekali dari klik pertama (aturan autoplay browser)
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { resolveMediaUrl } from '../lib/mediaStore';
import { playSfx, unlockAudio } from './sfx';
import { detectLang, pickVoice } from './voices';

const AudioCtx = createContext(null);

const speechSupported =
  typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;

/** Bersihkan teks agar enak dibacakan (emotikon, simbol berulang). */
export function speakableText(text = '') {
  return text
    .replace(/[><]\.?[><]/g, ' ')
    .replace(/[!?.]{2,}/g, (m) => m[0])
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function AudioProvider({ settings, sfxEnabled = true, voiceEnabled = true, children }) {
  const [speakingId, setSpeakingId] = useState(null);
  const speakingRef = useRef(null);
  const tokenRef = useRef(0);
  const audioRef = useRef(null);
  const utterRef = useRef(null);
  const voicesRef = useRef([]);
  const resolverRef = useRef(null);

  useEffect(() => {
    if (!speechSupported) return undefined;
    const synth = window.speechSynthesis;
    const load = () => {
      voicesRef.current = synth.getVoices();
    };
    load();
    synth.addEventListener?.('voiceschanged', load);
    return () => synth.removeEventListener?.('voiceschanged', load);
  }, []);

  const setSpeaking = useCallback((id) => {
    speakingRef.current = id;
    setSpeakingId(id);
  }, []);

  const settle = useCallback(() => {
    const r = resolverRef.current;
    resolverRef.current = null;
    r?.();
  }, []);

  const stop = useCallback(() => {
    tokenRef.current += 1;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (speechSupported) window.speechSynthesis.cancel();
    utterRef.current = null;
    setSpeaking(null);
    settle();
  }, [setSpeaking, settle]);

  const resolveLang = useCallback(
    (text, lang) => {
      const forced = settings?.voiceLang;
      if (forced && forced !== 'auto') return forced;
      if (lang && lang !== 'auto') return lang;
      return detectLang(text, settings?.defaultLang || 'en-US');
    },
    [settings?.voiceLang, settings?.defaultLang],
  );

  const tts = useCallback(
    (token, text, lang) => {
      const done = () => {
        if (token !== tokenRef.current) return;
        setSpeaking(null);
        settle();
      };
      const clean = speakableText(text);
      if (!speechSupported || !clean) return done();
      const synth = window.speechSynthesis;
      const u = new SpeechSynthesisUtterance(clean);
      const voice = pickVoice(voicesRef.current.length ? voicesRef.current : synth.getVoices(), lang);
      u.lang = lang;
      if (voice) u.voice = voice;
      u.rate = settings?.speechRate ?? 0.9;
      u.pitch = 1.05;
      u.onend = done;
      u.onerror = done;
      utterRef.current = u;
      synth.cancel();
      synth.resume();
      synth.speak(u);
      return undefined;
    },
    [settings?.speechRate, setSpeaking, settle],
  );

  const speakAsync = useCallback(
    ({ id = 'speech', text = '', lang = 'auto', audio = '' }) => {
      if (!voiceEnabled) return Promise.resolve();
      stop();
      const token = tokenRef.current;
      setSpeaking(id);
      const finalLang = resolveLang(text, lang);
      const p = new Promise((resolve) => {
        resolverRef.current = resolve;
      });

      if (!audio) {
        tts(token, text, finalLang);
        return p;
      }
      let fell = false;
      const fallback = () => {
        if (fell || token !== tokenRef.current) return;
        fell = true;
        audioRef.current = null;
        tts(token, text, finalLang);
      };
      resolveMediaUrl(audio)
        .then((url) => {
          if (token !== tokenRef.current) return;
          if (!url) return fallback();
          const el = new Audio(url);
          audioRef.current = el;
          el.onended = () => {
            if (token !== tokenRef.current) return;
            setSpeaking(null);
            settle();
          };
          el.onerror = fallback;
          el.play().catch(fallback);
          return undefined;
        })
        .catch(fallback);
      return p;
    },
    [voiceEnabled, stop, setSpeaking, resolveLang, tts, settle],
  );

  /** Ketuk teks yang sedang dibaca = berhenti. */
  const speak = useCallback(
    (args) => {
      if (speakingRef.current && speakingRef.current === args.id) {
        stop();
        return Promise.resolve();
      }
      return speakAsync(args);
    },
    [speakAsync, stop],
  );

  useEffect(() => {
    if (!voiceEnabled) stop();
  }, [voiceEnabled, stop]);

  const sfx = useCallback(
    (name, custom) => {
      if (!sfxEnabled) return;
      if (custom) {
        resolveMediaUrl(custom)
          .then((url) => {
            if (!url) return playSfx(name);
            const a = new Audio(url);
            return a.play().catch(() => playSfx(name));
          })
          .catch(() => playSfx(name));
        return;
      }
      playSfx(name);
    },
    [sfxEnabled],
  );

  const unlock = useCallback(() => {
    unlockAudio();
    if (speechSupported) {
      // "pemanasan" mesin TTS di iOS/Android
      const u = new SpeechSynthesisUtterance(' ');
      u.volume = 0;
      window.speechSynthesis.speak(u);
    }
  }, []);

  const value = useMemo(
    () => ({ speak, speakAsync, stop, speakingId, sfx, unlock, voiceEnabled, speechSupported, resolveLang }),
    [speak, speakAsync, stop, speakingId, sfx, unlock, voiceEnabled, resolveLang],
  );
  return <AudioCtx.Provider value={value}>{children}</AudioCtx.Provider>;
}

export function useAudio() {
  const c = useContext(AudioCtx);
  if (!c) throw new Error('useAudio() harus dipakai di dalam <AudioProvider>.');
  return c;
}
