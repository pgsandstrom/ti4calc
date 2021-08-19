import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { BattleReport } from '../core'
import { useResize } from '../util/hooks'
import {
  getLocalStorage,
  LS_SHOW_DETAILED_REPORT,
  setLocalStorage,
} from '../util/localStorageWrapper'
import { getColorProgress } from '../util/util-color'
import { toPercentageNumber, toPercentageString } from '../util/util-number'
import { objectEntries } from '../util/util-object'
import ArrowSvg from './arrowSvg'
import CoolButton from './coolButton'

const BattleReportDiv = styled.div`
  display: flex;
`

// its good if animation time is lower than MIN_TIME_BETWEEN_SENDING_UPDATES, to avoid jerky animations
const PercentageDiv = styled.div`
  transition: flex-grow 240ms;
  min-width: 30px;
  display: flex;
  flex-direction: column;

  > .unit-string {
    flex: 1 0 auto;
  }

  > * {
    text-align: center;
    white-space: pre-wrap;
  }
`

const StyledExplanationTable = styled.div`
  > div {
    > div {
      display: inline-block;

      &:first-child {
        width: 16px;
        text-align: center;
        margin-right: 10px;
        margin-left: 10px;
      }
    }
  }
`

interface Props {
  report: BattleReport | undefined
  style?: React.CSSProperties
}

const UNIT_TYPE_LIST = ['F', 'W', 'D', 'C', 'c', 'd', 'f', 'M', 'i', 'p']

const sortUnitStrings = (list: Array<[string, number]>) => {
  const helper = (a: string, b: string, unitType: string) => {
    if (a === unitType) {
      return -1
    } else if (b === unitType) {
      return 1
    } else {
      return 0
    }
  }

  const result = list.sort((aThingy, bThingy) => {
    const aString = aThingy[0]
    const bString = bThingy[0]
    const length = Math.max(aString.length, bString.length)
    let i = -1
    while (i < length) {
      i++
      const a = aString[i] as string | undefined
      const b = bString[i] as string | undefined

      if (a === undefined && b !== undefined) {
        return 1
      } else if (a !== undefined && b === undefined) {
        return -1
      }

      if (a === b) {
        const aDamaged = aString[i + 1] === '-'
        const bDamaged = bString[i + 1] === '-'
        if (!aDamaged && bDamaged) {
          return -1
        } else if (aDamaged && !bDamaged) {
          return 1
        } else {
          continue
        }
      }

      for (const unitType of UNIT_TYPE_LIST) {
        const sortResult = helper(a!, b!, unitType)
        if (sortResult !== 0) {
          return sortResult
        }
      }
    }
    throw new Error()
  })

  return result
}

const formatUnitString = (unitString: string) => {
  let result = ''
  Array.from(unitString).forEach((u, index) => {
    if (u === '-') {
      // do nothing
    } else if (unitString[index + 1] === '-') {
      result = `${result}\n${u}-`
    } else {
      result = `${result}\n${u}`
    }
  })
  return result.substring(1) // remove leading newline
}

