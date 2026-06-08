import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { List, Clock } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { PHASE_INFO, phaseRank } from '../../types/game';
import { useLeaderboard } from '../../hooks/useLeaderboard';
import { useSound } from '../../hooks/useSound';
import ConfettiEffect from '../ui/ConfettiEffect';
import { getNameWithGenderEmoji } from '../../utils/nameGender';

function getStars(phase: string, eliminated: boolean): number {
  if (eliminated) return 1;
  const rank = phaseRank(phase as any);
  return Math.min(5, rank + 2);
}

export default function ResultsScreen() {
  const { state, dispatch } = useGameStore();
  const { save, formatTime } = useLeaderboard();
  const { playVictory } = useSound();

  const totalMs = state.totalElapsedMs + state.penaltyMs;
  const phaseInfo = PHASE_INFO[state.phase];
  const stars = getStars(state.phase, state.isEliminated);
  const isWinner = !state.isEliminated;
  const displayName = getNameWithGenderEmoji(state.playerName);

  useEffect(() => {
    if (state.hasSavedScore) return;

    // Save to leaderboard
    save({
      name: state.playerName,
      phase: state.phase,
      totalTimeMs: state.totalElapsedMs,
      penaltyMs: state.penaltyMs,
      eliminated: state.isEliminated,
    });
    dispatch({ type: 'MARK_SCORE_SAVED' });

    if (isWinner) playVictory();
  }, [state.hasSavedScore, state.playerName, state.phase, state.totalElapsedMs, state.penaltyMs, state.isEliminated, isWinner, save, playVictory, dispatch]);

  const handleLeaderboard = () => dispatch({ type: 'GO_TO_SCREEN', payload: 'leaderboard' });

  return (
    <div className="min-h-screen flex flex-col justify-between px-4 pt-8 pb-4 relative overflow-hidden"
      style={{ background: isWinner ? 'linear-gradient(160deg, #0a1628, #0d2a1a)' : 'linear-gradient(160deg, #0f172a, #1e293b)' }}>

      {isWinner && <ConfettiEffect count={100} />}

      <div className="flex-grow flex items-center justify-center w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            type: 'spring',
            stiffness: 90,
            damping: 14,
            mass: 0.8
          }}
          className="relative z-10 w-full max-w-lg"
        >
          {/* Header */}
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 250, damping: 18, delay: 0.2 }}
              className="text-6xl mb-3"
            >
              {isWinner ? '🏆' : '❌'}
            </motion.div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mb-1">
              {isWinner ? '¡Felicitaciones!' : 'Partido Terminado'}
            </h1>
            <p className="text-slate-200 text-base sm:text-base font-semibold">
              {isWinner
                ? `¡${displayName} completó el torneo!`
                : `${displayName} fue eliminado en ${phaseInfo.label}`}
            </p>
          </div>

          {/* Stars */}
          <div className="flex justify-center gap-1 mb-6">
            {Array.from({ length: 5 }, (_, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0, y: 10 }}
                animate={{ opacity: 1, scale: [0, 1.3, 1], y: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 120,
                  damping: 10,
                  delay: 0.35 + i * 0.08
                }}
                className={`text-3xl ${i < stars ? 'text-yellow-400' : 'text-slate-700'}`}
              >
                ★
              </motion.span>
            ))}
          </div>

          {/* Stats card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="bg-slate-800/70 border border-slate-700 rounded-2xl p-5 mb-4 grid grid-cols-2 gap-4"
          >
            <div className="bg-slate-900/60 rounded-xl p-4 text-center">
              <div className={`text-3xl mb-1 ${phaseInfo.color}`}>{phaseInfo.icon}</div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Fase alcanzada</p>
              <p className={`font-bold text-sm mt-1 ${phaseInfo.color}`}>{phaseInfo.label}</p>
            </div>
            <div className="bg-slate-900/60 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center mb-1">
                <Clock size={28} className="text-blue-400" />
              </div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Tiempo total</p>
              <p className="font-bold text-white font-mono text-base sm:text-lg mt-1">{formatTime(totalMs)}</p>
              {state.penaltyMs > 0 && (
                <p className="text-orange-400 text-xs">+{formatTime(state.penaltyMs)} penalización</p>
              )}
            </div>
            <div className="bg-slate-900/60 rounded-xl p-4 text-center">
              <div className="text-2xl mb-1">✅</div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Correctas</p>
              <p className="font-bold text-green-400 text-xl mt-1">
                {state.answers.filter(a => a.correct).length}
              </p>
            </div>
            <div className="bg-slate-900/60 rounded-xl p-4 text-center">
              <div className="text-2xl mb-1">❌</div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Incorrectas</p>
              <p className="font-bold text-red-400 text-xl mt-1">
                {state.answers.filter(a => !a.correct).length}
              </p>
            </div>
          </motion.div>

          {/* Motivational message */}
          <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl px-4 py-3 mb-5 text-center">
            <p className="text-yellow-300 text-sm font-semibold italic">
              {isWinner
                ? '"La inocuidad alimentaria empieza con cada uno de nosotros." 🌟'
                : '"Cada desvío es una oportunidad de aprender. ¡El equipo te necesita!" 💪'}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-3">
            <button onClick={handleLeaderboard}
              aria-label="Ver ranking"
              className="w-auto min-w-[180px] mx-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm sm:text-base cursor-pointer
                bg-slate-700 text-white border border-slate-600 hover:bg-slate-600 transition-colors
                focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
              <List size={18} />
              Ver Ranking 🏅
            </button>
          </div>
        </motion.div>
      </div>

      <footer className="mt-8 text-center text-xs sm:text-sm text-slate-400 font-medium tracking-wide z-10">
        © Desarrollado por el <strong className="font-bold text-slate-200">Departamento de Sistemas</strong> de <strong className="font-bold text-slate-200">Mi Gusto</strong> | Todos los derechos reservados.
      </footer>
    </div>
  );
}
