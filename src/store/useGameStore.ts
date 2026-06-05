import React, { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { GameState, GameAction, Screen, Phase, GameSettings, Question } from '../types/game';
import { PHASE_INFO } from '../types/game';
import { QUESTIONS } from '../data/questions';

// Helper functions to shuffle options of questions
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function shuffleQuestionOptions(question: Question): Question {
  if (!question.opciones || question.correcta === undefined) {
    return question;
  }

  // Clean prefixes: 'A) ', 'B) ', 'C) ', etc.
  const cleanPrefix = (str: string) => str.replace(/^[A-Z]\)\s*/i, '');
  const cleaned = question.opciones.map(cleanPrefix);

  // Map to include correctness indicator
  const items = cleaned.map((text, index) => ({
    text,
    isCorrect: index === question.correcta,
  }));

  // Shuffle items
  const shuffledItems = shuffleArray(items);

  // Add new prefixes
  const finalOptions = shuffledItems.map((item, index) => {
    const letter = String.fromCharCode(65 + index);
    return `${letter}) ${item.text}`;
  });

  const newCorrecta = shuffledItems.findIndex(item => item.isCorrect);

  return {
    ...question,
    opciones: finalOptions,
    correcta: newCorrecta,
  };
}

function getShuffledQuestionsRecord(): Record<Phase, Question[]> {
  const record: Partial<Record<Phase, Question[]>> = {};
  for (const phase in QUESTIONS) {
    const p = phase as Phase;
    record[p] = QUESTIONS[p].map(shuffleQuestionOptions);
  }
  return record as Record<Phase, Question[]>;
}

const LOCAL_STORAGE_KEY = 'copa_inocuidad_game_state';

const loadSavedState = (): GameState | null => {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.screen === 'results' || parsed.screen === 'leaderboard' || parsed.screen === 'pergamino' || parsed.isEliminated) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading state from localStorage:', e);
  }
  return null;
};

// ── Initial state ─────────────────────────────────────────────────────────────

export const DEFAULT_SETTINGS: GameSettings = {
  secondChanceEnabled: false,
  timePenaltySeconds: 30,
};

const defaultInitialState: GameState = {
  screen: 'start',
  phase: 'grupos',
  questionIndex: 0,
  playerName: '',
  isEliminated: false,
  hasUsedSecondChance: false,
  lastAnswerCorrect: null,
  openAnswer: '',
  answers: [],
  globalStartTime: 0,
  questionStartTime: 0,
  totalElapsedMs: 0,
  penaltyMs: 0,
  settings: DEFAULT_SETTINGS,
  hasSavedScore: false,
};

const savedState = loadSavedState();
const initialState: GameState = savedState || defaultInitialState;

// ── Reducer ───────────────────────────────────────────────────────────────────

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME': {
      const now = Date.now();
      return {
        ...initialState,
        screen: 'question',
        phase: 'grupos',
        questionIndex: 0,
        playerName: action.payload.name.trim() || 'Jugador',
        settings: action.payload.settings,
        globalStartTime: now,
        questionStartTime: now,
        shuffledQuestions: getShuffledQuestionsRecord(),
      };
    }

    case 'SET_QUESTION_START':
      return { ...state, questionStartTime: Date.now() };

    case 'ANSWER_CORRECT': {
      const { timeTakenMs } = action.payload;
      const phaseInfo = PHASE_INFO[state.phase];
      const isLastQuestion = state.questionIndex >= phaseInfo.questionCount - 1;

      const newAnswers = [
        ...state.answers,
        { phase: state.phase, questionIndex: state.questionIndex, correct: true, usedSecondChance: false, timeTakenMs },
      ];

      if (isLastQuestion) {
        if (state.phase === 'final') {
          return { ...state, screen: 'results', lastAnswerCorrect: true, answers: newAnswers, totalElapsedMs: Date.now() - state.globalStartTime };
        }
        return { ...state, screen: 'transition', lastAnswerCorrect: true, answers: newAnswers };
      }

      return { ...state, screen: 'feedback', lastAnswerCorrect: true, questionIndex: state.questionIndex + 1, answers: newAnswers };
    }

    case 'ANSWER_WRONG': {
      const { timeTakenMs } = action.payload;
      const canUseSecondChance = state.settings.secondChanceEnabled && !state.hasUsedSecondChance;
      const newAnswers = [
        ...state.answers,
        { phase: state.phase, questionIndex: state.questionIndex, correct: false, usedSecondChance: false, timeTakenMs },
      ];
      return { ...state, screen: 'feedback', lastAnswerCorrect: false, isEliminated: !canUseSecondChance, answers: newAnswers };
    }

    case 'USE_SECOND_CHANCE': {
      const penaltyMs = state.settings.timePenaltySeconds * 1000;
      return { ...state, screen: 'question', hasUsedSecondChance: true, penaltyMs: state.penaltyMs + penaltyMs, questionStartTime: Date.now() };
    }

    case 'ADVANCE_PHASE': {
      const next = PHASE_INFO[state.phase].next as Phase;
      return { ...state, screen: 'question', phase: next, questionIndex: 0, lastAnswerCorrect: null, questionStartTime: Date.now() };
    }

    case 'COMPLETE_GAME':
      return { ...state, screen: 'results', totalElapsedMs: action.payload.totalElapsedMs };

    case 'SUBMIT_OPEN_ANSWER': {
      const { timeTakenMs } = action.payload;
      const newAnswers = [
        ...state.answers,
        { phase: state.phase, questionIndex: state.questionIndex, correct: true, usedSecondChance: false, timeTakenMs },
      ];
      return { ...state, screen: 'results', lastAnswerCorrect: true, answers: newAnswers, totalElapsedMs: Date.now() - state.globalStartTime };
    }

    case 'SET_OPEN_ANSWER':
      return { ...state, openAnswer: action.payload };

    case 'GO_TO_SCREEN': {
      const screen = action.payload as Screen;
      if (screen === 'results') {
        const totalElapsedMs = state.totalElapsedMs > 0 ? state.totalElapsedMs : (Date.now() - state.globalStartTime);
        return { ...state, screen, totalElapsedMs };
      }
      return { ...state, screen };
    }

    case 'MARK_SCORE_SAVED':
      return { ...state, hasSavedScore: true };

    case 'RESTART':
      return { ...defaultInitialState };

    default:
      return state;
  }
}

// ── Context ───────────────────────────────────────────────────────────────────

const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
} | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  React.useEffect(() => {
    if (state.screen === 'results' || state.screen === 'leaderboard' || state.screen === 'pergamino' || state.isEliminated) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
      } catch (e) {
        console.error('Error saving state to localStorage:', e);
      }
    }
  }, [state]);

  return React.createElement(
    GameContext.Provider,
    { value: { state, dispatch } },
    children
  );
}

export function useGameStore() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGameStore must be used within GameProvider');
  return ctx;
}

export function useCurrentQuestion() {
  const { state } = useGameStore();
  return state.shuffledQuestions?.[state.phase]?.[state.questionIndex] ?? QUESTIONS[state.phase]?.[state.questionIndex] ?? null;
}

export { QUESTIONS };
