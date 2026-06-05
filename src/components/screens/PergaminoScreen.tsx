import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Printer, X } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import {
  PERGAMINO_INTRO,
  PERGAMINO_COMPROMISOS,
  PERGAMINO_CIERRE,
  PERGAMINO_LEMA,
} from '../../data/questions';

export default function PergaminoScreen() {
  const { state, dispatch } = useGameStore();
  const [signatures, setSignatures] = useState<string[]>([state.playerName || '']);
  const printRef = useRef<HTMLDivElement>(null);

  const updateSignature = (idx: number, val: string) => {
    setSignatures(s => s.map((v, i) => (i === idx ? val : v)));
  };

  const removeSignature = (idx: number) => {
    if (signatures.length > 1) {
      setSignatures(s => s.filter((_, i) => i !== idx));
    }
  };

  const handleBack = () => dispatch({ type: 'GO_TO_SCREEN', payload: 'results' });

  const handlePrint = () => {
    if (!printRef.current) return;
    const printContents = printRef.current.innerHTML;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Pergamino del Compromiso</title>
          <style>
            body { margin: 0; padding: 24px; background: #fdf4d0; color: #1c1917; font-family: Georgia, serif; }
            .pergamino-print { max-width: 900px; margin: 0 auto; }
            input { border: none; outline: none; background: transparent; font: inherit; text-align: center; width: 100%; }
            .print-hidden { display: none !important; }
          </style>
        </head>
        <body>
          <div class="pergamino-print">${printContents}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="min-h-screen px-4 py-8"
      style={{ background: 'linear-gradient(160deg, #0f172a 0%, #1a2744 100%)' }}>

      {/* Top bar (hidden on print) */}
      <div className="max-w-3xl mx-auto flex items-center mb-6 print:hidden">
        <button onClick={handleBack} aria-label="Volver a resultados"
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors cursor-pointer
            focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 rounded-lg px-2 py-1">
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Volver</span>
        </button>
      </div>

      {/* Pergamino */}
      <motion.div
        ref={printRef}
        id="pergamino-content"
        initial={{ opacity: 0, scaleY: 0.7, originY: 0 }}
        animate={{ opacity: 1, scaleY: 1, originY: 0 }}
        transition={{
          type: 'spring',
          stiffness: 70,
          damping: 15,
          mass: 1.2
        }}
        style={{
          background: 'linear-gradient(145deg, #fef3c7 0%, #fde68a 30%, #fef3c7 60%, #fde68a 100%)',
          color: '#1c1917',
          fontFamily: "'Georgia', 'Times New Roman', serif",
        }}
        className="max-w-3xl mx-auto rounded-2xl p-8 sm:p-12 shadow-2xl relative overflow-hidden"
      >
        {/* Decorative corner ornaments */}
        {['top-4 left-4', 'top-4 right-4', 'bottom-4 left-4', 'bottom-4 right-4'].map((pos, i) => (
          <div key={i} className={`absolute ${pos} text-amber-600/40 text-3xl select-none`}>
            {i < 2 ? '❧' : '❦'}
          </div>
        ))}

        {/* Double border */}
        <div className="absolute inset-3 rounded-xl border-2 border-amber-700/30 pointer-events-none" />
        <div className="absolute inset-5 rounded-lg border border-amber-700/20 pointer-events-none" />

        {/* Header */}
        <div className="text-center mb-8 relative">
          <div className="text-4xl mb-3">📜</div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-widest text-amber-900 mb-1">
            Pergamino del Compromiso
          </h1>
          <h2 className="text-base sm:text-lg font-bold uppercase tracking-wider text-amber-800 mb-2">
            de Inocuidad
          </h2>
          <div className="w-40 h-0.5 bg-amber-700/40 mx-auto mb-2" />
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-700">
            Compromiso Mundial por la Inocuidad Alimentaria
          </p>
        </div>

        {/* Intro */}
        <p className="text-base leading-relaxed text-stone-800 mb-6 text-justify indent-8">
          {PERGAMINO_INTRO}
        </p>

        {/* "Entendemos que cada acción cuenta" */}
        <p className="font-bold text-amber-900 text-base mb-4 text-center">
          Entendemos que cada acción cuenta:
        </p>

        {/* Compromisos */}
        <ul className="mb-6 space-y-2.5 pl-4">
          {PERGAMINO_COMPROMISOS.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-stone-800">
              <span className="text-green-700 font-bold flex-shrink-0 mt-0.5">✅</span>
              <span className="text-base leading-snug">{item}</span>
            </li>
          ))}
        </ul>

        {/* Cierre */}
        <div className="mb-6">
          {PERGAMINO_CIERRE.split('\n\n').map((para, i) => (
            <p key={i} className="text-base leading-relaxed text-stone-800 mb-3 text-justify indent-8">
              {para}
            </p>
          ))}
        </div>

        {/* Lema */}
        <div className="my-8 text-center border-y-2 border-amber-700/30 py-6">
          <p className="text-lg sm:text-xl font-black text-amber-900 italic leading-snug">
            {PERGAMINO_LEMA}
          </p>
        </div>

        {/* Date */}
        <div className="text-center mb-8">
          <div className="inline-block border border-amber-700/40 rounded-xl px-6 py-3">
            <p className="text-sm font-bold uppercase tracking-widest text-amber-800">
              Día Mundial de la Inocuidad Alimentaria
            </p>
            <p className="text-2xl font-black text-amber-900 mt-0.5">7 de Junio</p>
          </div>
        </div>

        {/* Firmas */}
        <div>
          <p className="text-center font-bold uppercase tracking-widest text-amber-800 text-sm mb-4 border-b border-amber-700/30 pb-2">
            Firmas del Equipo
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {signatures.map((sig, i) => (
              <div key={i} className="relative group">
                <div className="border-b-2 border-amber-700/50 pt-2 pb-1 relative">
                  <input
                    type="text"
                    value={sig}
                    onChange={e => updateSignature(i, e.target.value)}
                    placeholder={`Firma ${i + 1}`}
                    aria-label={`Firma ${i + 1}`}
                    className="w-full bg-transparent text-stone-800 text-sm font-medium placeholder-amber-700/40
                      focus:outline-none focus:placeholder-transparent text-center"
                    style={{ fontFamily: "'Georgia', serif" }}
                  />
                  {signatures.length > 1 && (
                    <button
                      onClick={() => removeSignature(i)}
                      aria-label={`Eliminar firma ${i + 1}`}
                      className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity
                        text-red-600 hover:text-red-500 cursor-pointer print:hidden"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>
            ))}


          </div>
        </div>
      </motion.div>

      {/* Print CTA bottom */}
      <div className="max-w-3xl mx-auto mt-6 flex justify-center print:hidden">
        <button onClick={handlePrint} aria-label="Imprimir"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm sm:text-base cursor-pointer
            bg-gradient-to-r from-amber-700 to-yellow-600 text-white
            hover:from-amber-600 hover:to-yellow-500 transition-all shadow-lg
            focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400">
          <Printer size={18} />
          Imprimir Pergamino (A2)
        </button>
      </div>
    </div>
  );
}
