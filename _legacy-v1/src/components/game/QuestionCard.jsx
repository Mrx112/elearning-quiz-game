/**
 * QuestionCard — Kartu soal: frame Canva + slot gambar + teks soal yang bisa dibacakan.
 */
import { Pointer } from 'lucide-react';
import { ASSETS, THEME, UI_TEXT } from '../../config/gameConfig';
import { useAssetStatus } from '../../hooks/useAssetStatus';
import SkinSurface from '../canva/SkinSurface';
import SpeakableText from '../ui/SpeakableText';

export const questionSpeechId = (q) => `${q.id}-question`;

export default function QuestionCard({ question, index }) {
  return (
    <SkinSurface
      src={ASSETS.cardFrame}
      className="relative rounded-3xl animate-fade-in"
      fallbackClassName={`${THEME.card} p-4 sm:p-7`}
      skinClassName={THEME.cardSkinPadding}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
        <QuestionMedia image={question.image} emoji={question.emoji} />

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-extrabold uppercase tracking-wider">
            <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-indigo-700">
              {UI_TEXT.question} {index + 1}
            </span>
            {question.lang && (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
                {UI_TEXT.langNames[question.lang] ?? question.lang}
              </span>
            )}
          </div>

          <SpeakableText
            block
            id={questionSpeechId(question)}
            text={question.question}
            speakText={question.speak}
            lang={question.lang}
            audioSrc={question.audio}
            className="-mx-3"
            textClassName="font-display text-2xl font-bold leading-snug text-slate-800 sm:text-3xl lg:text-4xl"
          />

          <p className="mt-2 flex items-center gap-1.5 text-sm font-bold text-slate-500">
            <Pointer className="size-4" />
            {UI_TEXT.tapToListen}
          </p>
        </div>
      </div>
    </SkinSurface>
  );
}

/** Slot ilustrasi: gambar Canva → emoji → tidak tampil. */
function QuestionMedia({ image, emoji }) {
  const status = useAssetStatus(image);

  if (status === 'ok') {
    return (
      <div className="aspect-video max-h-56 w-full shrink-0 overflow-hidden rounded-2xl bg-slate-50 md:max-h-none md:w-2/5">
        <img src={image} alt="" className="size-full object-contain" draggable={false} />
      </div>
    );
  }
  if (!emoji) return null;

  return (
    <div className="grid h-28 w-full shrink-0 place-items-center rounded-2xl bg-linear-to-br from-sky-100 via-indigo-50 to-fuchsia-100 sm:h-36 md:aspect-square md:h-auto md:w-56">
      <span className="text-6xl animate-float sm:text-7xl md:text-8xl" aria-hidden>
        {emoji}
      </span>
    </div>
  );
}
