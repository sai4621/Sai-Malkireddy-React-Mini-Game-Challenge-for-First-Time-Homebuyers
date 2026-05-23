import { RangeSlider } from './shared'

export default function ClosingDaysSlider({ value, onChange, minClose = 14 }) {
  return (
    <>
      <RangeSlider
        label="Closing timeline in days"
        min={minClose}
        max={60}
        step={1}
        value={value}
        onChange={onChange}
      />
      <div className="flex justify-between items-baseline mt-2">
        <span className="text-xs text-slate-400">{minClose}d</span>
        <span className="text-sm font-semibold text-slate-900">{value} days</span>
        <span className="text-xs text-slate-400">60d</span>
      </div>
    </>
  )
}
