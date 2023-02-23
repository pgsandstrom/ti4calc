import React, { ForwardedRef } from 'react'
import styles from './neutralButton.module.scss'

const NeutralButton = (
  props: React.ButtonHTMLAttributes<HTMLButtonElement>,
  ref: ForwardedRef<HTMLButtonElement>,
) => <button {...props} ref={ref} className={`${styles.neutralButton} ${props.className}`} />

export default React.forwardRef(NeutralButton)
