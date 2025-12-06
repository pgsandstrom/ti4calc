import React from 'react'

import styles from './coolButton.module.scss'
import NeutralButton from './neutralButton'

interface Props {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  style?: React.CSSProperties
}

export default function CoolButton({ children, onClick, className, style }: Props) {
  return (
    <NeutralButton onClick={onClick} className={`${className} ${styles.coolButton}`} style={style}>
      {children}
    </NeutralButton>
  )
}
