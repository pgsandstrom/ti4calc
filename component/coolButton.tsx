import React from 'react'
import NeutralButton from './neutralButton'
import styles from './coolButton.module.scss'

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
