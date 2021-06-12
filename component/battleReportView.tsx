import styled from 'styled-components'
import { BattleReport } from '../core'
import { toPercentage } from '../util/util-number'

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
}

export function BattleReportView({ report }: Props) {
  if (!report) {
    report = {
      attacker: 0,
      defender: 0,
      draw: 1,
    }
  }

  const total = report.attacker + report.defender + report.draw

  return (
    <div>
      <h2 style={{ textAlign: 'center' }}>Result</h2>

      <BattleReportDiv>
        <PercentageDiv
          style={{
            flex: `${report.attacker / total} 0 0`,
            background: '#B1B1FF',
          }}
        >
          {report.attacker !== 0 && (
            <>
              <div>Attacker</div>
              <div>{toPercentage(total, report.attacker)}</div>
            </>
          )}
        </PercentageDiv>
        <PercentageDiv
          style={{
            flex: `${report.draw / total} 0 0`,
            background: '#CFCFCF',
          }}
        >
          {report.draw !== 0 && (
            <>
              <div>Draw</div>
              <div>{toPercentage(total, report.draw)}</div>
            </>
          )}
        </PercentageDiv>
        <PercentageDiv
          style={{
            flex: `${report.defender / total} 0 0`,
            background: '#FFB1B1',
          }}
        >
          {report.defender !== 0 && (
            <>
              <div>Defender</div>
              <div>{toPercentage(total, report.defender)}</div>
            </>
          )}
        </PercentageDiv>
      </BattleReportDiv>
    </div>
  )
}
