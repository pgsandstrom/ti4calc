import _times from 'lodash/times'
import { Battle, BattleResult, Participant, setupBattle } from './battleSetup'

export interface BattleReport {
  attacker: number
  draw: number
  defender: number
}

export default function getBattleReport(
  attacker: Participant,
  defender: Participant,
  times = 1000,
): BattleReport {
  const battle: Battle = {
    attacker,
    defender,
  }

  const data: BattleReport = {
    attacker: 0,
    draw: 0,
    defender: 0,
  }

  _times(times, () => {
    const result = setupBattle(battle)
    switch (result) {
      case BattleResult.attacker:
        data.attacker += 1
        break
      case BattleResult.draw:
        data.draw += 1
        break
      case BattleResult.defender:
        data.defender += 1
        break
    }
  })
  return data
}
