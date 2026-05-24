import { fmt, RangeSlider } from './shared'

export default function EarnestMoneySlider({ value, onChange, offerPrice }) {
  const earnestAmt = Math.round(offerPrice * value / 100)
  return (
    <>
      <RangeSlider
        label="Earnest money percentage"
        min={1}
        max={10}
        step={0.5}
        value={value}
        onChange={onChange}
      />
      <div className="flex justify-between items-baseline mt-2">
        <span className="text-xs text-slate-400">1%</span>
        <span className="text-sm font-semibold text-slate-900">{value}% ({fmt(earnestAmt)})</span>
        <span className="text-xs text-slate-400">10%</span>
      </div>
    </>
  )
}
