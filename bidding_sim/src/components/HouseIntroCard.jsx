import { BedDouble, Bath, Ruler, CalendarDays, Flame, Clock } from 'lucide-react'
import useGameStore from '../store/gameStore'
import houses from '../data/houses'
import rounds from '../data/rounds'

const fmt = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

const TACTIC_INFO = {
  'closing-speed':      { label: 'Closing Speed',       tip: 'How fast you can hand over the keys matters here.' },
  'financing-strength': { label: 'Financing Strength',  tip: 'Your lender relationship is part of your offer.' },
  'contingency-waiver': { label: 'Contingency Waiver',  tip: 'Every contingency is a door you leave open to exit.' },
  'escalation-clause':  { label: 'Escalation Clause',   tip: 'Signal serious intent without blindly overpaying.' },
  'earnest-money':      { label: 'Earnest Money',        tip: 'Skin in the game tells a seller you won\'t walk.' },
  'full-tactics':       { label: 'All Tactics',          tip: 'Apply everything — the seller is watching closely.' },
}

function StatCard({ Icon, value, label }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3 flex flex-col items-center gap-1">
      <Icon className="w-4 h-4 text-slate-400" strokeWidth={1.5} />
      <p className="text-base font-bold text-slate-900 leading-none">{value}</p>
      <p className="text-[11px] text-slate-500 uppercase tracking-wide">{label}</p>
    </div>
  )
}

export default function HouseIntroCard() {
  const currentRound = useGameStore((s) => s.currentRound)
  const setPhase     = useGameStore((s) => s.setPhase)

  const round = rounds[currentRound]
  const house = houses.find((h) => h.id === round.houseId)

  const competitorCount = round.competitors.length
  const marketLabel =
    competitorCount >= 3
      ? `Hot market — ${competitorCount} competing offers expected`
      : `Competitive market — ${competitorCount} other offers expected`

  const tactic = TACTIC_INFO[round.focusTactic] ?? { label: round.focusTactic, tip: '' }

  const domUrgency =
    house.daysOnMarket <= 7 ? 'bg-red-50 text-red-700 border-red-200' :
    house.daysOnMarket <= 21 ? 'bg-amber-50 text-amber-700 border-amber-200' :
    'bg-slate-50 text-slate-600 border-slate-200'

  return (
    <div className="min-h-screen bg-stone-50 pb-20">

      {/* Hero image */}
      <div className="w-full h-72 sm:h-80 overflow-hidden relative">
        <img
          src={house.imageUrl}
          alt={house.address}
          className="w-full h-full object-cover"
        />
        {/* Gradient fade for card overlap */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-50/60 to-transparent" />
      </div>

      <div className="max-w-3xl mx-auto px-6 -mt-8 relative">

        {/* Price + DOM row */}
        <div className="flex items-end gap-4 mb-6">
          <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-md px-6 py-4">
            <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-slate-400 mb-1">
              Asking Price
            </p>
            <p className="text-4xl font-bold tracking-tight text-slate-900">{fmt(house.askingPrice)}</p>
            <p className="text-sm text-slate-500 mt-1 leading-snug">{house.address}</p>
          </div>
          <div className={`border rounded-xl px-4 py-3 text-center flex-shrink-0 ${domUrgency}`}>
            <p className="text-2xl font-bold leading-none">{house.daysOnMarket}</p>
            <p className="text-xs font-medium mt-1 leading-tight">days<br />on market</p>
          </div>
        </div>

        {/* Property stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <StatCard Icon={BedDouble}    value={house.beds}                    label="Beds"  />
          <StatCard Icon={Bath}         value={house.baths}                   label="Baths" />
          <StatCard Icon={Ruler}        value={house.sqft.toLocaleString()}   label="Sq ft" />
          <StatCard Icon={CalendarDays} value={house.yearBuilt}               label="Built" />
        </div>

        {/* Listing description — styled like a real MLS listing */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-7 py-6 mb-6">
          <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-slate-400 mb-3">
            Listing Description
          </p>
          <p className="font-serif text-[15px] italic leading-[1.85] text-slate-700">
            {house.listingDescription}
          </p>
        </div>

        {/* Market context + tactic spotlight */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <Flame className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" strokeWidth={1.75} />
            <div>
              <p className="text-sm font-semibold text-red-800 leading-tight">{marketLabel}</p>
              <p className="text-xs text-red-600 mt-1">
                {round.timerSeconds
                  ? `You have ${round.timerSeconds} seconds to compose your offer.`
                  : 'No time pressure this round.'}
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
            <Clock className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" strokeWidth={1.75} />
            <div>
              <p className="text-[10px] font-semibold tracking-wider uppercase text-blue-500 mb-0.5">
                Round {currentRound} focus
              </p>
              <p className="text-sm font-semibold text-blue-900 leading-tight">{tactic.label}</p>
              <p className="text-xs text-blue-700 mt-1 leading-relaxed">{tactic.tip}</p>
            </div>
          </div>
        </div>

        {/* Briefing */}
        <div className="bg-slate-900 rounded-2xl px-7 py-5 mb-8">
          <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-slate-400 mb-2">
            Your Agent's Briefing
          </p>
          <p className="text-[14px] text-slate-200 leading-relaxed">{round.briefing}</p>
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={() => setPhase('compose')}
          className="w-full bg-slate-900 text-white py-4 rounded-xl text-sm font-semibold uppercase tracking-wide hover:bg-slate-800 active:scale-[0.98] transition-all cursor-pointer"
        >
          Make an Offer
        </button>

      </div>
    </div>
  )
}
