import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { PHASE_INFO } from '../../types/game';
import type { Phase } from '../../types/game';
import ConfettiEffect from '../ui/ConfettiEffect';
import { useSound } from '../../hooks/useSound';

export default function PhaseTransitionScreen() {
  const { state, dispatch } = useGameStore();
  const { playPhaseAdvance } = useSound();
  const currentInfo = PHASE_INFO[state.phase];
  const nextPhase = currentInfo.next as Phase | null;
  const nextInfo = nextPhase ? PHASE_INFO[nextPhase] : null;

  useEffect(() => {
    try { playPhaseAdvance(); } catch { /* ignore */ }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleContinue = () => {
    if (nextPhase) {
      dispatch({ type: 'ADVANCE_PHASE' });
    } else {
      dispatch({ type: 'GO_TO_SCREEN', payload: 'results' });
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #0a1628 0%, #1a2a0a 100%)' }}
    >
      <ConfettiEffect count={70} />

      {/* Glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-72 h-72 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #fbbf24 0%, transparent 70%)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          type: 'spring',
          stiffness: 90,
          damping: 14,
          mass: 0.8
        }}
        className="relative z-10 w-full max-w-md text-center flex flex-col items-center gap-6"
      >
        {/* Phase completed icon */}
        <motion.div
          initial={{ scale: 0, rotate: -35 }}
          animate={{ scale: 1.1, rotate: 5 }}
          whileHover={{ scale: 1.25, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 180, damping: 10, delay: 0.1 }}
          className="text-8xl cursor-default select-none"
        >
          {currentInfo.icon}
        </motion.div>

        {/* Text */}
        <div>
          <p className="text-slate-400 text-sm font-semibold uppercase tracking-widest mb-2">
            ¡Fase superada!
          </p>
          <h2 className="text-3xl font-black text-white mb-1">{currentInfo.label}</h2>
          <p className="text-green-400 font-semibold">completada con éxito ✅</p>
        </div>

        {/* Next phase card */}
        {nextInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              type: 'spring',
              stiffness: 100,
              damping: 15,
              delay: 0.25
            }}
            className={`w-full rounded-2xl border-2 p-6 ${nextInfo.bgColor} ${nextInfo.borderColor}`}
          >
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">
              Siguiente fase
            </p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-5xl">{nextInfo.icon}</span>
              <div className="text-left">
                <p className={`text-2xl font-black ${nextInfo.color}`}>{nextInfo.label}</p>
                <p className="text-slate-400 text-sm">
                  {nextInfo.questionCount} pregunta{nextInfo.questionCount !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Continue button */}
        <button
          onClick={handleContinue}
          aria-label="Continuar al siguiente partido"
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-lg cursor-pointer
            bg-gradient-to-r from-yellow-500 to-yellow-400 text-slate-900
            hover:from-yellow-400 hover:to-yellow-300 transition-all
            focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300"
        >
          Continuar al Siguiente Partido
          <ArrowRight size={20} />
        </button>
      </motion.div>
    </div>
  );
}
