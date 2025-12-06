import React from 'react'

import styles from './optionsRowView.module.scss'
import Popover from './popover'

interface OptionsRowProps {
  left: React.ReactNode
  right: React.ReactNode
  name: string
  description?: string
  namePadding?: number
}

export function OptionsRowView({ left, right, name, description, namePadding }: OptionsRowProps) {
  return (
    <div className={styles.options}>
      <div className={styles.spaceTakerOuter} />
      <div className={styles.controlContainer}>{left}</div>
      <div className={styles.spaceTaker} />
      <div className={styles.descriptionContainer}>
        <span
          style={{
            flex: '1 0 0',
            paddingTop: namePadding !== undefined ? `${namePadding}px` : undefined,
          }}
        >
          {name}
        </span>
        <div style={{ flex: '0 0 auto' }}>
          <Popover text={description} style={{ marginTop: '2px' }} />
        </div>
      </div>
      <div className={styles.spaceTaker} />
      <div className={styles.controlContainer}>{right}</div>
      <div className={styles.spaceTakerOuter} />
    </div>
  )
}
