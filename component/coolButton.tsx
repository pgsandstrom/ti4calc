import React from 'react'
import styled from 'styled-components'
import NeutralButton from './neutralButton'

interface Props {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  style?: React.CSSProperties
}

const StyledButton = styled(NeutralButton)`
  border: 1px solid black;
  padding: 10px 0;
  border-radius: 5px;

  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }

  &:active {
    background: rgba(0, 0, 0, 0.3);
  }
`

export default function CoolButton({ children, onClick, className, style }: Props) {
  return (
    <StyledButton onClick={onClick} className={className} style={style}>
      {children}
    </StyledButton>
  )
}
