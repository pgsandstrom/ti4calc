import React from 'react'
import { container } from './coolButton.css'
import NeutralButton from './neutralButton'

interface Props {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  style?: React.CSSProperties
}

export default function CoolButton({ children, onClick, className, style }: Props) {
  return (
    <NeutralButton onClick={onClick} className={`${container} ${className}`} style={style}>
      {children}
    </NeutralButton>
  )
}
