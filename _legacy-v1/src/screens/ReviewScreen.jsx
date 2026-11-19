/**
 * ReviewScreen — Tinjau setiap soal: jawabanmu vs jawaban benar + penjelasan (bisa dibacakan).
 */
import { Check, ChevronLeft, X } from 'lucide-react';
import { UI_TEXT } from '../config/gameConfig';
import GameButton from '../components/ui/GameButton';
import SpeakableText from '../components/ui/SpeakableText';

export default function ReviewScreen({ answers, onBack }) {
  return (
    <main className="flex min-h-dvh justify-center px-4 py-6">
      <div className="w-full max-w-3xl">
        <header className="mb-5 flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            aria-label={UI_TEXT.backToResult}
            className="grid size-11 place-items-center rounded-2xl bg-white/15 text-white backdrop-blur transition hover:bg-white/25"
          >
            <ChevronLeft className="size-6" strokeWidth={2.5} />
          </button>
          <h1 className="font-display text-3xl font-bold text-white drop-shadow">{UI_TEXT.reviewTitle}</h1>
        </header>

        <ol className="space-y-4">
          {answers.map((answer, i) => (
            <ReviewItem key={answer.question.id} answer={answer} number={i + 1} />
          ))}
        </ol>

        <div className="mt-6 flex justify-center">
          <GameButton variant="secondary" icon={ChevronLeft} onClick={onBack}>
            {UI_TEXT.backToResult}
          </GameButton>
        </div>
      </div>
    </main>
  );
}

function ReviewItem({ answer, number }) {
  const { question: q, selectedId, isCorrect, timedOut, points } = answer;
  const status = isCorrect ? `+${points.toLocaleString('id-ID')} ${UI_TEXT.points}` : timedOut ? UI_TEXT.notAnswered : UI_TEXT.wrong;

  return (
    <li className="rounded-3xl bg-white/95 p-4 shadow-xl animate-fade-in sm:p-5">
      <div className="mb-3 flex items-start gap-3">
        <span
          className={`grid size-10 shrink-0 place-items-center rounded-2xl text-white ${isCorrect ? 'bg-emerald-500' : 'bg-rose-500'}`}
        >
          {isCorrect ? <Check className="size-6" strokeWidth={3} /> : <X className="size-6" strokeWidth={3} />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            {UI_TEXT.question} {number} · {status}
          </p>
          <SpeakableText
            block
            id={`review-${q.id}-question`}
            text={q.question}
            speakText={q.speak}
            lang={q.lang}
            audioSrc={q.audio}
            className="-mx-3"
            textClassName="font-display text-xl font-bold text-slate-800"
          />
        </div>
      </div>

      <ul className="grid gap-2 sm:grid-cols-2">
        {q.options.map((opt) => {
          const isAnswer = opt.id === q.correct;
          const isPicked = opt.id === selectedId;
          const tone = isAnswer
            ? 'bg-emerald-50 text-emerald-800 ring-emerald-400'
            : isPicked
              ? 'bg-rose-50 text-rose-800 ring-rose-400'
              : 'bg-slate-50 text-slate-500 ring-slate-200';
          return (
            <li key={opt.id} className={`flex items-center gap-2 rounded-2xl px-3 py-2.5 font-bold ring-2 ${tone}`}>
              {isAnswer ? (
                <Check className="size-5 shrink-0" strokeWidth={3} />
              ) : isPicked ? (
                <X className="size-5 shrink-0" strokeWidth={3} />
              ) : (
                <span className="size-5 shrink-0" />
              )}
              <span className="flex-1">{opt.text}</span>
              {isPicked && <span className="text-xs font-extrabold uppercase">{UI_TEXT.yourAnswer}</span>}
            </li>
          );
        })}
      </ul>

      {q.explanation && (
        <div className="mt-3 rounded-2xl bg-indigo-50 p-2">
          <SpeakableText
            block
            id={`review-${q.id}-explain`}
            text={q.explanation}
            speakText={q.explanationSpeak}
            lang={q.explanationLang || q.lang}
            audioSrc={q.explanationAudio}
            textClassName="font-semibold leading-relaxed text-slate-700"
          />
        </div>
      )}
    </li>
  );
}
