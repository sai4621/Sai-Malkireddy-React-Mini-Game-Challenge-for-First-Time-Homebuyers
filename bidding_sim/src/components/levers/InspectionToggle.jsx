import { PillGroup } from './shared'

export default function InspectionToggle({ value, onChange }) {
  return (
    <PillGroup
      value={value}
      onChange={onChange}
      options={[
        { value: 'standard', label: 'Standard' },
        { value: '3day',     label: '3-Day' },
        { value: 'waived',   label: 'Waived' },
      ]}
    />
  )
}
