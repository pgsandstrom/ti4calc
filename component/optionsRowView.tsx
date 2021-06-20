import React from 'react'
import styled from 'styled-components'
import Popover from './popover'

const OptionsDiv = styled.div`
  display: flex;
  margin-top: 0px;

  .control-container {
    min-width: 48px;
    max-width: 72px;
    height: 48px;
  }

  .description-container {
    display: flex;
    flex: 0 0 auto;
    width: 200px;
    padding-top: 3px;

    > span {
      flex: 1 0 0;
      text-align: center;
    }
  }

  .space-taker-outer {
    flex: 1 0 0;
  }

  .space-taker {
    flex: 1 0 0;
    max-width: 50px;
  }
`
interface OptionsRowProps {
  left: React.ReactNode
  right: React.ReactNode
  name: string
  description?: string
  namePadding?: number
}

export function OptionsRowView({ left, right, name, description, namePadding }: OptionsRowProps) {
  return (
    <OptionsDiv>
      <div className="space-taker-outer" />
      <div className="control-container">{left}</div>
      <div className="space-taker" />
      <div className="description-container">
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
      <div className="space-taker" />
      <div className="control-container">{right}</div>
      <div className="space-taker-outer" />
    </OptionsDiv>
  )
}
