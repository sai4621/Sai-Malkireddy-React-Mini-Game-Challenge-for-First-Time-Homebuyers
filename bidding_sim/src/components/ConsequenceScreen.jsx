import { motion } from 'framer-motion'
import { AlertTriangle, ArrowRight } from 'lucide-react'
import useGameStore from '../store/gameStore'

const fmt = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

export default function ConsequenceScreen() {
  const currentRound   = useGameStore((s) => s.currentRound)
  const storeRounds    = useGameStore((s) => s.rounds)
  const advanceRound   = useGameStore((s) => s.advanceRound)
  const setPhase       = useGameStore((s) => s.setPhase)

  const lastRound  = storeRounds.find((r) => r.round === currentRound)
  const text       = lastRound?.consequenceText ?? ''
  const cost       = lastRound?.hiddenCosts ?? 0
  const isLastRound = currentRound >= 6

  const contingencyType =
    text.includes('inspection') ? 'inspection contingency' :
    text.includes('appraisal')  ? 'appraisal contingency' :
                                   'these contingencies'

  function handleContinue() {
    advanceRound()
    setPhase(isLastRound ? 'end' : 'house-intro')
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-6 py-20">
      <div className="w-full max-w-lg space-y-6">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="text-center"
        >
          <p className="text-xs font-semibold tracking-[0.18em] uppercase text-slate-400 mb-2">
            3 Months Later...
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">The Bill Arrives</h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.36, ease: 'easeOut' }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-7"
        >
          <div className="flex items-start gap-4 mb-5">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-base font-semibold text-slate-900 leading-snug">Unexpected Costs</p>
              <p className="text-xs text-slate-500 mt-0.5">Post-closing surprise</p>
            </div>
          </div>

          <p className="font-serif italic text-[15px] leading-[1.85] text-slate-600 mb-6">
            {text}
          </p>

          <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 flex items-center justify-between">
            <p className="text-sm font-semibold text-red-800">Total unexpected costs</p>
            <p className="text-xl font-bold text-red-700">{fmt(cost)}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.36, duration: 0.36, ease: 'easeOut' }}
          className="bg-amber-50 border border-amber-200 rounded-xl px-6 py-4"
        >
          <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-amber-600 mb-1.5">
            Why this happened
          </p>
          <p className="text-sm font-semibold text-amber-900 leading-relaxed">
            This is why the {contingencyType} exists — it's not just paperwork. It's your financial protection.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.54, duration: 0.3 }}
          className="flex justify-center pt-2"
        >
          <button
            type="button"
            onClick={handleContinue}
            className="inline-flex items-center gap-3 bg-slate-900 text-white px-10 py-4 rounded-xl text-sm font-semibold uppercase tracking-wide hover:bg-slate-800 active:scale-[0.98] transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-700 focus-visible:ring-offset-2"
          >
            {isLastRound ? 'See Final Score' : 'Next Round'}
            <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </motion.div>

      </div>
    </div>
  )
}
