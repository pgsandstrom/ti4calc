import React, { useState } from 'react'
import styled from 'styled-components'
import ArrowSvg from './arrowSvg'
import CoolButton from './coolButton'
import { NUMBER_OF_ROLLS, ROLLS_BETWEEN_UI_UPDATE } from '../core/constant'

interface Props {
  style?: React.CSSProperties
}

const StyledDiv = styled.div`
  > * {
    margin-top: 20px;
  }
`

export default function HelpView({ style }: Props) {
  const [show, setShow] = useState(false)
  return (
    <div
      style={{
        ...style,
        background: 'white',
        borderRadius: '5px',
        padding: '5px',
      }}
    >
      <CoolButton onClick={() => setShow(!show)} style={{ padding: '10px' }}>
        <div style={{ display: 'flex' }}>
          <span>Help</span>
          <ArrowSvg
            style={{
              width: '16px',
              height: '16px',
              marginLeft: '5px',
              transform: show ? 'scaleY(-1)' : undefined,
            }}
          />
        </div>
      </CoolButton>
      {show && (
        <StyledDiv>
          <div>
            This is a tool to help calculate odds for the board game Twilight Imperium 4. All
            current expansions and codex are included.
          </div>
          <div>Upgrade units by selecting the checkbox next to them.</div>
          <div>
            The result is calculated by running {NUMBER_OF_ROLLS} simulations but the first result
            is shown after only {ROLLS_BETWEEN_UI_UPDATE} simulations. That is why the result can
            change slightly from the initial value.
          </div>
          <div>
            Source code is available at{' '}
            <a
              href="https://github.com/pgsandstrom/ti4calc"
              target="_blank"
              rel="noopener noreferrer"
            >
              Github
            </a>
            . I welcome suggestions and bug reports! I can also be reached on{' '}
            <a href="https://twitter.com/pgsandstrom" target="_blank" rel="noopener noreferrer">
              Twitter
            </a>{' '}
            or via mail at{' '}
            <a href="mailto:ti4battle@persandstrom.com">ti4battle@persandstrom.com</a>.
          </div>
          <div></div>
        </StyledDiv>
      )}
    </div>
  )
}
