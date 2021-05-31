import styled from 'styled-components'
import { BattleReport } from '../core'
import { toPercentage } from '../util/util-number'

const BattleReportDiv = styled.div`
  display: flex;
`

const PercentageDiv = styled.div<{ percentage: number; color: string }>`
  flex: ${(p) => p.percentage} 0 0;
  background: ${(p) => p.color};

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
        {report.attacker !== 0 && (
          <PercentageDiv percentage={report.attacker / total} color="#B1B1FF">
            <div>Attacker</div>
            <div>{toPercentage(total, report.attacker)}</div>
          </PercentageDiv>
        )}
        {report.draw !== 0 && (
          <PercentageDiv percentage={report.draw / total} color="#CFCFCF">
            <div>Draw</div>
            <div>{toPercentage(total, report.draw)}</div>
          </PercentageDiv>
        )}
        {report.defender !== 0 && (
          <PercentageDiv percentage={report.defender / total} color="#FFB1B1">
            <div>Defender</div>
            <div>{toPercentage(total, report.defender)}</div>
          </PercentageDiv>
        )}
      </BattleReportDiv>
    </div>
  )
}
