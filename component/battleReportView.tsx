import styled from 'styled-components'
import { BattleReport } from '../core'
import { toPercentageNumber, toPercentageString } from '../util/util-number'

const BattleReportDiv = styled.div`
  display: flex;
`

// its good if animation time is lower than MIN_TIME_BETWEEN_SENDING_UPDATES, to avoid jerky animations
const PercentageDiv = styled.div`
  transition: flex-grow 240ms;

  > * {
    text-align: center;
  }
`

interface Props {
  report: BattleReport | undefined
  style?: React.CSSProperties
}

export function BattleReportView({ report, style }: Props) {
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

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        marginBottom: '5px',
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
        Result
      </h3>

      <BattleReportDiv>
        <PercentageDiv
          style={{
            flex: `${toPercentageNumber(total, report.attacker)} 0 0`,
            background: '#B1B1FF',
          }}
        >
          {report.attacker !== 0 && (
            <>
              <div>Attacker</div>
              <div>{toPercentageString(total, report.attacker)}</div>
            </>
          )}
        </PercentageDiv>
        <PercentageDiv
          style={{
            flex: `${toPercentageNumber(total, report.draw)} 0 0`,
            background: '#CFCFCF',
          }}
        >
          {report.draw !== 0 && (
            <>
              <div>Draw</div>
              <div>{toPercentageString(total, report.draw)}</div>
            </>
          )}
        </PercentageDiv>
        <PercentageDiv
          style={{
            flex: `${toPercentageNumber(total, report.defender)} 0 0`,
            background: '#FFB1B1',
          }}
        >
          {report.defender !== 0 && (
            <>
              <div>Defender</div>
              <div>{toPercentageString(total, report.defender)}</div>
            </>
          )}
        </PercentageDiv>
      </BattleReportDiv>
    </div>
  )
}
