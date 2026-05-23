import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowLeft, AlertTriangle } from 'lucide-react'
import useGameStore from '../store/gameStore'
import tutorialSteps, { TUTORIAL_ASKING_PRICE } from '../data/tutorial'
import PriceSlider from './levers/PriceSlider'
import EarnestMoneySlider from './levers/EarnestMoneySlider'
import InspectionToggle from './levers/InspectionToggle'
import AppraisalToggle from './levers/AppraisalToggle'
import FinancingToggle from './levers/FinancingToggle'
import ClosingDaysSlider from './levers/ClosingDaysSlider'

const TOTAL_STEPS = tutorialSteps.length

// ─── Seller interest meter ────────────────────────────────────────────────────

function SellerInterestMeter({ interestLevel, reactionText }) {
  const barColor =
    interestLevel >= 4 ? 'bg-emerald-500' :
    interestLevel >= 3 ? 'bg-amber-400'   :
                         'bg-red-400'

  return (
    <div className="bg-slate-50 rounded-xl border border-slate-200 p-5">
      <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-slate-400 mb-3">
        Seller Interest
      </p>
      <div className="flex gap-1.5 mb-4" role="meter" aria-valuenow={interestLevel} aria-valuemin={1} aria-valuemax={5}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`flex-1 h-3 rounded-full transition-colors duration-200 ${i <= interestLevel ? barColor : 'bg-slate-200'}`}
          />
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.p
          key={reactionText}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="text-[13.5px] font-medium text-slate-700 italic leading-relaxed"
        >
          &ldquo;{reactionText}&rdquo;
        </motion.p>
      </AnimatePresence>
    </div>
  )
}

// ─── Lever renderer ───────────────────────────────────────────────────────────

function CurrentLever({ leverId, value, onChange }) {
  switch (leverId) {
    case 'price':
      return <PriceSlider value={value} onChange={onChange} askingPrice={TUTORIAL_ASKING_PRICE} />
    case 'earnest':
      return <EarnestMoneySlider value={value} onChange={onChange} offerPrice={TUTORIAL_ASKING_PRICE} />
    case 'inspection':
      return <InspectionToggle value={value} onChange={onChange} />
    case 'appraisal':
      return <AppraisalToggle value={value} onChange={onChange} />
    case 'financing':
      return <FinancingToggle value={value} onChange={onChange} />
    case 'closing':
      return <ClosingDaysSlider value={value} onChange={onChange} minClose={14} />
    default:
      return null
  }
}

// ─── Outro card ───────────────────────────────────────────────────────────────

