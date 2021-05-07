import React from 'react'
import styled from 'styled-components'
import NeutralButton from './neutralButton'

const StyledNeutralButton = styled(NeutralButton)`
  padding: 5px;

  &.selected {
    background: red;
  }
`

interface Props {
  isLeftSelected: boolean
  onLeftClick?: () => void
  onRightClick?: () => void
}

export default function SwitchSideButton({ isLeftSelected, onLeftClick, onRightClick }: Props) {
  return (
    <>
      <StyledNeutralButton
        onClick={onLeftClick}
        className={isLeftSelected ? 'selected' : undefined}
        style={{ border: '1px solid black', borderRadius: '5px 0 0 5px' }}
      >
        Space
      </StyledNeutralButton>
      <StyledNeutralButton
        onClick={onRightClick}
        className={!isLeftSelected ? 'selected' : undefined}
        style={{ border: '1px solid black', borderLeft: 'none', borderRadius: '0 5px 5px 0' }}
      >
        Ground
      </StyledNeutralButton>
    </>
  )
}
