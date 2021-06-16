import { useState } from 'react'
import styled from 'styled-components'

interface Props {
  text?: string
  style?: React.CSSProperties
}

const ARROW_WIDTH = 5

// centering this popover is kind of an ugly hack
// we cant use the normal -50% hack because it requires a 'overflow: hidden' somewhere to prevent horizontal scroll to appear
// and we can't use that, because it breaks our 'position: sticky' elements.
const LEFT_PERCENTAGE = 100
const LEFT_PX = 70

const StyledDiv = styled.div`
  position: relative;

  .hover-icon {
    background: black;
    color: white;
    border-radius: 100%;
    width: 20px;
    height: 20px;
    text-align: center;
    cursor: help;
  }

  .popover {
    position: absolute;
    bottom: calc(100% + ${ARROW_WIDTH}px);
    z-index: 1000;
    width: 300px;
    pointer-events: none;

    .popover-content {
      background: black;
      color: white;
      position: relative;
      left: calc(-${LEFT_PERCENTAGE}% + ${LEFT_PX}px);
      padding: 10px;
      border-radius: 5px;

      &::after {
        border-style: solid;
        border-color: transparent;
        content: '';
        height: 0;
        position: absolute;
        width: 0;
        border-width: ${ARROW_WIDTH}px;
        top: 100%;
        border-top-color: black;
        right: calc(${100 - LEFT_PERCENTAGE}% + ${LEFT_PX - 15}px);
      }
    }
  }
`

export default function Popover({ text, style }: Props) {
  const [show, setShow] = useState(false)

  return (
    <StyledDiv style={{ ...style, visibility: text === undefined ? 'hidden' : undefined }}>
      <div
        className="hover-icon"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        ?
      </div>
      {show && (
        <div className="popover">
          <div className="popover-content">{text}</div>
        </div>
      )}
    </StyledDiv>
  )
}
