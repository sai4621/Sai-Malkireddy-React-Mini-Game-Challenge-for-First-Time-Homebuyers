import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { User, BookOpen, ArrowRight } from 'lucide-react'
import useGameStore from '../store/gameStore'
import houses from '../data/houses'
import sellers from '../data/sellers'
import competitorData from '../data/competitors'
import rounds from '../data/rounds'
import { determineWinner, evaluateConsequences } from '../utils/scoring'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 0,
  }).format(n)

// Ordered columns rendered for every row
const COLS = ['Buyer', 'Price', 'Earnest', 'Inspection', 'Appraisal', 'Financing', 'Close']

// Grid splits the buyer column wider; the rest share remaining space evenly
const GRID = '2fr 1.15fr 1fr 0.85fr 0.85fr 0.85fr 0.7fr'

function contingencyLabel(contingencies, standard, alt, altLabel) {
  if (contingencies.includes(alt)) return altLabel
  if (contingencies.includes(standard)) return 'Standard'
  return 'Waived'
}

// Seller archetype → avatar colour. Full class strings so Tailwind can scan them.
const SELLER_AVATAR = {
  relocator:      'bg-blue-100 text-blue-600',
  sentimentalist: 'bg-rose-100 text-rose-600',
  estate:         'bg-slate-200 text-slate-600',
  patient:        'bg-amber-100 text-amber-700',
  flipperFoe:     'bg-purple-100 text-purple-600',
  distressed:     'bg-red-100 text-red-600',
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function HeaderRow() {
  return (
    <div
      className="grid gap-x-4 px-6 py-3 bg-slate-50 border-b border-slate-200"
      style={{ gridTemplateColumns: GRID }}
    >
      {COLS.map((c) => (
        <p key={c} className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          {c}
        </p>
      ))}
    </div>
  )
}

function OfferRow({ row, score, isWinner, delay }) {
  const { offer } = row
  const inspection = contingencyLabel(offer.contingencies, 'inspection', 'inspection-3day', '3-Day')
  const appraisal  = contingencyLabel(offer.contingencies, 'appraisal',  'appraisal-gap',   'Gap')
  const financing  = offer.contingencies.includes('financing') ? 'Standard' : 'Waived'

  const rowBg =
    isWinner          ? 'bg-emerald-50/40 border-l-emerald-500' :
    row.isPlayer      ? 'bg-blue-50/30 border-l-blue-300'       :
                        'bg-white border-l-transparent'

  const scoreBarColor =
    isWinner     ? 'bg-emerald-500' :
    row.isPlayer ? 'bg-blue-400'    : 'bg-slate-300'

  function CellText({ children, muted }) {
    return (
      <p className={`text-sm leading-snug ${muted ? 'text-slate-400' : 'text-slate-800'}`}>
        {children}
      </p>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.28, ease: 'easeOut' }}
      className={`grid gap-x-4 px-6 py-4 border-b border-slate-100 last:border-0 border-l-4 items-center ${rowBg}`}
      style={{ gridTemplateColumns: GRID }}
    >
      {/* Buyer + score bar */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          {row.isPlayer ? (
            <span className="text-sm font-bold text-blue-700">YOU</span>
          ) : (
            <span className="text-sm font-semibold text-slate-800 leading-tight">{row.name}</span>
          )}
          {isWinner && (
            <span className="flex-shrink-0 text-[9px] font-bold tracking-[0.12em] uppercase bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">
              WINNER
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-16 h-1 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${scoreBarColor}`}
              style={{ width: `${score}%` }}
            />
          </div>
          <span className="text-[11px] font-mono tabular-nums text-slate-400">{score}</span>
        </div>
      </div>

      <CellText>{fmt(offer.price)}</CellText>
      <CellText>{fmt(offer.earnestMoney)}</CellText>
      <CellText muted={inspection === 'Waived'}>{inspection}</CellText>
      <CellText muted={appraisal  === 'Waived'}>{appraisal}</CellText>
      <CellText muted={financing  === 'Waived'}>{financing}</CellText>
      <CellText>{offer.closingDays}d</CellText>
    </motion.div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function RevealScreen() {
  const currentRound     = useGameStore((s) => s.currentRound)
  const financingPosture = useGameStore((s) => s.financingPosture)
  const currentOffer     = useGameStore((s) => s.currentOffer)
  const advanceRound     = useGameStore((s) => s.advanceRound)
  const setPhase         = useGameStore((s) => s.setPhase)

  const round  = rounds[currentRound]
  const house  = houses.find((h) => h.id === round.houseId)
  const seller = sellers.find((s) => s.archetype === round.sellerArchetype)

  const [result, setResult]                 = useState(null)
  const [competitorOffers, setCompOffers]   = useState([])
  const [consequences, setConsequences]     = useState({ hiddenCosts: 0, consequenceText: null })

  useEffect(() => {
    // Generate competitor offers fresh for this round
    const entries = round.competitors.map((archetype) => {
      const c = competitorData.find((x) => x.archetype === archetype)
      return { archetype, name: c.name, offer: c.generateOffer(house) }
    })
    setCompOffers(entries)

    const r = determineWinner(currentOffer, entries, seller, house, financingPosture)
    setResult(r)

    if (r.winnerId === 'player') {
      setConsequences(evaluateConsequences(currentOffer, house))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!result) return null

  const playerWon       = result.winnerId === 'player'
  const hasConsequences = playerWon && consequences.hiddenCosts > 0
  const isLastRound     = currentRound >= 6

  const winnerName = playerWon
    ? 'You'
    : (competitorData.find((c) => c.archetype === result.winnerId)?.name ?? result.winnerId)

  // Table rows: player first, then competitors in round order
  const rows = [
    { id: 'player', name: 'YOU', offer: currentOffer, isPlayer: true },
    ...competitorOffers.map((c) => ({
      id: c.archetype, name: c.name, offer: c.offer, isPlayer: false,
    })),
  ]

  const rowCount = rows.length

  // Delays: table rows staggered 150ms each, then story cards afterward
  const tableEndDelay   = (rowCount - 1) * 0.15 + 0.28   // when last row finishes
  const reasoningDelay  = tableEndDelay + 0.08
  const lessonDelay     = reasoningDelay + 0.18
  const buttonDelay     = lessonDelay + 0.18

  function handleContinue() {
    if (hasConsequences) {
      setPhase('consequence')
    } else {
      advanceRound()
      setPhase(isLastRound ? 'end' : 'house-intro')
    }
  }

  const avatarClass = SELLER_AVATAR[seller.archetype] ?? 'bg-slate-200 text-slate-600'

  return (
    <div className="min-h-screen bg-stone-50 py-14 px-6">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* ── Heading ─────────────────────────────────────────────────── */}
        <div className="text-center">
          <p className="text-xs font-semibold tracking-[0.18em] uppercase text-slate-400 mb-2">
            Round {currentRound} · {house.address.split(',')[0]}
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">The Offers</h1>
        </div>

        {/* ── Offers table ────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <HeaderRow />
          {rows.map((row, i) => {
            const scoreEntry = result.allScores.find((s) => s.id === row.id)
            return (
              <OfferRow
                key={row.id}
                row={row}
                score={scoreEntry?.score ?? 0}
                isWinner={result.winnerId === row.id}
                delay={i * 0.15}
              />
            )
          })}
        </div>

        {/* ── Seller's reasoning ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reasoningDelay, duration: 0.32, ease: 'easeOut' }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-7"
        >
          <div className="flex items-start gap-5">
            <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${avatarClass}`}>
              <User className="w-5 h-5" strokeWidth={1.75} />
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-slate-400 mb-0.5">
                The seller chose
              </p>
              <p className="text-base font-bold text-slate-900 mb-4">
                {winnerName}
                <span className="font-normal text-slate-500 ml-2 text-sm">— {seller.displayName}</span>
              </p>
              <blockquote className="font-serif italic text-[15px] leading-[1.85] text-slate-600 border-l-2 border-slate-200 pl-5">
                {seller.reasoning}
              </blockquote>
            </div>
          </div>
        </motion.div>

        {/* ── Lesson card ──────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: lessonDelay, duration: 0.32, ease: 'easeOut' }}
          className="bg-blue-50 border border-blue-200 rounded-2xl px-7 py-6 flex items-start gap-4"
        >
          <BookOpen className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" strokeWidth={1.75} />
          <div>
            <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-blue-500 mb-1.5">
              What this taught you
            </p>
            <p className="text-[15px] font-semibold text-blue-900 leading-relaxed">
              {seller.lesson}
            </p>
          </div>
        </motion.div>

        {/* ── Continue ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: buttonDelay, duration: 0.3 }}
          className="flex justify-center pt-2"
        >
          <button
            type="button"
            onClick={handleContinue}
            className="inline-flex items-center gap-3 bg-slate-900 text-white px-10 py-4 rounded-xl text-sm font-semibold uppercase tracking-wide hover:bg-slate-800 active:scale-[0.98] transition-all cursor-pointer"
          >
            {hasConsequences ? 'Continue' : isLastRound ? 'See Final Score' : 'Next Round'}
            <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </motion.div>

      </div>
    </div>
  )
}
