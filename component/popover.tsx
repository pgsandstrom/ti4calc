import { useState } from 'react'

import styles from './popover.module.scss'

interface Props {
  text?: string
  style?: React.CSSProperties
}

// centering this popover is kind of an ugly hack
// we cant use the normal -50% hack because it requires a 'overflow: hidden' somewhere to prevent horizontal scroll to appear
// and we can't use that, because it breaks our 'position: sticky' elements.

export default function Popover({ text, style }: Props) {
  const [show, setShow] = useState(false)

  return (
    <div
      className={styles.container}
      style={{ ...style, visibility: text === undefined ? 'hidden' : undefined }}
    >
      <div
        className={styles.hoverIcon}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        ?
      </div>
      {show && <div className={styles.popover}>{text}</div>}
    </div>
  )
}
