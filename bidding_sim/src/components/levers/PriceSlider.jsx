import { fmt, RangeSlider } from './shared'

export default function PriceSlider({ value, onChange, askingPrice }) {
  return (
    <>
      <RangeSlider
        label="Offer price"
        min={Math.round(askingPrice * 0.95 / 1000) * 1000}
        max={Math.round(askingPrice * 1.20 / 1000) * 1000}
        step={1000}
        value={value}
        onChange={onChange}
      />
      <div className="flex justify-between items-baseline mt-2">
        <span className="text-xs text-slate-400">{fmt(askingPrice * 0.95)}</span>
        <span className="text-2xl font-bold text-slate-900">{fmt(value)}</span>
        <span className="text-xs text-slate-400">{fmt(askingPrice * 1.20)}</span>
      </div>
    </>
  )
}
