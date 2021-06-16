import { useState } from 'react'
import styled from 'styled-components'

interface Props {
  text?: string
  style?: React.CSSProperties
}

// centering this popover is kind of an ugly hack
// we cant use the normal -50% hack because it requires a 'overflow: hidden' somewhere to prevent horizontal scroll to appear
// and we can't use that, because it breaks our 'position: sticky' elements.

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
    z-index: 1000;
    width: 300px;
    pointer-events: none;

    background: black;
    color: white;
    padding: 10px;
    border-radius: 5px;

    bottom: 25px;
    left: -230px;

    &::after {
      border-style: solid;
      border-color: transparent;
      content: '';
      height: 0;
      position: absolute;
      width: 0;
      border-width: 5px;
      top: 100%;
      border-top-color: black;
      right: 55px;
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
      {show && <div className="popover">{text}</div>}
    </StyledDiv>
  )
}
