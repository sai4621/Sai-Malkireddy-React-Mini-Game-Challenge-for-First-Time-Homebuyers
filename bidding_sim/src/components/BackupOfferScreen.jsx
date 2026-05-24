import { motion } from 'framer-motion'
import { ArrowRight, Info } from 'lucide-react'
import useGameStore from '../store/gameStore'

export default function BackupOfferScreen() {
  const setBackupMode = useGameStore((s) => s.setBackupMode)
  const setPhase      = useGameStore((s) => s.setPhase)

  function handleCompose() {
    setBackupMode(true)
    setPhase('compose')
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
            Round 6: You Didn't Win
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
            But the Door Isn't Closed
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto">
            The winning offer fell through. The seller's agent just called your agent.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.36, ease: 'easeOut' }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-7 space-y-5"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Info className="w-5 h-5 text-blue-600" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-base font-semibold text-slate-900 mb-1">What's a Backup Offer?</p>
              <p className="text-sm text-slate-600 leading-relaxed">
                A backup offer is a legally binding contract that activates automatically if the primary deal falls through (due to a failed inspection, financing issue, or cold feet).
              </p>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-3">
            <p className="text-sm font-semibold text-slate-800">Why submit one?</p>
            <ul className="space-y-2.5">
              {[
                'You get the home if the first buyer walks. No re-listing, no new bidding war.',
                'Sellers often accept backup offers at a slight discount to guarantee a safety net.',
                'Your position is stronger now: the seller is motivated, and you\'re already in the room.',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-slate-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0 mt-[7px]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          className="flex flex-col items-center gap-3"
        >
          <button
            type="button"
            onClick={handleCompose}
            className="w-full bg-slate-900 text-white py-4 rounded-xl text-sm font-semibold uppercase tracking-wide hover:bg-slate-800 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-700 focus-visible:ring-offset-2"
          >
            Compose Backup Offer
            <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
          </button>
          <button
            type="button"
            onClick={() => setPhase('end')}
            className="text-sm text-slate-400 hover:text-slate-600 transition-colors cursor-pointer py-2 focus:outline-none focus-visible:underline focus-visible:text-slate-600"
          >
            Skip to final score
          </button>
        </motion.div>

      </div>
    </div>
  )
}
