import { AlertTriangle } from 'lucide-react'

export const fmt = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

export const trackFill = (value, min, max) => ({
  background: `linear-gradient(to right,#0f172a ${((value - min) / (max - min)) * 100}%,#e2e8f0 ${((value - min) / (max - min)) * 100}%)`,
})

export function RangeSlider({ min, max, step = 1, value, onChange, label }) {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      style={trackFill(value, min, max)}
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      className="
        w-full h-2 rounded-full cursor-pointer appearance-none
        focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-700 focus-visible:ring-offset-2
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

export function PillGroup({ options, value, onChange, disabled = false, disabledReason }) {
  return (
    <div className="flex flex-col gap-2">
      <div
        role="group"
        className={`inline-flex rounded-xl border border-slate-200 overflow-hidden ${disabled ? 'opacity-40 pointer-events-none' : ''}`}
      >
        {options.map((opt, i) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={value === opt.value}
            className={[
              'px-4 py-2 text-sm font-medium transition-colors',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-slate-700',
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
      {disabled && disabledReason && (
        <span className="flex items-center gap-1.5 text-xs text-amber-600 font-medium" role="note">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2} />
          {disabledReason}
        </span>
      )}
    </div>
  )
}