function OutroCard({ onStart }) {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-6 py-20">
      <div className="w-full max-w-lg text-center space-y-6">
        <p className="text-xs font-semibold tracking-[0.18em] uppercase text-slate-400">
          Tutorial Complete
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          You&rsquo;ve met your tools.
        </h1>
        <p className="text-xl text-slate-500 leading-relaxed max-w-md mx-auto">
          Now the real test: every seller weighs these differently. Reading their motivation is the skill.
        </p>
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={onStart}
            className="inline-flex items-center gap-3 bg-slate-900 text-white px-10 py-4 rounded-xl text-sm font-semibold uppercase tracking-wide hover:bg-slate-800 active:scale-[0.98] transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-700 focus-visible:ring-offset-2"
          >
            Start the Game
            <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function TutorialScreen() {
  const tutorialStep      = useGameStore((s) => s.tutorialStep)
  const nextTutorialStep  = useGameStore((s) => s.nextTutorialStep)
  const prevTutorialStep  = useGameStore((s) => s.prevTutorialStep)
  const skipTutorial      = useGameStore((s) => s.skipTutorial)

  // Per-lever local state — defaults match each step's defaultValue
  const [price,       setPrice]       = useState(TUTORIAL_ASKING_PRICE)
  const [earnestPct,  setEarnestPct]  = useState(2)
  const [inspection,  setInspection]  = useState('standard')
  const [appraisal,   setAppraisal]   = useState('standard')
  const [financing,   setFinancing]   = useState('standard')
  const [closingDays, setClosingDays] = useState(30)

  if (tutorialStep >= TOTAL_STEPS) {
    return <OutroCard onStart={skipTutorial} />
  }

  const step = tutorialSteps[tutorialStep]

  const leverState = {
    price:      { value: price,       onChange: setPrice       },
    earnest:    { value: earnestPct,   onChange: setEarnestPct  },
    inspection: { value: inspection,   onChange: setInspection  },
    appraisal:  { value: appraisal,    onChange: setAppraisal   },
    financing:  { value: financing,    onChange: setFinancing   },
    closing:    { value: closingDays,  onChange: setClosingDays },
  }

  const { value, onChange } = leverState[step.leverId]
  const reaction = step.getSellerReaction(value)
  const isLastStep = tutorialStep === TOTAL_STEPS - 1

  return (
    <div className="min-h-screen bg-stone-50 py-8 px-4 sm:px-6">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs font-semibold text-slate-500">
            Tutorial &middot; {tutorialStep + 1} of {TOTAL_STEPS}
          </p>
          <button
            type="button"
            onClick={skipTutorial}
            className="text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-700 focus-visible:ring-offset-2 rounded"
          >
            Skip Tutorial
            <ArrowRight className="w-3 h-3" strokeWidth={2.5} />
          </button>
        </div>

        {/* Progress dots */}
        <div className="flex gap-1.5 mb-8" role="progressbar" aria-valuenow={tutorialStep + 1} aria-valuemin={1} aria-valuemax={TOTAL_STEPS}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={[
                'h-1.5 rounded-full transition-all duration-300',
                i < tutorialStep  ? 'bg-slate-400 flex-1'   :
                i === tutorialStep ? 'bg-slate-900 flex-[2]' :
                                     'bg-slate-200 flex-1',
              ].join(' ')}
            />
          ))}
        </div>

        {/* Main card — re-mounts on step change for clean animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tutorialStep}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
          >
            {/* Step title + description */}
            <div className="px-6 pt-6 pb-5 border-b border-slate-100">
              <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-slate-400 mb-1">
                Lever {tutorialStep + 1}
              </p>
              <h2 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h2>
              <p className="text-[14px] text-slate-600 leading-relaxed">{step.description}</p>
            </div>

            {/* Lever control */}
            <div className="px-6 py-6 border-b border-slate-100">
              <CurrentLever leverId={step.leverId} value={value} onChange={onChange} />
            </div>

            {/* Seller interest meter */}
            <div className="px-6 py-5 border-b border-slate-100">
              <SellerInterestMeter
                interestLevel={reaction.interestLevel}
                reactionText={reaction.reactionText}
              />
            </div>

            {/* Tradeoff callout */}
            <div className="px-6 py-5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" strokeWidth={1.75} />
                <p className="text-[13px] text-slate-600 leading-relaxed">
                  <span className="font-semibold text-slate-800">The tradeoff: </span>
                  {step.tradeoff}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Footer navigation */}
        <div className="flex items-center justify-between mt-6 pb-8">
          <button
            type="button"
            onClick={prevTutorialStep}
            disabled={tutorialStep === 0}
            className={[
              'inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-700 focus-visible:ring-offset-2',
              tutorialStep === 0
                ? 'text-slate-300 cursor-not-allowed'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer',
            ].join(' ')}
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
            Back
          </button>

          <button
            type="button"
            onClick={nextTutorialStep}
            className="inline-flex items-center gap-2 bg-slate-900 text-white px-7 py-3 rounded-xl text-sm font-semibold uppercase tracking-wide hover:bg-slate-800 active:scale-[0.98] transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-700 focus-visible:ring-offset-2"
          >
            {isLastStep ? 'Finish' : 'Next'}
            <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>

      </div>
    </div>
  )
}
