import { PillGroup } from './shared'

export default function FinancingToggle({ value, onChange, disabled = false, disabledReason }) {
  return (
    <PillGroup
      value={value}
      onChange={onChange}
      disabled={disabled}
      disabledReason={disabledReason}
      options={[
        { value: 'standard', label: 'Standard' },
        { value: 'waived',   label: 'Waived' },
      ]}
    />
  )
}
