import React, { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { GameState, GameAction, Screen, Phase, GameSettings } from '../types/game';
import { PHASE_INFO } from '../types/game';
import { QUESTIONS } from '../data/questions';

// ── Initial state ─────────────────────────────────────────────────────────────

export const DEFAULT_SETTINGS: GameSettings = {
  secondChanceEnabled: false,
  timePenaltySeconds: 30,
};

const initialState: GameState = {
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
};

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
        return { ...state, screen, totalElapsedMs: Date.now() - state.globalStartTime };
      }
      return { ...state, screen };
    }

    case 'RESTART':
      return { ...initialState };

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
  return QUESTIONS[state.phase]?.[state.questionIndex] ?? null;
}

export { QUESTIONS };
