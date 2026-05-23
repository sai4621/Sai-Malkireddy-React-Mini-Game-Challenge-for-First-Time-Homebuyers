import { useState } from 'react'
import { ClipboardList, ShieldCheck, Landmark, AlertTriangle, CheckCircle2 } from 'lucide-react'
import useGameStore from '../store/gameStore'

const OPTIONS = [
  {
    value: 'prequalified',
    label: 'Pre-Qualified',
    Icon: ClipboardList,
    headline: 'A verbal estimate. Quick but soft.',
    body: 'Sellers may not take you seriously in competitive bidding.',
    badge: null,
    strength: 1,
  },
  {
    value: 'preapproved',
    label: 'Pre-Approved',
    Icon: ShieldCheck,
    headline: 'Lender verified your finances.',
    body: 'Sellers know your funds are real. Standard for serious buyers.',
    badge: 'Most common',
    strength: 2,
  },
  {
    value: 'cash',
    label: 'All Cash',
    Icon: Landmark,
    headline: 'No mortgage needed.',
    body: 'You can close in 14 days. Strongest position, but you commit your liquidity.',
    badge: 'Strongest',
    strength: 3,
  },
]

function StrengthPips({ level }) {
  return (
    <div className="flex gap-1 mt-5">
      {[1, 2, 3].map((pip) => (
        <span
          key={pip}
          className={[
            'h-1 flex-1 rounded-full transition-colors',
            pip <= level ? 'bg-blue-600' : 'bg-slate-200',
          ].join(' ')}
        />
      ))}
    </div>
  )
}

export default function PreapprovalScreen() {
  const setFinancingPosture = useGameStore((s) => s.setFinancingPosture)
  const setPhase            = useGameStore((s) => s.setPhase)
  const advanceRound        = useGameStore((s) => s.advanceRound)
  const [selected, setSelected] = useState(null)

  function handleContinue() {
    if (!selected) return
    setFinancingPosture(selected)
    advanceRound()          // currentRound 0 → 1 (first house round)
    setPhase('house-intro')
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-6 py-20">
      <div className="w-full max-w-3xl">

        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-xs font-semibold tracking-[0.18em] uppercase text-blue-700 mb-4">
            Round 0 — Financing Posture
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
            Before you start house hunting,<br className="hidden sm:block" /> how prepared are you?
          </h2>
        </div>

        {/* Option cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {OPTIONS.map(({ value, label, Icon, headline, body, badge, strength }) => {
            const isSelected = selected === value
            return (
              <button
                key={value}
                type="button"
                onClick={() => setSelected(value)}
                className={[
                  'relative text-left rounded-2xl border-2 p-6 transition-all duration-150',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500',
                  isSelected
                    ? 'border-blue-600 bg-blue-50 shadow-md'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm',
                ].join(' ')}
              >
                {/* Selected check */}
                {isSelected && (
                  <CheckCircle2
                    className="absolute top-4 right-4 w-5 h-5 text-blue-600"
                    strokeWidth={2}
                  />
                )}

                {/* Badge */}
                {badge && !isSelected && (
                  <span className="absolute top-4 right-4 text-[10px] font-semibold tracking-wider uppercase text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                    {badge}
                  </span>
                )}

                <Icon
                  className={[
                    'w-7 h-7 mb-4 transition-colors',
                    isSelected ? 'text-blue-600' : 'text-slate-400',
                  ].join(' ')}
                  strokeWidth={1.5}
                />

                <p className={[
                  'text-base font-semibold mb-1.5 transition-colors',
                  isSelected ? 'text-blue-900' : 'text-slate-900',
                ].join(' ')}>
                  {label}
                </p>

                <p className={[
                  'text-sm font-medium mb-1 transition-colors',
                  isSelected ? 'text-blue-800' : 'text-slate-700',
                ].join(' ')}>
                  {headline}
                </p>

                <p className={[
                  'text-sm leading-relaxed transition-colors',
                  isSelected ? 'text-blue-700' : 'text-slate-500',
                ].join(' ')}>
                  {body}
                </p>

                <StrengthPips level={isSelected ? strength : 0} />
              </button>
            )
          })}
        </div>

        {/* Continue */}
        <div className="flex flex-col items-center gap-4">
          <button
            type="button"
            onClick={handleContinue}
            disabled={!selected}
            className={[
              'w-full max-w-xs py-4 rounded-xl text-sm font-semibold tracking-wide uppercase transition-all duration-150',
              selected
                ? 'bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.98] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-700 focus-visible:ring-offset-2'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed',
            ].join(' ')}
          >
            Continue
          </button>

          {/* Warning */}
          <div className="flex items-start gap-2 max-w-sm">
            <AlertTriangle className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" strokeWidth={2} />
            <p className="text-xs text-slate-400 leading-relaxed">
              This choice affects every offer you make. You can't change it mid-game.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
