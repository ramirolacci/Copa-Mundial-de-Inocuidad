import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, ArrowRight, RefreshCw } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { QUESTIONS } from '../../data/questions';

export default function FeedbackScreen() {
  const { state, dispatch } = useGameStore();
  const cardRef = useRef<HTMLDivElement>(null);

  const isCorrect = state.lastAnswerCorrect === true;
  const isEliminated = state.isEliminated;
  const canSecondChance =
    !isCorrect && !isEliminated && state.settings.secondChanceEnabled && !state.hasUsedSecondChance;

  const lastAnswer = state.answers[state.answers.length - 1];
  const timeTakenMs = lastAnswer?.timeTakenMs ?? 0;
  const lastQuestion = lastAnswer ? QUESTIONS[lastAnswer.phase]?.[lastAnswer.questionIndex] : null;

  // Format time
  const totalSec = Math.floor(timeTakenMs / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  const timeFormatted = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

  // Shake on wrong
  useEffect(() => {
    if (!isCorrect && cardRef.current) {
      cardRef.current.classList.add('animate-shake');
      const t = setTimeout(() => cardRef.current?.classList.remove('animate-shake'), 600);
      return () => clearTimeout(t);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleContinue = () => {
    if (isEliminated) {
      dispatch({ type: 'GO_TO_SCREEN', payload: 'results' });
    } else {
      dispatch({ type: 'GO_TO_SCREEN', payload: 'question' });
    }
  };

  const handleSecondChance = () => {
    dispatch({ type: 'USE_SECOND_CHANCE' });
  };

  const bgColor = isEliminated ? '#1a0505' : '#0f172a';
  const headerBg = isCorrect ? 'bg-green-900/40 border-green-500' : isEliminated ? 'bg-red-900/50 border-red-500' : 'bg-orange-900/40 border-orange-500';
  const titleColor = isCorrect ? 'text-green-400' : isEliminated ? 'text-red-400' : 'text-orange-400';
  const titleText = isCorrect ? '¡Correcto! ✅' : isEliminated ? '¡Eliminado! ❌' : 'Respuesta Incorrecta ⚠️';
  const subText = isCorrect
    ? '¡Excelente! Seguís en carrera 🚀'
    : isEliminated
    ? 'No te rindas — la inocuidad se aprende todos los días 💪'
    : canSecondChance
    ? '¡Pero tenés una Segunda Oportunidad!'
    : 'Repasá el procedimiento correcto';

  const Icon = isCorrect ? CheckCircle : isEliminated ? XCircle : AlertTriangle;
  const iconColor = isCorrect ? 'text-green-400' : isEliminated ? 'text-red-400' : 'text-orange-400';
  const continueLabel = isEliminated ? 'Ver mis resultados' : 'Continuar';
  const continueClass = isCorrect
    ? 'bg-green-600 hover:bg-green-500'
    : isEliminated
    ? 'bg-slate-600 hover:bg-slate-500'
    : 'bg-slate-700 hover:bg-slate-600';

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{ backgroundColor: bgColor }}
    >
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          type: 'spring',
          stiffness: 90,
          damping: 14,
          mass: 0.8
        }}
        className="w-full max-w-lg flex flex-col gap-4"
      >

        {/* Header */}
        <div className={`rounded-2xl border-2 p-6 ${headerBg}`}>
          <div className="flex items-center gap-3 mb-4">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}>
              <Icon size={48} className={iconColor} />
            </motion.div>
            <div>
              <h2 className={`text-2xl font-black ${titleColor}`}>{titleText}</h2>
              <p className="text-slate-300 text-sm">{subText}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-800/60 rounded-lg px-3 py-1.5 w-fit">
            <span className="text-slate-400 text-xs">⏱ Tiempo:</span>
            <span className="font-mono font-bold text-white text-sm">{timeFormatted}</span>
          </div>
        </div>



        {/* Correct explanation */}
        {isCorrect && lastQuestion?.explicacion && (
          <div className="bg-green-900/20 border border-green-700/40 rounded-xl p-4">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">¿Por qué?</p>
            <p className="text-green-200 text-sm leading-relaxed">{lastQuestion.explicacion}</p>
          </div>
        )}

        {/* Second chance */}
        {canSecondChance && (
          <button
            onClick={handleSecondChance}
            aria-label="Usar segunda oportunidad"
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-base cursor-pointer
              bg-orange-600 hover:bg-orange-500 text-white transition-colors
              focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
          >
            <RefreshCw size={18} />
            Segunda Oportunidad (+{state.settings.timePenaltySeconds}s penalización)
          </button>
        )}

        {/* Continue */}
        <button
          onClick={handleContinue}
          aria-label={continueLabel}
          className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-base cursor-pointer
            ${continueClass} text-white transition-colors
            focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400`}
        >
          {continueLabel}
          <ArrowRight size={18} />
        </button>

        {state.hasUsedSecondChance && (
          <p className="text-center text-orange-400/70 text-xs">
            ⏱ +{state.settings.timePenaltySeconds}s añadidos al tiempo total
          </p>
        )}
      </motion.div>
    </div>
  );
}
