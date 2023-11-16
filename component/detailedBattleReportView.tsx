import React, { useEffect, useRef, useState } from 'react'
import styles from './detailedBattleReportView.module.scss'
import { BattleReport } from '../core'
import { useResize } from '../util/hooks'
import {
  LS_SHOW_DETAILED_REPORT,
  getLocalStorage,
  setLocalStorage,
} from '../util/localStorageWrapper'
import { getColorProgress } from '../util/util-color'
import { toPercentageNumber, toPercentageString } from '../util/util-number'
import { objectEntries } from '../util/util-object'
import ArrowSvg from './arrowSvg'
import CoolButton from './coolButton'

interface Props {
  report: BattleReport | undefined
  style?: React.CSSProperties
}

const PREFERRED_SORT_ORDER_OF_UNITS = ['F', 'W', 'D', 'C', 'c', 'd', 'f', 'M', 'i', 'p']

const getUnitCount = (s: string) => s.replace(/-/g, '').length
const getDamagedCount = (s: string) => s.match(/-/g)?.length ?? 0

const sortUnitStrings = (list: Array<[string, number]>) => {
  const result = list.sort((aThingy, bThingy) => {
    const aString = aThingy[0]
    const bString = bThingy[0]

    const unitCountDiff = getUnitCount(bString) - getUnitCount(aString)
    if (unitCountDiff !== 0) {
      return unitCountDiff
    }

    const damagedCountDiff = getDamagedCount(bString) - getDamagedCount(aString)
    if (damagedCountDiff !== 0) {
      return damagedCountDiff
    }

    const length = Math.max(aString.length, bString.length)
    let i = -1
    while (i < length) {
      i++
      const a = aString[i] === '-' ? aString[i + 1] : (aString[i] as string | undefined)
      const b = bString[i] === '-' ? bString[i + 1] : (bString[i] as string | undefined)

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

      for (const unitType of PREFERRED_SORT_ORDER_OF_UNITS) {
        if (a === unitType) {
          return -1
        } else if (b === unitType) {
          return 1
        }
      }
    }
    throw new Error()
  })

  return result
}

// const input: Array<[string, number]> = [
//   ['WFD-D-', 100],
//   ['WF-D-D-', 100],
//   ['', 100],
// ]

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
          <div className={styles.battleReport}>
            {sortUnitStrings(objectEntries(report.attackerSurvivers)).map(
              ([units, count], index) => {
                return (
                  <div
                    key={`attacker-${units}`}
                    className={styles.percentage}
                    style={{
                      flex: `${toPercentageNumber(total, count)} 0 0`,
                      background: attackerColors[index],
                    }}
                  >
                    <div className={styles.unitString}>{formatUnitString(units)}</div>
                    <div>{toPercentageString(total, count)}</div>
                  </div>
                )
              },
            )}
            <div
              key="draw"
              className={styles.percentage}
              style={{
                flex: `${toPercentageNumber(total, report.draw)} 0 0`,
                background: '#CFCFCF',
              }}
            >
              <div className={styles.unitString}>-</div>
              <div>{toPercentageString(total, report.draw)}</div>
            </div>
            {sortUnitStrings(objectEntries(report.defenderSurvivers))
              .reverse()
              .map(([units, count], index) => {
                return (
                  <div
                    key={`defender-${units}`}
                    className={styles.percentage}
                    style={{
                      flex: `${toPercentageNumber(total, count)} 0 0`,
                      background: defenderColors[index],
                    }}
                  >
                    <div className={styles.unitString}>{formatUnitString(units)}</div>
                    <div>{toPercentageString(total, count)}</div>
                  </div>
                )
              })}
          </div>
          <div style={{ background: 'white', padding: '10px' }}>
            <div>
              Here you can see the probability of individual units surviving combat. The units are
              represented by individual characters according to this list:
            </div>
            <div className={styles.explanationTable} style={{ marginTop: '10px' }}>
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
            </div>
            <div style={{ marginTop: '20px' }}>
              A hyphen next to the character, such as F-, means that the unit has sustained damage.
            </div>
          </div>
        </>
      )}
    </div>
  )
}
