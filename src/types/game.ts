// ── Types ────────────────────────────────────────────────────────────────────

export type Phase = 'grupos' | 'octavos' | 'cuartos' | 'semifinal' | 'final';
export type Screen =
  | 'start'
  | 'question'
  | 'feedback'
  | 'transition'
  | 'results'
  | 'leaderboard'
  | 'pergamino';

export interface Question {
  pregunta: string;
  tipo?: 'opciones' | 'abierta';
  opciones?: string[];
  correcta?: number;
  explicacion?: string;
  instruccion?: string;
}

export interface GameSettings {
  secondChanceEnabled: boolean;
  timePenaltySeconds: number;
}

export interface AnswerRecord {
  phase: Phase;
  questionIndex: number;
  correct: boolean;
  usedSecondChance: boolean;
  timeTakenMs: number;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  phase: Phase;
  totalTimeMs: number;
  date: string;
  eliminated: boolean;
  penaltyMs: number;
}

export interface GameState {
  screen: Screen;
  phase: Phase;
  questionIndex: number;
  playerName: string;
  isEliminated: boolean;
  hasUsedSecondChance: boolean;
  lastAnswerCorrect: boolean | null;
  openAnswer: string;
  answers: AnswerRecord[];
  globalStartTime: number;
  questionStartTime: number;
  totalElapsedMs: number;
  penaltyMs: number;
  settings: GameSettings;
  shuffledQuestions?: Record<Phase, Question[]>;
  hasSavedScore?: boolean;
}

// ── Action types ─────────────────────────────────────────────────────────────

export type GameAction =
  | { type: 'START_GAME'; payload: { name: string; settings: GameSettings } }
  | { type: 'SET_QUESTION_START' }
  | { type: 'ANSWER_CORRECT'; payload: { timeTakenMs: number } }
  | { type: 'ANSWER_WRONG'; payload: { timeTakenMs: number } }
  | { type: 'USE_SECOND_CHANCE' }
  | { type: 'ADVANCE_PHASE' }
  | { type: 'COMPLETE_GAME'; payload: { totalElapsedMs: number } }
  | { type: 'RESTART' }
  | { type: 'GO_TO_SCREEN'; payload: Screen }
  | { type: 'SET_OPEN_ANSWER'; payload: string }
  | { type: 'SUBMIT_OPEN_ANSWER'; payload: { timeTakenMs: number } }
  | { type: 'MARK_SCORE_SAVED' };

// ── Phase metadata ────────────────────────────────────────────────────────────

export interface PhaseInfo {
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  questionCount: number;
  next: Phase | null;
}

export const PHASE_INFO: Record<Phase, PhaseInfo> = {
  grupos: {
    label: 'Fase de Grupos',
    icon: '⚽',
    color: 'text-green-400',
    bgColor: 'bg-green-900/40',
    borderColor: 'border-green-500',
    questionCount: 8,
    next: 'octavos',
  },
  octavos: {
    label: 'Octavos de Final',
    icon: '🥉',
    color: 'text-amber-500',
    bgColor: 'bg-amber-900/40',
    borderColor: 'border-amber-500',
    questionCount: 6,
    next: 'cuartos',
  },
  cuartos: {
    label: 'Cuartos de Final',
    icon: '🥈',
    color: 'text-slate-300',
    bgColor: 'bg-slate-700/40',
    borderColor: 'border-slate-400',
    questionCount: 4,
    next: 'semifinal',
  },
  semifinal: {
    label: 'Semifinal',
    icon: '🔥',
    color: 'text-orange-400',
    bgColor: 'bg-orange-900/40',
    borderColor: 'border-orange-500',
    questionCount: 2,
    next: 'final',
  },
  final: {
    label: 'Gran Final',
    icon: '🏆',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-900/40',
    borderColor: 'border-yellow-500',
    questionCount: 1,
    next: null,
  },
};

export const PHASE_ORDER: Phase[] = ['grupos', 'octavos', 'cuartos', 'semifinal', 'final'];

export function phaseRank(phase: Phase): number {
  return PHASE_ORDER.indexOf(phase);
}
