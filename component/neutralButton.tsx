import React from 'react'

import styles from '@/component/neutralButton.module.scss'

const NeutralButton = ({ ref, ...props }: React.ComponentProps<'button'>) => (
  <button {...props} ref={ref} className={`${styles.neutralButton} ${props.className}`} />
)

export default NeutralButton
