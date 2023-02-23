import NeutralButton from './neutralButton'
import styles from './switchButton.module.scss'

interface Props {
  isLeftSelected: boolean
  leftLabel: string
  rightLabel: string
  onLeftClick?: () => void
  onRightClick?: () => void
}

export default function SwitchSideButton({
  isLeftSelected,
  leftLabel,
  rightLabel,
  onLeftClick,
  onRightClick,
}: Props) {
  return (
    <>
      <NeutralButton
        onClick={onLeftClick}
        className={`${styles.neutralButton} ${isLeftSelected ? styles.selected : undefined}`}
        style={{ border: '1px solid black', borderRadius: '5px 0 0 5px' }}
      >
        {leftLabel}
      </NeutralButton>
      <NeutralButton
        onClick={onRightClick}
        className={`${styles.neutralButton} ${!isLeftSelected ? styles.selected : undefined}`}
        style={{ border: '1px solid black', borderLeft: 'none', borderRadius: '0 5px 5px 0' }}
      >
        {rightLabel}
      </NeutralButton>
    </>
  )
}
