import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trash2, Trophy, AlertTriangle } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { useLeaderboard } from '../../hooks/useLeaderboard';
import { PHASE_INFO } from '../../types/game';

const MEDAL = ['🥇', '🥈', '🥉'];

export default function LeaderboardScreen() {
  const { dispatch } = useGameStore();
  const { getAll, clear, formatTime, getPhaseLabel } = useLeaderboard();
  const entries = getAll();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleBack = () => dispatch({ type: 'GO_TO_SCREEN', payload: 'results' });
  const handleClearClick = () => setShowConfirm(true);
  const handleConfirmClear = () => {
    clear();
    setShowConfirm(false);
    dispatch({ type: 'GO_TO_SCREEN', payload: 'results' });
  };
  const handleCancelClear = () => setShowConfirm(false);

  return (
    <div className="min-h-screen px-4 py-8"
      style={{ background: 'linear-gradient(160deg, #0f172a 0%, #1a2744 100%)' }}>

      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <button onClick={handleBack} aria-label="Volver"
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors cursor-pointer
              focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 rounded-lg px-2 py-1">
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Volver</span>
          </button>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <Trophy size={22} className="text-yellow-400" />
            Ranking Mundial
          </h1>
          <button onClick={handleClearClick} aria-label="Limpiar ranking"
            className="text-slate-600 hover:text-red-400 transition-colors cursor-pointer
              focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 rounded-lg p-1">
            <Trash2 size={16} />
          </button>
        </motion.div>

        {entries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">🏟️</div>
            <p className="text-slate-400 text-lg">El tablero está vacío.</p>
            <p className="text-slate-600 text-sm mt-1">¡Sé el primero en jugar!</p>
          </motion.div>
        ) : (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.05,
                }
              }
            }}
            className="flex flex-col gap-3"
          >
            {entries.map((entry, i) => {
              const phaseInfo = PHASE_INFO[entry.phase];
              const isTop3 = i < 3;
              const effectiveTime = entry.totalTimeMs + entry.penaltyMs;

              return (
                <motion.div
                  key={entry.id}
                  variants={{
                    hidden: { opacity: 0, y: 20, scale: 0.98 },
                    show: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: {
                        type: 'spring',
                        stiffness: 100,
                        damping: 14
                      }
                    }
                  }}
                  className={`flex items-center gap-4 rounded-xl p-4 border transition-all
                    ${i === 0 ? 'bg-yellow-900/30 border-yellow-500/50' :
                      i === 1 ? 'bg-slate-600/30 border-slate-400/50' :
                      i === 2 ? 'bg-amber-900/20 border-amber-700/50' :
                      'bg-slate-800/50 border-slate-700'
                    }`}
                >
                  {/* Rank */}
                  <div className="w-10 text-center">
                    {isTop3
                      ? <span className="text-2xl">{MEDAL[i]}</span>
                      : <span className="text-slate-500 font-bold text-lg">{i + 1}</span>
                    }
                  </div>

                  {/* Name + phase */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold truncate ${entry.eliminated ? 'text-slate-400' : 'text-white'}`}>
                      {entry.name}
                      {entry.eliminated && <span className="text-red-500 text-xs ml-1">(eliminado)</span>}
                    </p>
                    <p className={`text-sm ${phaseInfo.color}`}>
                      {phaseInfo.icon} {getPhaseLabel(entry.phase)}
                    </p>
                  </div>

                  {/* Time */}
                  <div className="text-right flex-shrink-0">
                    <p className="font-mono font-bold text-white text-base">{formatTime(effectiveTime)}</p>
                    {entry.penaltyMs > 0 && (
                      <p className="text-orange-400 text-xs">+{formatTime(entry.penaltyMs)} pen.</p>
                    )}
                    <p className="text-slate-500 text-xs">{entry.date}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Survivors note */}
        {entries.filter(e => !e.eliminated).length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 bg-green-900/20 border border-green-700/40 rounded-xl p-4 text-center"
          >
            <p className="text-green-400 font-semibold text-sm">
              🏆 {entries.filter(e => !e.eliminated).length} jugador{entries.filter(e => !e.eliminated).length !== 1 ? 'es' : ''} en pie
            </p>
            <p className="text-slate-500 text-xs mt-0.5">Sin eliminaciones durante el torneo</p>
          </motion.div>
        )}

        {/* Custom Confirmation Modal */}
        <AnimatePresence>
          {showConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleCancelClear}
                className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="relative w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-red-900/40 border border-red-500/40 flex items-center justify-center text-red-500">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">¿Borrar todo el ranking?</h3>
                  <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                    Esta acción no se puede deshacer y se perderán de manera permanente todos los records registrados.
                  </p>
                </div>
                <div className="flex gap-3 w-full mt-2">
                  <button
                    onClick={handleCancelClear}
                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-sm transition-colors cursor-pointer border border-slate-700"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirmClear}
                    className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer"
                  >
                    Confirmar
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
