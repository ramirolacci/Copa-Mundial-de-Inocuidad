import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Users } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { DEFAULT_SETTINGS } from '../../store/useGameStore';
import SoccerBall from '../ui/SoccerBall';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05
    }
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 14,
      mass: 0.8
    }
  },
};

export default function StartScreen() {
  const { dispatch } = useGameStore();
  const [name, setName] = useState('');
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleStart = () => {
    if (!name.trim()) return;
    dispatch({ type: 'START_GAME', payload: { name, settings: DEFAULT_SETTINGS } });
  }; 

  const yShift = typeof window !== 'undefined' && window.innerHeight < 750 ? -120 : -80;

  return (
    <div className="min-h-screen flex flex-col items-center justify-between relative overflow-x-hidden overflow-y-auto px-4 pt-8 pb-4"
      style={{ background: 'linear-gradient(160deg, #0f172a 0%, #1a2744 50%, #0f2016 100%)' }}>

      {/* Brand Logo in top-right corner */}
      <div className="absolute top-4 right-4 z-20 pointer-events-none">
        <img
          src={`${(import.meta as any).env.BASE_URL}Logo%20Mi%20Gusto%202025.png`}
          alt="Logo Mi Gusto"
          className="h-8 sm:h-10 w-auto object-contain brightness-115 contrast-115 drop-shadow-[0_2px_10px_rgba(251,191,36,0.3)]"
        />
      </div>

      {/* Decorative pitch lines */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="absolute inset-0 border-[40px] border-white rounded-[100px]" />
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border-2 border-white" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-lg my-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          style={{
            transform: isFocused ? `translateY(${yShift}px)` : 'translateY(0px)',
            transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          className="relative z-10 w-full flex flex-col items-center gap-6"
        >
          {/* Ball */}
          <motion.div variants={itemVariants} className="mb-2">
            <SoccerBall size={72} />
          </motion.div>

          {/* Title */}
          <motion.div variants={itemVariants} className="text-center">
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              La Copa Mundial
            </h1>
            <h1 className="text-2xl sm:text-3xl font-black leading-tight"
              style={{ background: 'linear-gradient(90deg, #fbbf24, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              de la Inocuidad
            </h1>
            <p className="mt-3 text-slate-300 text-sm sm:text-base max-w-sm mx-auto leading-relaxed">
              Cada colaborador juega para el mismo equipo: producir alimentos seguros
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="w-full flex justify-center">
            <button
              type="button"
              onClick={() => setIsRulesOpen(true)}
              className="rounded-full border border-slate-700 bg-slate-900/80 px-5 py-2.5 text-sm font-semibold text-slate-100 shadow-lg shadow-slate-950/50 hover:border-yellow-400 hover:text-yellow-300 transition"
            >
              Ver reglas del juego
            </button>
          </motion.div>

          {/* Stats strip */}
          <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3 w-full">
            {[
              { icon: '🏟️', label: '5 Fases', sub: 'Eliminatorias' },
              { icon: '❓', label: '21 Preguntas', sub: 'De Inocuidad' },
              { icon: '🏆', label: 'Gran Final', sub: 'Argumental' },
            ].map((s) => (
              <div key={s.label} className="bg-slate-800/60 border border-slate-700 rounded-xl p-3 text-center">
                <div className="text-2xl">{s.icon}</div>
                <div className="text-white font-bold text-xs mt-1">{s.label}</div>
                <div className="text-slate-400 text-xs">{s.sub}</div>
              </div>
            ))}
          </motion.div>

          {/* Form card */}
          <motion.div variants={itemVariants}
            className="w-full bg-slate-800/70 backdrop-blur border border-slate-700 rounded-2xl p-6 flex flex-col gap-4">

            {/* Name input */}
            <div>
              <label htmlFor="player-name" className="block text-slate-300 text-sm font-semibold mb-2">
                <Users size={14} className="inline mr-1.5 text-yellow-400" />
                Nombre completo
              </label>
              <input
                id="player-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                onFocus={(e) => {
                  setIsFocused(true);
                  setTimeout(() => {
                    e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }, 300);
                }}
                onBlur={() => setIsFocused(false)}
                placeholder="Ingresar nombre completo"
                maxLength={40}
                aria-label="Nombre completo del jugador"
                className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500
                  focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-all text-base"
              />
            </div>

            {/* Start button */}
            <motion.button
              onClick={handleStart}
              disabled={!name.trim()}
              whileHover={name.trim() ? { scale: 1.02 } : {}}
              whileTap={name.trim() ? { scale: 0.97 } : {}}
              aria-label="Comenzar partido"
              className={`w-auto min-w-[180px] mx-auto flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-black text-sm sm:text-base transition-all duration-300
                focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400
                ${name.trim()
                  ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg shadow-green-900/50 hover:shadow-green-900/80 cursor-pointer'
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                }`}
            >
              <Play size={22} fill="currentColor" />
              Comenzar Partido
            </motion.button>
          </motion.div>

          {/* World Food Safety Day Badge */}
          <motion.div
            variants={itemVariants}
            className="bg-slate-900/60 border border-slate-800 rounded-full px-4 py-2 text-center"
          >
            <span className="text-yellow-400 text-xs font-extrabold uppercase tracking-widest">
              7 de Junio
            </span>
            <span className="text-slate-500 text-xs mx-2.5">•</span>
            <span className="text-slate-300 text-xs font-bold tracking-wide">
              Día Mundial de la Inocuidad Alimentaria
            </span>
          </motion.div>
        </motion.div>
      </div>

      <footer className="mt-8 text-center text-xs sm:text-sm text-slate-400 font-medium tracking-wide z-10">
        © Desarrollado por el <strong className="font-bold text-slate-200">Departamento de Sistemas</strong> de <strong className="font-bold text-slate-200">Mi Gusto</strong> | Todos los derechos reservados.
      </footer>

      <AnimatePresence>
        {isRulesOpen && (
          <motion.div
            className="fixed inset-0 z-20 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              className="w-full max-w-3xl rounded-[32px] border border-slate-700/70 bg-slate-900/95 p-6 shadow-2xl shadow-slate-950/30"
              initial={{ opacity: 0, y: 28, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.96 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex flex-col gap-5">
                <div>
                  <h2 className="text-xl font-black text-white">Reglas del juego</h2>
                  <p className="mt-2 text-slate-400 text-sm">Lee con atención antes de comenzar tu recorrido por la copa.</p>
                </div>

                <div className="rounded-[32px] border border-slate-700/70 bg-slate-800/80 p-5 text-slate-200">
                  <p className="text-white font-semibold mb-4">Reglas:</p>
                  <ul className="space-y-3 list-disc list-inside text-slate-300">
                    <li>Cada pregunta tiene una única respuesta correcta.</li>
                    <li>La dificultad aumenta en cada etapa.</li>
                    <li>En caso de empate en la final, se podrá solicitar fundamentación técnica de la respuesta.</li>
                  </ul>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsRulesOpen(false)}
                    className="rounded-full bg-yellow-400 px-5 py-2.5 text-sm text-slate-950 font-semibold shadow-lg shadow-yellow-500/20 transition-colors duration-200 hover:bg-yellow-300"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
