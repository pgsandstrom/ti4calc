import { useRef } from 'react'
import styled from 'styled-components'
import { BattleReport } from '../core'
import { useResize } from '../util/hooks'
import { toPercentageNumber, toPercentageString } from '../util/util-number'
import { objectEntries } from '../util/util-object'

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

interface Props {
  report: BattleReport | undefined
  style?: React.CSSProperties
}

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

      const unitTypeList = ['F', 'W', 'D', 'C', 'c', 'd', 'f', 'M', 'i', 'p']
      for (const unitType of unitTypeList) {
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
      <h3
        style={{
          textAlign: 'center',
          marginBottom: '0px',
          marginTop: '0px',
          border: '1px solid black',
          borderBottom: 'none',
          alignSelf: 'center',
          padding: '0 10px',
          borderRadius: '5px 5px 0 0',
          background: '#E5ECF7',
        }}
      >
        Detailed result
      </h3>

      <BattleReportDiv>
        {sortUnitStrings(objectEntries(report.attackerSurvivers)).map(([units, count]) => {
          return (
            <PercentageDiv
              key={`attacker-${units}`}
              style={{
                flex: `${toPercentageNumber(total, count)} 0 0`,
                background: '#B1B1FF',
              }}
            >
              <div className="unit-string">{formatUnitString(units)}</div>
              <div className="percentage">{toPercentageString(total, count)}</div>
            </PercentageDiv>
          )
        })}
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
          .map(([units, count]) => {
            return (
              <PercentageDiv
                key={`defender-${units}`}
                style={{
                  flex: `${toPercentageNumber(total, count)} 0 0`,
                  background: '#FFB1B1',
                }}
              >
                <div className="unit-string">{formatUnitString(units)}</div>
                <div className="percentage">{toPercentageString(total, count)}</div>
              </PercentageDiv>
            )
          })}
      </BattleReportDiv>
    </div>
  )
}
