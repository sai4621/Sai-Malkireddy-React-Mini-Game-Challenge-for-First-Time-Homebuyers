import { useState, useEffect, useRef } from 'react'
import { Clock, Info } from 'lucide-react'
import useGameStore from '../store/gameStore'
import houses from '../data/houses'
import rounds from '../data/rounds'
import { fmt, RangeSlider, PillGroup } from './levers/shared'
import PriceSlider from './levers/PriceSlider'
import EarnestMoneySlider from './levers/EarnestMoneySlider'
import InspectionToggle from './levers/InspectionToggle'
import AppraisalToggle from './levers/AppraisalToggle'
import FinancingToggle from './levers/FinancingToggle'
import ClosingDaysSlider from './levers/ClosingDaysSlider'

// ─── Sub-components ───────────────────────────────────────────────────────────

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

function EscalationCapSlider({ offerPrice, askingPrice, escalationCap, setEscalationCap, capAutoAdjusted }) {
  const capMin = offerPrice + 2500
  const capMax = Math.round(askingPrice * 1.20 / 1000) * 1000
  return (
    <div className="mt-5">
      <p className="text-xs text-slate-500 mb-2">
        Beat any competing offer by $2,500 — up to a cap of:
      </p>
      <RangeSlider
        label="Escalation clause cap"
        min={capMin}
        max={capMax}
        step={1000}
        value={Math.max(escalationCap, capMin)}
        onChange={setEscalationCap}
      />
      <div className="flex justify-between items-baseline mt-2">
        <span className="text-xs text-slate-400">{fmt(capMin)}</span>
        <span className="text-sm font-semibold text-slate-900">Cap: {fmt(escalationCap)}</span>
        <span className="text-xs text-slate-400">{fmt(capMax)}</span>
      </div>
      {capAutoAdjusted && (
        <p className="text-xs text-amber-600 mt-2" role="alert">
          Cap adjusted — must be at least $2,500 above your offer price.
        </p>
      )}
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
  const [inspection,    setInspection]    = useState('standard')
  const [appraisal,     setAppraisal]     = useState('standard')
  const [financing,     setFinancing]     = useState('standard')
  const [closingDays,   setClosingDays]   = useState(30)
  const [escalationOn,  setEscalationOn]  = useState(false)
  const [escalationCap, setEscalationCap] = useState(
    Math.round(house.askingPrice * 1.10 / 1000) * 1000,
  )
  const [capAutoAdjusted, setCapAutoAdjusted] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [timerLeft, setTimerLeft] = useState(round.timerSeconds ?? null)

  // Keep escalation cap above offerPrice when price slider moves
  useEffect(() => {
    if (escalationCap < offerPrice + 2500) {
      setEscalationCap(offerPrice + 2500)
      setCapAutoAdjusted(true)
      const t = setTimeout(() => setCapAutoAdjusted(false), 2500)
      return () => clearTimeout(t)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  useEffect(() => {
    if (timerLeft === 0) submitRef.current(true)
  }, [timerLeft])

  // Timer color and pulse: green → amber → red; pulse at ≤5s
  const timerPct = round.timerSeconds ? timerLeft / round.timerSeconds : 1
  const timerColor =
    timerPct > 0.5 ? 'text-emerald-600' :
    timerPct > 0.2 ? 'text-amber-500'   : 'text-red-600'
  const timerWarning = timerLeft !== null && timerLeft <= 5 && timerLeft > 0

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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3 sm:gap-4">
          <img
            src={house.imageUrl}
            alt=""
            className="w-12 sm:w-14 h-9 sm:h-10 rounded-lg object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate leading-tight">
              {house.address}
            </p>
            <p className="text-xs text-slate-500">Asking {fmt(house.askingPrice)}</p>
          </div>

          {/* Financing posture badge */}
          <span className={[
            'flex-shrink-0 text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-full',
            financingPosture === 'cash'        ? 'bg-emerald-100 text-emerald-800' :
            financingPosture === 'preapproved' ? 'bg-blue-100 text-blue-800'       :
                                                 'bg-slate-100 text-slate-600',
          ].join(' ')}>
            {financingPosture === 'cash'        ? 'All Cash'     :
             financingPosture === 'preapproved' ? 'Pre-Approved' : 'Pre-Qualified'}
          </span>

          {/* Timer */}
          {timerLeft !== null && (
            <div
              className={[
                'flex items-center gap-1.5 font-bold tabular-nums text-base flex-shrink-0',
                timerColor,
                timerWarning ? 'animate-pulse' : '',
              ].join(' ')}
              aria-live="assertive"
              aria-label={`Time remaining: ${Math.floor(timerLeft / 60)} minutes ${timerLeft % 60} seconds`}
            >
              <Clock className="w-4 h-4" strokeWidth={2.5} />
              {Math.floor(timerLeft / 60)}:{String(timerLeft % 60).padStart(2, '0')}
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ── Levers column ─────────────────────────────────────────────── */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm px-5 sm:px-6 py-1">

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
              <PriceSlider value={offerPrice} onChange={setOfferPrice} askingPrice={house.askingPrice} />
            </LeverRow>

            {/* b) Earnest Money */}
            <LeverRow label="Earnest Money">
              <EarnestMoneySlider value={earnestPct} onChange={setEarnestPct} offerPrice={offerPrice} />
            </LeverRow>

            {/* c) Inspection Contingency */}
            <LeverRow label="Inspection Contingency">
              <InspectionToggle value={inspection} onChange={setInspection} />
            </LeverRow>

            {/* d) Appraisal Contingency */}
            <LeverRow label="Appraisal Contingency">
              <AppraisalToggle value={appraisal} onChange={setAppraisal} />
            </LeverRow>

            {/* e) Financing Contingency */}
            <LeverRow label="Financing Contingency">
              <FinancingToggle
                value={financing}
                onChange={setFinancing}
                disabled={financingPosture === 'prequalified'}
                disabledReason="Requires pre-approval or cash to waive"
              />
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
              <ClosingDaysSlider value={closingDays} onChange={setClosingDays} minClose={minClose} />
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
                <EscalationCapSlider
                  offerPrice={offerPrice}
                  askingPrice={house.askingPrice}
                  escalationCap={escalationCap}
                  setEscalationCap={setEscalationCap}
                  capAutoAdjusted={capAutoAdjusted}
                />
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
              <div
                className="space-y-3 text-[13.5px] leading-relaxed text-slate-600 border-t border-slate-100 pt-5"
                role="region"
                aria-label="Offer summary"
                aria-live="polite"
                aria-atomic="true"
              >
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
                  <p className="text-sm font-semibold text-slate-900 leading-tight truncate">{value}</p>
                  {sub && <p className="text-[11px] text-slate-500 mt-0.5 truncate">{sub}</p>}
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
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                submitted
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed focus-visible:ring-slate-300'
                  : 'bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.98] cursor-pointer focus-visible:ring-slate-700',
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
