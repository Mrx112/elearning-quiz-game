/**
 * useQuizGame — "Mesin" permainan (logika murni, tanpa tampilan).
 *
 * State machine per soal:
 *
 *    ┌────────────┐  SUBMIT / waktu habis  ┌────────────┐
 *    │ answering  │ ─────────────────────► │  feedback  │
 *    └────────────┘                        └────────────┘
 *          ▲               NEXT                  │
 *          └─────────────────────────────────────┘
 *
 * Kunci anti double-click: SUBMIT hanya diproses saat phase === 'answering'.
 */
import { useCallback, useEffect, useReducer, useRef } from 'react';
import { GAME_SETTINGS } from '../config/gameConfig';

const { timer, scoring } = GAME_SETTINGS;
const TICK_MS = 100;

/* ----------------------------- helpers ----------------------------- */

function shuffle(list) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function buildDeck(questions) {
  const ordered = GAME_SETTINGS.shuffleQuestions ? shuffle(questions) : questions;
  return ordered.map((q) => (GAME_SETTINGS.shuffleOptions ? { ...q, options: shuffle(q.options) } : q));
}

/** Batas waktu soal (0 = tanpa timer). */
export function timeLimitOf(question) {
  if (!timer.enabled || !question) return 0;
  return question.timeLimit ?? timer.seconds;
}

/** Rumus skor ala Kahoot: dasar × faktor kecepatan + bonus beruntun. */
function calcPoints({ timeLeft, limit, streak }) {
  const speedFactor = scoring.speedBonus && limit > 0 ? 0.5 + 0.5 * (timeLeft / limit) : 1;
  const base = Math.round((scoring.basePoints * speedFactor) / 10) * 10;
  const streakBonus = scoring.streakBonus * Math.max(0, streak - 1);
  return { base, streakBonus, total: base + streakBonus };
}

/* ----------------------------- reducer ----------------------------- */

function init(questions) {
  const deck = buildDeck(questions);
  return {
    deck,
    index: 0,
    phase: 'answering', // 'answering' | 'feedback'
    selectedId: null,
    score: 0,
    streak: 0,
    answers: [],
    lastResult: null,
    timeLeft: timeLimitOf(deck[0]),
  };
}

function applySubmit(state, choiceId, timedOut = false) {
  if (state.phase !== 'answering') return state; // 🔒 kunci jawaban ganda

  const question = state.deck[state.index];
  const isCorrect = choiceId != null && choiceId === question.correct;
  const streak = isCorrect ? state.streak + 1 : 0;
  const pts = isCorrect
    ? calcPoints({ timeLeft: state.timeLeft, limit: timeLimitOf(question), streak })
    : { base: 0, streakBonus: 0, total: 0 };

  const result = {
    question,
    selectedId: choiceId,
    isCorrect,
    timedOut,
    points: pts.total,
    basePoints: pts.base,
    streakBonus: pts.streakBonus,
    streak,
  };

  return {
    ...state,
    phase: 'feedback',
    selectedId: choiceId,
    score: state.score + pts.total,
    streak,
    answers: [...state.answers, result],
    lastResult: result,
  };
}

function reducer(state, action) {
  switch (action.type) {
    case 'SELECT':
      return state.phase === 'answering' ? { ...state, selectedId: action.id } : state;

    case 'SUBMIT':
      return applySubmit(state, action.id ?? state.selectedId);

    case 'TICK': {
      if (state.phase !== 'answering' || !timer.enabled) return state;
      const timeLeft = Math.max(0, state.timeLeft - action.dt);
      return timeLeft <= 0 ? applySubmit({ ...state, timeLeft: 0 }, null, true) : { ...state, timeLeft };
    }

    case 'NEXT': {
      if (state.phase !== 'feedback' || state.index >= state.deck.length - 1) return state;
      const index = state.index + 1;
      return {
        ...state,
        index,
        phase: 'answering',
        selectedId: null,
        lastResult: null,
        timeLeft: timeLimitOf(state.deck[index]),
      };
    }

    default:
      return state;
  }
}

/* ------------------------------ hook ------------------------------- */

/**
 * @param {Array} questions  data dari questionsData.js
 * @param {{ paused?: boolean }} options  paused = hentikan timer sementara (mis. saat suara diputar)
 */
export function useQuizGame(questions, { paused = false } = {}) {
  const [state, dispatch] = useReducer(reducer, questions, init);

  const pausedRef = useRef(paused);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  // Timer: berjalan hanya saat fase menjawab
  useEffect(() => {
    if (!timer.enabled || state.phase !== 'answering') return undefined;
    const id = setInterval(() => {
      if (!pausedRef.current) dispatch({ type: 'TICK', dt: TICK_MS / 1000 });
    }, TICK_MS);
    return () => clearInterval(id);
  }, [state.phase, state.index]);

  const select = useCallback((id) => dispatch({ type: 'SELECT', id }), []);
  const submit = useCallback((id) => dispatch({ type: 'SUBMIT', id }), []);
  const next = useCallback(() => dispatch({ type: 'NEXT' }), []);

  const question = state.deck[state.index];

  return {
    ...state,
    question,
    total: state.deck.length,
    timeLimit: timeLimitOf(question),
    isLast: state.index === state.deck.length - 1,
    select,
    submit,
    next,
  };
}
