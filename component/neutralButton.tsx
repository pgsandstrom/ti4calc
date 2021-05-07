import React, { ForwardedRef } from 'react'
import styled from 'styled-components'

const StyledButton = styled.button`
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
`

const NeutralButton = (
  props: React.ButtonHTMLAttributes<HTMLButtonElement>,
  ref: ForwardedRef<HTMLButtonElement>,
) => <StyledButton {...props} ref={ref} />

export default React.forwardRef(NeutralButton)
