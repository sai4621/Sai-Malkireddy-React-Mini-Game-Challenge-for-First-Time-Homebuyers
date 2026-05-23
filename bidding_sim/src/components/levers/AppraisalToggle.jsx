import { PillGroup } from './shared'

export default function AppraisalToggle({ value, onChange }) {
  return (
    <PillGroup
      value={value}
      onChange={onChange}
      options={[
        { value: 'standard', label: 'Standard' },
        { value: 'gap',      label: 'Gap Guarantee' },
        { value: 'waived',   label: 'Waived' },
      ]}
    />
  )
}
