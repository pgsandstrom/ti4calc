import React, { ChangeEvent, useState } from 'react'

interface NumberInputProps {
  currentValue: number
  onUpdate: (newVal: number) => void
  disabled?: boolean
  'aria-labelledby'?: string
  style?: React.CSSProperties
}

// TODO maybe just select everything when pressing it? Not removing the zero.
export default function NumberInput(props: NumberInputProps) {
  const { currentValue, onUpdate, disabled, style } = props

  const [val, setVal] = useState<string>(currentValue.toString())

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setVal(e.target.value)
    const newVal = parseInt(e.target.value, 10)
    if (Number.isFinite(newVal)) {
      onUpdate(newVal)
    }
  }

  return (
    <input
      type="number"
      min="0"
      max="100"
      value={val}
      onFocus={() => {
        if (val === '0') {
          setVal('')
        }
      }}
      // remember: input with type number dont trigger onChange on invalid input. So we need to clean up in onBlur
      onChange={onChange}
      onBlur={() => {
        const newVal = parseInt(val, 10)
        if (!Number.isFinite(newVal)) {
          setVal(currentValue.toString())
          onUpdate(currentValue)
        }
      }}
      disabled={disabled}
      aria-labelledby={props['aria-labelledby']}
      style={{ ...style, fontSize: '1.5rem', textAlign: 'center' }}
    />
  )
}
