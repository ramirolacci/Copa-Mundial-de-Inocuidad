import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { useGameStore, useCurrentQuestion } from '../../store/useGameStore';
import { PHASE_INFO } from '../../types/game';
import PhaseHeader from '../ui/PhaseHeader';
import OptionButton from '../ui/OptionButton';
import GlobalTimer from '../ui/GlobalTimer';
import { useTimer } from '../../hooks/useTimer';
import { useSound } from '../../hooks/useSound';

export default function QuestionScreen() {
  const { state, dispatch } = useGameStore();
  const question = useCurrentQuestion();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [openText, setOpenText] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const questionStartRef = useRef(Date.now());
  const { formatted } = useTimer(state.globalStartTime, true);
  const { playCorrect, playWrong } = useSound();

  const phaseInfo = PHASE_INFO[state.phase];
  const isFinal = state.phase === 'final';

  // Reset selection on question change
  useEffect(() => {
    setSelectedIndex(null);
    setOpenText('');
    setConfirmed(false);
    questionStartRef.current = Date.now();
  }, [state.phase, state.questionIndex]);

  if (!question) return null;

  const handleConfirm = () => {
    if (confirmed) return;
    setConfirmed(true);
    const timeTakenMs = Date.now() - questionStartRef.current;

    if (isFinal) {
      // Open question – always passes
      dispatch({ type: 'SUBMIT_OPEN_ANSWER', payload: { timeTakenMs } });
      return;
    }

    if (selectedIndex === null) return;

    if (selectedIndex === question.correcta) {
      playCorrect();
      dispatch({ type: 'ANSWER_CORRECT', payload: { timeTakenMs } });
    } else {
      playWrong();
      dispatch({ type: 'ANSWER_WRONG', payload: { timeTakenMs } });
    }
  };

  const canConfirm = isFinal ? openText.trim().length > 10 : selectedIndex !== null;

  return (
    <div className="min-h-screen flex flex-col px-4 py-6"
      style={{ background: 'linear-gradient(160deg, #0f172a 0%, #1a2744 100%)' }}>

      {/* Top bar */}
      <div className="w-full max-w-2xl mx-auto flex items-center justify-between mb-2">
        <span className="text-slate-500 text-sm font-medium">{state.playerName}</span>
        <GlobalTimer formatted={formatted} hasBonus={state.penaltyMs > 0} />
      </div>

      {/* Main card */}
      <div className="flex-1 flex items-center justify-center">
        <motion.div
          key={`${state.phase}-${state.questionIndex}`}
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.95 }}
          transition={{
            type: 'spring',
            stiffness: 90,
            damping: 14,
            mass: 0.8
          }}
          className="w-full max-w-2xl"
        >
          {/* Phase header */}
          <PhaseHeader
            phase={state.phase}
            questionIndex={state.questionIndex}
            totalQuestions={phaseInfo.questionCount}
          />

          {/* Question card */}
          <div className="bg-slate-800/70 backdrop-blur border border-slate-700 rounded-2xl p-6 mb-4">
            {state.hasUsedSecondChance && (
              <div className="mb-4 flex items-center gap-2 bg-orange-900/40 border border-orange-500/40 rounded-lg px-3 py-2">
                <span className="text-orange-400 text-sm font-semibold">⚠️ Segunda Oportunidad activa – ¡La última!</span>
              </div>
            )}

            {isFinal && question.instruccion && (
              <p className="text-yellow-400/80 text-sm italic mb-4 border-l-2 border-yellow-400/40 pl-3">
                {question.instruccion}
              </p>
            )}

            <p className="text-white text-xl sm:text-2xl font-bold leading-snug mb-6">
              {question.pregunta}
            </p>

            {/* Options or Open answer */}
            {isFinal ? (
              <textarea
                value={openText}
                onChange={(e) => setOpenText(e.target.value)}
                disabled={confirmed}
                placeholder="Escribe tu argumento completo aquí..."
                rows={5}
                aria-label="Respuesta abierta"
                className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500
                  focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-all text-base resize-none"
              />
            ) : (
              <div className="flex flex-col gap-3">
                <AnimatePresence>
                  {question.opciones?.map((opt, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 25, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{
                        type: 'spring',
                        stiffness: 100,
                        damping: 13,
                        delay: i * 0.06
                      }}
                    >
                      <OptionButton
                        text={opt}
                        index={i}
                        selected={selectedIndex === i}
                        disabled={confirmed}
                        onSelect={setSelectedIndex}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Confirm button */}
          <motion.button
            onClick={handleConfirm}
            disabled={!canConfirm || confirmed}
            whileHover={canConfirm && !confirmed ? { scale: 1.02 } : {}}
            whileTap={canConfirm && !confirmed ? { scale: 0.97 } : {}}
            aria-label="Confirmar respuesta"
            className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-lg transition-all duration-300
              focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400
              ${canConfirm && !confirmed
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-400 text-slate-900 shadow-lg shadow-yellow-900/30 cursor-pointer'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              }`}
          >
            <CheckCircle size={20} />
            {confirmed ? 'Confirmando...' : 'Confirmar Respuesta'}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
