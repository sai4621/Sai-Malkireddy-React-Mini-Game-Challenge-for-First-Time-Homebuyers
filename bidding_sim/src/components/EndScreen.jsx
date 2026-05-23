import { CheckCircle2, AlertCircle, XCircle, RotateCcw } from 'lucide-react'
import useGameStore from '../store/gameStore'

const fmt = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

// ─── Tactic evaluation ────────────────────────────────────────────────────────

function evaluateTactics(storeRounds, financingPosture) {
  const houseRounds = storeRounds.filter((r) => r.round >= 1 && r.round <= 6 && !r.isBackup)

  // Tactic 1: Pre-Approval Posture
  const t1 = financingPosture === 'prequalified' ? 'under' : 'good'

  // Tactic 2: Reading the Seller — adapted strategy in at least some rounds
  const adaptiveCount = houseRounds.filter(({ offer }) => (
    offer.escalationClause !== null ||
    offer.closingDays <= 21 ||
    offer.contingencies.length < 3 ||
    (offer.price > 0 && (offer.earnestMoney / offer.price) > 0.03)
  )).length
  const t2 =
    adaptiveCount >= 4 ? 'good'  :
    adaptiveCount >= 2 ? 'under' :
                          'bad'

  // Tactic 3: Earnest Money — average earnest %
  const avgEarnestPct = houseRounds.length === 0 ? 0 :
    houseRounds.reduce((sum, { offer }) => {
      const pct = offer.price > 0 ? (offer.earnestMoney / offer.price) * 100 : 0
      return sum + pct
    }, 0) / houseRounds.length
  const t3 =
    avgEarnestPct >= 4   ? 'good'  :
    avgEarnestPct >= 2.5 ? 'under' :
                            'bad'

  // Tactic 4: Contingency Strategy — triggered hidden costs = bad
  const triggeredCosts = storeRounds.some((r) => (r.hiddenCosts ?? 0) > 0)
  const waivedAndWon   = houseRounds.some((r) => r.offer.contingencies.length < 3 && r.won)
  const t4 =
    triggeredCosts ? 'bad'  :
    waivedAndWon   ? 'good' :
                     'under'

  // Tactic 5: Responsiveness — timed rounds are 1, 3, 5
  const timedRoundEntries = houseRounds.filter((r) => [1, 3, 5].includes(r.round))
  const timedOutCount = timedRoundEntries.filter((r) => r.offer?.timedOut).length
  const t5 =
    timedOutCount === 0 ? 'good'  :
    timedOutCount === 1 ? 'under' :
                          'bad'

  // Tactic 6: Backup Offer
  const usedBackup       = storeRounds.some((r) => r.isBackup)
  const wonRound6        = houseRounds.find((r) => r.round === 6)?.won ?? false
  const t6 = usedBackup || wonRound6 ? 'good' : 'bad'

  return [
    {
      tactic: 'Pre-Approval Posture',
      status: t1,
      good:  'You entered with the strongest financing available.',
      under: 'Pre-qualified financing limited your negotiating position.',
      bad:   'Weak financing posture hurt you in every round.',
    },
    {
      tactic: 'Reading the Seller',
      status: t2,
      good:  'You consistently adapted your offer to what the seller cared about.',
      under: 'You adapted in some rounds but left gains on the table.',
      bad:   'Generic offers rarely stand out to a motivated seller.',
    },
    {
      tactic: 'Earnest Money',
      status: t3,
      good:  `Strong average earnest deposit (${avgEarnestPct.toFixed(1)}%) signaled serious intent.`,
      under: `Moderate earnest deposits (${avgEarnestPct.toFixed(1)}%) — sellers noticed the hesitation.`,
      bad:   `Low average earnest money (${avgEarnestPct.toFixed(1)}%) raised red flags.`,
    },
    {
      tactic: 'Contingency Strategy',
      status: t4,
      good:  'You waived selectively and protected yourself when it mattered.',
      under: 'You kept all contingencies — safe, but not competitive in hot rounds.',
      bad:   'Waiving contingencies without protection cost you money after closing.',
    },
    {
      tactic: 'Responsiveness Under Pressure',
      status: t5,
      good:  'You submitted every timed offer before the clock ran out.',
      under: 'You let the clock run on one timed round — pressure is part of the game.',
      bad:   'Multiple auto-submits mean you lost control under time pressure.',
    },
    {
      tactic: 'Backup Offer Awareness',
      status: t6,
      good:  usedBackup
        ? 'You understood the backup offer option and used your leverage.'
        : 'You won round 6 outright — the backup tactic wasn\'t needed.',
      under: 'You won outright — the backup tactic wasn\'t needed.',
      bad:   'You let round 6 end without exploring a backup offer position.',
    },
  ]
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatTile({ label, value, highlight = false }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">{label}</p>
      <p className={`text-2xl font-bold ${highlight ? 'text-red-600' : 'text-slate-900'}`}>{value}</p>
    </div>
  )
}

