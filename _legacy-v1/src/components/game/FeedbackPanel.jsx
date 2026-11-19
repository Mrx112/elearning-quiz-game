/**
 * FeedbackPanel — Umpan balik instan setelah menjawab.
 *   Benar  → panel hijau + konfeti + maskot senang + poin
 *   Salah  → panel merah bergetar + maskot sedih + jawaban yang benar
 *   Keduanya menampilkan penjelasan yang bisa disentuh untuk dibacakan.
 */
import { ArrowRight, CircleCheck, CircleX, Flag, TimerOff } from 'lucide-react';
import { UI_TEXT } from '../../config/gameConfig';
import Mascot from '../canva/Mascot';
import GameButton from '../ui/GameButton';
import SpeakableText from '../ui/SpeakableText';
import Confetti from './Confetti';

export default function FeedbackPanel({ result, isLast, onNext }) {
  const { question: q, isCorrect, timedOut, points, streakBonus } = result;
  const correctOption = q.options.find((o) => o.id === q.correct);

  const title = isCorrect ? UI_TEXT.correct : timedOut ? UI_TEXT.timeUp : UI_TEXT.wrong;
  const TitleIcon = isCorrect ? CircleCheck : timedOut ? TimerOff : CircleX;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex justify-center p-3 sm:p-4" role="status" aria-live="assertive">
      {isCorrect && <Confetti />}

      <div
        className={`relative w-full max-w-2xl rounded-3xl p-5 text-white shadow-2xl ring-4 ring-white/30 sm:p-6 ${
          isCorrect ? 'bg-emerald-500 animate-slide-up' : 'bg-rose-500 animate-slide-up-shake'
        }`}
      >
        <div className="flex items-start gap-4">
          <Mascot
            mood={isCorrect ? 'happy' : 'sad'}
            className="-mt-10 size-14 shrink-0 sm:-mt-14 sm:size-24"
            emojiClassName="text-3xl sm:text-5xl"
          />
          <div className="min-w-0 flex-1">
            <h2 className="flex items-center gap-2 font-display text-2xl font-bold sm:text-4xl">
              <TitleIcon className="size-7 shrink-0 sm:size-8" strokeWidth={2.5} />
              {title}
            </h2>

            {isCorrect ? (
              <p className="mt-1 text-lg font-extrabold">
                +{points.toLocaleString('id-ID')} {UI_TEXT.points}
                {streakBonus > 0 && (
                  <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-sm">
                    🔥 {UI_TEXT.streakBonus} +{streakBonus}
                  </span>
                )}
              </p>
            ) : (
              <div className="mt-1 flex flex-wrap items-center gap-x-1 text-lg font-bold">
                <span>{UI_TEXT.correctAnswerIs}</span>
                <SpeakableText
                  variant="dark"
                  id={`${q.id}-answer`}
                  text={correctOption?.text}
                  speakText={correctOption?.speak}
                  lang={correctOption?.lang || q.lang}
                  audioSrc={correctOption?.audio}
                  textClassName="font-extrabold underline decoration-white/50 decoration-2 underline-offset-4"
                />
              </div>
            )}
          </div>
        </div>

        {q.explanation && (
          <div className="mt-4 rounded-2xl bg-black/10 p-2">
            <p className="px-3 pt-1 text-xs font-extrabold uppercase tracking-wider text-white/75">
              {UI_TEXT.explanation}
            </p>
            <SpeakableText
              block
              variant="dark"
              id={`${q.id}-explain`}
              text={q.explanation}
              speakText={q.explanationSpeak}
              lang={q.explanationLang || q.lang}
              audioSrc={q.explanationAudio}
              textClassName="text-base font-semibold leading-relaxed sm:text-lg"
            />
          </div>
        )}

        <div className="mt-5 flex justify-end">
          <GameButton
            variant="secondary"
            autoFocus
            onClick={onNext}
            iconRight={isLast ? Flag : ArrowRight}
            className="w-full sm:w-auto"
          >
            {isLast ? UI_TEXT.seeResult : UI_TEXT.next}
          </GameButton>
        </div>
      </div>
    </div>
  );
}