export function DetailedBattleReportView({ report, style }: Props) {
  if (!report) {
    report = {
      attacker: 0,
      attackerSurvivers: {},
      defender: 0,
      draw: 1,
      defenderSurvivers: {},
    }
  }

  const total = report.attacker + report.defender + report.draw

  const [touched, setTouched] = useState(false)
  const [show, setShowRaw] = useState(false)

  const setShow = (newShowValue: boolean) => {
    if (!touched) {
      setTouched(true)
    }
    setShowRaw(newShowValue)
  }

  useEffect(() => {
    if (touched) {
      setLocalStorage(LS_SHOW_DETAILED_REPORT, show ? 'true' : 'false')
    }
  }, [show, touched])

  useEffect(() => {
    if (getLocalStorage(LS_SHOW_DETAILED_REPORT) === 'true') {
      setShowRaw(true)
    }
  }, [])

  const ref = useRef<HTMLDivElement>(null)

  useResize(
    () => {
      if (ref.current) {
        const windowWidth =
          window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
        if (ref.current.offsetWidth > windowWidth) {
          ref.current.style.alignSelf = 'start'
        } else {
          ref.current.style.alignSelf = ''
        }
      }
    },
    {
      throttleTime: 200,
    },
  )

  const attackerCount = objectEntries(report.attackerSurvivers).length
  const attackerColors = getColorProgress('#B1B1FF', '#8383FF', attackerCount)

  const defenderCount = objectEntries(report.defenderSurvivers).length
  const defenderColors = getColorProgress('#FFB1B1', '#FF8383', defenderCount).reverse()

  return (
    <div
      ref={ref}
      style={{
        display: 'flex',
        flexDirection: 'column',
        marginBottom: '5px',
        minWidth: '100%',
        ...style,
      }}
    >
      <div
        style={{
          display: 'flex',
          textAlign: 'center',
          border: '1px solid black',
          borderBottom: 'none',
          alignSelf: 'center',
          borderRadius: '5px 5px 0 0',
          background: '#E5ECF7',
        }}
      >
        <h3
          style={{
            marginBottom: '0px',
            marginTop: '0px',
            padding: '0 10px',
          }}
        >
          Detailed result
        </h3>
        <CoolButton
          onClick={() => setShow(!show)}
          style={{
            height: '24px',
            marginTop: '3px',
            marginBottom: '3px',
            marginRight: '5px',
            padding: '2px 5px',
          }}
        >
          <div style={{ display: 'flex' }}>
            <span style={{ width: '30px' }}>{show ? 'hide' : 'show'}</span>
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
      </div>

      {show && (
        <>
          <BattleReportDiv>
            {sortUnitStrings(objectEntries(report.attackerSurvivers)).map(
              ([units, count], index) => {
                return (
                  <PercentageDiv
                    key={`attacker-${units}`}
                    style={{
                      flex: `${toPercentageNumber(total, count)} 0 0`,
                      background: attackerColors[index],
                    }}
                  >
                    <div className="unit-string">{formatUnitString(units)}</div>
                    <div className="percentage">{toPercentageString(total, count)}</div>
                  </PercentageDiv>
                )
              },
            )}
            <PercentageDiv
              key="draw"
              style={{
                flex: `${toPercentageNumber(total, report.draw)} 0 0`,
                background: '#CFCFCF',
              }}
            >
              <div className="unit-string">-</div>
              <div className="percentage">{toPercentageString(total, report.draw)}</div>
            </PercentageDiv>
            {sortUnitStrings(objectEntries(report.defenderSurvivers))
              .reverse()
              .map(([units, count], index) => {
                return (
                  <PercentageDiv
                    key={`defender-${units}`}
                    style={{
                      flex: `${toPercentageNumber(total, count)} 0 0`,
                      background: defenderColors[index],
                    }}
                  >
                    <div className="unit-string">{formatUnitString(units)}</div>
                    <div className="percentage">{toPercentageString(total, count)}</div>
                  </PercentageDiv>
                )
              })}
          </BattleReportDiv>
          <div style={{ background: 'white', padding: '10px' }}>
            <div>
              Here you can see the probability of individual units surviving combat. The units are
              represented by individual characters according to this list:
            </div>
            <StyledExplanationTable style={{ marginTop: '10px' }}>
              <div>
                <div>F</div>
                <div>Flagship</div>
              </div>
              <div>
                <div>W</div>
                <div>Warsun</div>
              </div>
              <div>
                <div>D</div>
                <div>dreadnough</div>
              </div>
              <div>
                <div>C</div>
                <div>Carrier</div>
              </div>
              <div>
                <div>c</div>
                <div>cruiser</div>
              </div>
              <div>
                <div>d</div>
                <div>destroyer</div>
              </div>
              <div>
                <div>f</div>
                <div>fighter</div>
              </div>
              <div>
                <div>M</div>
                <div>Mech</div>
              </div>
              <div>
                <div>i</div>
                <div>infantry</div>
              </div>
              <div>
                <div>p</div>
                <div>pds</div>
              </div>
            </StyledExplanationTable>
            <div style={{ marginTop: '20px' }}>
              A hyphen next to the character, such as F-, means that the unit has sustained damage.
            </div>
          </div>
        </>
      )}
    </div>
  )
}