const STATUS_ICON = {
  good:  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" strokeWidth={1.75} />,
  under: <AlertCircle  className="w-5 h-5 text-amber-400  flex-shrink-0 mt-0.5" strokeWidth={1.75} />,
  bad:   <XCircle      className="w-5 h-5 text-red-400    flex-shrink-0 mt-0.5" strokeWidth={1.75} />,
}

function TacticRow({ tactic, isLast }) {
  const body =
    tactic.status === 'good'  ? tactic.good  :
    tactic.status === 'under' ? tactic.under :
                                 tactic.bad
  return (
    <div className={`flex items-start gap-4 px-7 py-5 ${isLast ? '' : 'border-b border-slate-100'}`}>
      {STATUS_ICON[tactic.status]}
      <div>
        <p className="text-sm font-semibold text-slate-900 mb-0.5">{tactic.tactic}</p>
        <p className="text-[13px] text-slate-500 leading-relaxed">{body}</p>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function EndScreen() {
  const financingPosture = useGameStore((s) => s.financingPosture)
  const storeRounds      = useGameStore((s) => s.rounds)
  const housesWon        = useGameStore((s) => s.housesWon)
  const totalHiddenCosts = useGameStore((s) => s.totalHiddenCosts)
  const resetGame        = useGameStore((s) => s.resetGame)

  const tactics   = evaluateTactics(storeRounds, financingPosture)
  const goodCount = tactics.filter((t) => t.status === 'good').length
  const badCount  = tactics.filter((t) => t.status === 'bad').length

  const archetype =
    totalHiddenCosts > 15000       ? { name: 'The Overbidder',      desc: 'Enthusiasm is great — but every skipped contingency has a price.' }         :
    goodCount >= 5                 ? { name: 'The Strategist',       desc: 'You read the market, the seller, and the clock. That\'s rare.' }             :
    goodCount >= 3 && badCount <= 1 ? { name: 'The Calculated Risk', desc: 'Smart moves, a few blind spots. Ready for the real thing — with a good agent.' } :
                                     { name: 'The Cautious Buyer',   desc: 'You played it safe. In a hot market, safe is expensive.' }

  return (
    <div className="min-h-screen bg-stone-50 py-14 px-6">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center">
          <p className="text-xs font-semibold tracking-[0.18em] uppercase text-slate-400 mb-2">
            Game Complete
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Your Buyer Report</h1>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-4">
          <StatTile label="Houses Won"  value={`${housesWon} / 6`} />
          <StatTile label="Tactic Score" value={`${goodCount} / 6`} />
          <StatTile
            label="Hidden Costs"
            value={totalHiddenCosts > 0 ? fmt(totalHiddenCosts) : '$0'}
            highlight={totalHiddenCosts > 0}
          />
        </div>

        {/* Six-tactic checklist — the main lesson */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-7 py-5 border-b border-slate-100">
            <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-slate-400">
              Six-Tactic Checklist
            </p>
          </div>
          {tactics.map((t, i) => (
            <TacticRow key={t.tactic} tactic={t} isLast={i === tactics.length - 1} />
          ))}
        </div>

        {/* Archetype card */}
        <div className="bg-slate-900 rounded-2xl px-7 py-6">
          <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-slate-400 mb-1">
            Your Buyer Archetype
          </p>
          <p className="text-xl font-bold text-white mb-2">{archetype.name}</p>
          <p className="text-sm text-slate-300 leading-relaxed">{archetype.desc}</p>
        </div>

        {/* Play Again */}
        <div className="flex justify-center pb-6">
          <button
            type="button"
            onClick={resetGame}
            className="inline-flex items-center gap-3 bg-slate-900 text-white px-10 py-4 rounded-xl text-sm font-semibold uppercase tracking-wide hover:bg-slate-800 active:scale-[0.98] transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" strokeWidth={2.5} />
            Play Again
          </button>
        </div>

      </div>
    </div>
  )
}
