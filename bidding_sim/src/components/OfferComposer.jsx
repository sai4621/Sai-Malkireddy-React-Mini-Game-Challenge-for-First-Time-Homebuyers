import { useState, useEffect, useRef } from 'react'
import { Clock, AlertTriangle, Info } from 'lucide-react'
import useGameStore from '../store/gameStore'
import houses from '../data/houses'
import rounds from '../data/rounds'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

// Inline style that fills the range track up to the thumb position
const trackFill = (value, min, max) => ({
  background: `linear-gradient(to right,#0f172a ${((value - min) / (max - min)) * 100}%,#e2e8f0 ${((value - min) / (max - min)) * 100}%)`,
})

// ─── Sub-components ───────────────────────────────────────────────────────────

function RangeSlider({ min, max, step = 1, value, onChange }) {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      style={trackFill(value, min, max)}
      className="
        w-full h-2 rounded-full cursor-pointer appearance-none
        [&::-webkit-slider-thumb]:appearance-none
        [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
        [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-slate-900
        [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow
        [&::-webkit-slider-thumb]:transition-transform
        [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:active:scale-125
        [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5
        [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-slate-900 [&::-moz-range-thumb]:cursor-pointer
      "
    />
  )
}

// Connected pill-style toggle group
function PillGroup({ options, value, onChange, disabled = false }) {
  return (
    <div
      className={`inline-flex rounded-xl border border-slate-200 overflow-hidden ${disabled ? 'opacity-40 pointer-events-none' : ''}`}
    >
      {options.map((opt, i) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={[
            'px-4 py-2 text-sm font-medium transition-colors',
            i > 0 ? 'border-l border-slate-200' : '',
            value === opt.value
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-50 cursor-pointer',
          ].join(' ')}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

// Single lever row — label + optional contextual hint + control slot
function LeverRow({ label, hint, children }) {
  return (
    <div className="py-5 border-b border-slate-100 last:border-0">
      <div className="flex items-baseline justify-between mb-3">
        <p className="text-sm font-semibold text-slate-800">{label}</p>
        {hint && <p className="text-xs font-medium text-slate-400 ml-4 text-right">{hint}</p>}
      </div>
      {children}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function OfferComposer() {
  const currentRound     = useGameStore((s) => s.currentRound)
  const financingPosture = useGameStore((s) => s.financingPosture)
  const backupMode       = useGameStore((s) => s.backupMode)
  const updateOffer      = useGameStore((s) => s.updateOffer)
  const submitOffer      = useGameStore((s) => s.submitOffer)
  const setBackupMode    = useGameStore((s) => s.setBackupMode)
  const setPhase         = useGameStore((s) => s.setPhase)

  const round    = rounds[currentRound]
  const house    = houses.find((h) => h.id === round.houseId)
  const minClose = financingPosture === 'cash' ? 7 : 14

  // ── Offer levers (local state; pushed to store only on submit) ─────────────
  const [offerPrice,    setOfferPrice]    = useState(house.askingPrice)
  const [earnestPct,    setEarnestPct]    = useState(2)
  const [inspection,    setInspection]    = useState('standard')   // standard | 3day | waived
  const [appraisal,     setAppraisal]     = useState('standard')   // standard | gap  | waived
  const [financing,     setFinancing]     = useState('standard')   // standard | waived
  const [closingDays,   setClosingDays]   = useState(30)
  const [escalationOn,  setEscalationOn]  = useState(false)
  const [escalationCap, setEscalationCap] = useState(
    Math.round(house.askingPrice * 1.10 / 1000) * 1000,
  )
  const [submitted, setSubmitted] = useState(false)
  const [timerLeft, setTimerLeft] = useState(round.timerSeconds ?? null)

  // Keep escalation cap above offerPrice when price slider moves
  useEffect(() => {
    if (escalationCap < offerPrice + 2500) setEscalationCap(offerPrice + 2500)
  }, [offerPrice])

  // ── Derived values ─────────────────────────────────────────────────────────
  const earnestAmt  = Math.round(offerPrice * earnestPct / 100)
  const priceDelta  = ((offerPrice - house.askingPrice) / house.askingPrice) * 100
  const priceSign   = priceDelta >= 0 ? '+' : ''

  // ── Submit (ref keeps closure fresh for timer callback) ───────────────────
  const submitRef = useRef(null)

  function handleSubmit(isAutoSubmit = false) {
    if (submitted) return
    setSubmitted(true)

    const contingencies = []
    if (inspection !== 'waived') contingencies.push(inspection === '3day' ? 'inspection-3day' : 'inspection')
    if (appraisal  !== 'waived') contingencies.push(appraisal  === 'gap'  ? 'appraisal-gap'  : 'appraisal')
    if (financing  !== 'waived') contingencies.push('financing')

    const offer = {
      price:            offerPrice,
      earnestMoney:     earnestAmt,
      contingencies,
      closingDays,
      escalationClause: escalationOn ? { cap: escalationCap, increment: 2500 } : null,
      personalLetter:   false,
      financingType:    financingPosture === 'cash' ? 'cash' : 'conventional',
      timedOut:         isAutoSubmit,
    }

    updateOffer(offer)

    if (backupMode) {
      submitOffer({ won: true, isBackup: true, hiddenCosts: 0, consequenceText: null })
      setBackupMode(false)
      setPhase('end')
    } else {
      setPhase('reveal')
    }
  }

  // Update ref every render so the timer callback always has fresh state
  submitRef.current = handleSubmit

  // ── Countdown timer ────────────────────────────────────────────────────────
  useEffect(() => {
    if (timerLeft === null || timerLeft <= 0) return
    const id = setTimeout(() => setTimerLeft((t) => t - 1), 1000)
    return () => clearTimeout(id)
  }, [timerLeft])

  // Auto-submit when clock hits 0
  useEffect(() => {
    if (timerLeft === 0) submitRef.current(true)
  }, [timerLeft])

  // Timer color: green → amber → red
  const timerPct = round.timerSeconds ? timerLeft / round.timerSeconds : 1
  const timerColor =
    timerPct > 0.5 ? 'text-emerald-600' :
    timerPct > 0.2 ? 'text-amber-500'   : 'text-red-600'

  // ── Live offer letter ──────────────────────────────────────────────────────
  function buildLetter() {
    const dir = priceDelta >= 0
      ? `${priceDelta.toFixed(1)}% above`
      : `${Math.abs(priceDelta).toFixed(1)}% below`

    const terms = [
      inspection === 'standard' ? 'standard inspection contingency'
        : inspection === '3day' ? 'shortened 3-day inspection period'
        : 'inspection contingency waived',
      appraisal === 'standard' ? 'standard appraisal contingency'
        : appraisal === 'gap'  ? 'appraisal gap guarantee'
        : 'appraisal contingency waived',
      financing === 'waived' ? 'financing contingency waived' : 'financing contingency included',
    ]

    const paras = [
      `I am offering ${fmt(offerPrice)} — ${dir} the asking price of ${fmt(house.askingPrice)}.`,
      `My earnest money deposit is ${fmt(earnestAmt)} (${earnestPct}%), with a ${closingDays}-day closing timeline.`,
      `Terms: ${terms.join(', ')}.`,
    ]

    if (escalationOn) {
      paras.push(
        `I have included an escalation clause: I will beat any competing offer by $2,500, up to a maximum of ${fmt(escalationCap)}.`,
      )
    }
    return paras
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-stone-50">

      {/* Sticky header */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center gap-4">
          <img
            src={house.imageUrl}
            alt=""
            className="w-14 h-10 rounded-lg object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate leading-tight">
              {house.address}
            </p>
            <p className="text-xs text-slate-500">Asking {fmt(house.askingPrice)}</p>
          </div>

          {/* Financing posture badge */}
          <span className={[
            'flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full',
            financingPosture === 'cash'        ? 'bg-emerald-100 text-emerald-800' :
            financingPosture === 'preapproved' ? 'bg-blue-100 text-blue-800'       :
                                                 'bg-slate-100 text-slate-600',
          ].join(' ')}>
            {financingPosture === 'cash'        ? 'All Cash'     :
             financingPosture === 'preapproved' ? 'Pre-Approved' : 'Pre-Qualified'}
          </span>

          {/* Timer */}
          {timerLeft !== null && (
            <div className={`flex items-center gap-1.5 font-bold tabular-nums text-base flex-shrink-0 ${timerColor}`}>
              <Clock className="w-4 h-4" strokeWidth={2.5} />
              {Math.floor(timerLeft / 60)}:{String(timerLeft % 60).padStart(2, '0')}
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ── Levers column ─────────────────────────────────────────────── */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm px-6 py-1">

            {backupMode && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 mt-5 mb-1 flex items-start gap-3">
                <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" strokeWidth={1.75} />
                <div>
                  <p className="text-sm font-semibold text-blue-900">Backup Offer Mode</p>
                  <p className="text-xs text-blue-700 mt-0.5 leading-relaxed">
                    Compose your best offer. If the primary deal falls through, this activates automatically.
                  </p>
                </div>
              </div>
            )}

            {/* a) Offer Price */}
            <LeverRow
              label="Offer Price"
              hint={`${priceSign}${priceDelta.toFixed(1)}% vs. asking`}
            >
              <RangeSlider
                min={Math.round(house.askingPrice * 0.95 / 1000) * 1000}
                max={Math.round(house.askingPrice * 1.20 / 1000) * 1000}
                step={1000}
                value={offerPrice}
                onChange={setOfferPrice}
              />
              <div className="flex justify-between items-baseline mt-2">
                <span className="text-xs text-slate-400">{fmt(house.askingPrice * 0.95)}</span>
                <span className="text-2xl font-bold text-slate-900">{fmt(offerPrice)}</span>
                <span className="text-xs text-slate-400">{fmt(house.askingPrice * 1.20)}</span>
              </div>
            </LeverRow>

            {/* b) Earnest Money */}
            <LeverRow label="Earnest Money" hint={fmt(earnestAmt)}>
              <RangeSlider min={1} max={10} step={0.5} value={earnestPct} onChange={setEarnestPct} />
              <div className="flex justify-between items-baseline mt-2">
                <span className="text-xs text-slate-400">1%</span>
                <span className="text-sm font-semibold text-slate-900">{earnestPct}% of offer</span>
                <span className="text-xs text-slate-400">10%</span>
              </div>
            </LeverRow>

            {/* c) Inspection Contingency */}
            <LeverRow label="Inspection Contingency">
              <PillGroup
                value={inspection}
                onChange={setInspection}
                options={[
                  { value: 'standard', label: 'Standard' },
                  { value: '3day',     label: '3-Day' },
                  { value: 'waived',   label: 'Waived' },
                ]}
              />
            </LeverRow>

            {/* d) Appraisal Contingency */}
            <LeverRow label="Appraisal Contingency">
              <PillGroup
                value={appraisal}
                onChange={setAppraisal}
                options={[
                  { value: 'standard', label: 'Standard' },
                  { value: 'gap',      label: 'Gap Guarantee' },
                  { value: 'waived',   label: 'Waived' },
                ]}
              />
            </LeverRow>

            {/* e) Financing Contingency — disabled for prequalified */}
            <LeverRow label="Financing Contingency">
              <div className="flex flex-wrap items-center gap-3">
                <PillGroup
                  value={financing}
                  onChange={setFinancing}
                  disabled={financingPosture === 'prequalified'}
                  options={[
                    { value: 'standard', label: 'Standard' },
                    { value: 'waived',   label: 'Waived' },
                  ]}
                />
                {financingPosture === 'prequalified' && (
                  <span className="flex items-center gap-1.5 text-xs text-amber-600 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2} />
                    Requires pre-approval or cash
                  </span>
                )}
              </div>
            </LeverRow>

            {/* f) Closing Timeline */}
            <LeverRow
              label="Closing Timeline"
              hint={
                closingDays <= 21 ? 'Fast close'
                  : closingDays <= 35 ? 'Standard'
                  : 'Extended'
              }
            >
              <RangeSlider
                min={minClose}
                max={60}
                step={1}
                value={closingDays}
                onChange={setClosingDays}
              />
              <div className="flex justify-between items-baseline mt-2">
                <span className="text-xs text-slate-400">{minClose} days</span>
                <span className="text-sm font-semibold text-slate-900">{closingDays} days</span>
                <span className="text-xs text-slate-400">60 days</span>
              </div>
            </LeverRow>

            {/* g) Escalation Clause */}
            <LeverRow label="Escalation Clause">
              <PillGroup
                value={escalationOn ? 'on' : 'off'}
                onChange={(v) => setEscalationOn(v === 'on')}
                options={[
                  { value: 'off', label: 'None' },
                  { value: 'on',  label: 'Include' },
                ]}
              />
              {escalationOn && (
                <div className="mt-5">
                  <p className="text-xs text-slate-500 mb-2">
                    Beat any competing offer by $2,500 — up to a cap of:
                  </p>
                  <RangeSlider
                    min={offerPrice + 2500}
                    max={Math.round(house.askingPrice * 1.20 / 1000) * 1000}
                    step={1000}
                    value={Math.max(escalationCap, offerPrice + 2500)}
                    onChange={setEscalationCap}
                  />
                  <div className="flex justify-between items-baseline mt-2">
                    <span className="text-xs text-slate-400">{fmt(offerPrice + 2500)}</span>
                    <span className="text-sm font-semibold text-slate-900">Cap: {fmt(escalationCap)}</span>
                    <span className="text-xs text-slate-400">{fmt(house.askingPrice * 1.20)}</span>
                  </div>
                </div>
              )}
            </LeverRow>

          </div>

          {/* ── Live summary column ──────────────────────────────────────── */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">

            {/* Offer letter */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-slate-400 mb-4">
                Your Offer
              </p>
              <p className="text-4xl font-bold tracking-tight text-slate-900 leading-none">
                {fmt(offerPrice)}
              </p>
              <p className={`text-sm font-semibold mt-1.5 mb-5 ${priceDelta >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {priceSign}{priceDelta.toFixed(1)}% asking price
              </p>
              <div className="space-y-3 text-[13.5px] leading-relaxed text-slate-600 border-t border-slate-100 pt-5">
                {buildLetter().map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>

            {/* Quick-glance stats */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Earnest',    value: fmt(earnestAmt),          sub: `${earnestPct}% of offer` },
                { label: 'Close',      value: `${closingDays} days`,     sub: closingDays <= 21 ? 'Fast' : closingDays <= 35 ? 'Standard' : 'Extended' },
                {
                  label: 'Inspection',
                  value: inspection === 'standard' ? 'Standard' : inspection === '3day' ? '3-Day' : 'Waived',
                  sub:   inspection === 'waived' ? 'Risk accepted' : inspection === '3day' ? 'Shortened period' : '',
                },
                {
                  label: 'Escalation',
                  value: escalationOn ? `Cap ${fmt(escalationCap)}` : 'None',
                  sub:   escalationOn ? '+$2,500 increments' : '',
                },
              ].map(({ label, value, sub }) => (
                <div key={label} className="bg-slate-50 rounded-xl border border-slate-100 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">{label}</p>
                  <p className="text-sm font-semibold text-slate-900 leading-tight">{value}</p>
                  {sub && <p className="text-[11px] text-slate-500 mt-0.5">{sub}</p>}
                </div>
              ))}
            </div>

            {/* Submit */}
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={submitted}
              className={[
                'w-full py-4 rounded-xl text-sm font-semibold uppercase tracking-wide transition-all',
                submitted
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.98] cursor-pointer',
              ].join(' ')}
            >
              {submitted
                ? 'Offer Submitted'
                : backupMode
                ? 'Submit Backup Offer'
                : 'Submit Offer'}
            </button>

          </div>
        </div>
      </div>
    </div>
  )
}
