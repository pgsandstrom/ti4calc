import _times from 'lodash/times'
import { Battle, BattleResult, Participant, setupBattle } from './battleSetup'

export interface BattleReport {
  left: number
  draw: number
  right: number
}

export default function doEverything(left: Participant, right: Participant): BattleReport {
  const battle: Battle = {
    left,
    right,
  }

  const data: BattleReport = {
    left: 0,
    draw: 0,
    right: 0,
  }

  _times(100, () => {
    const result = setupBattle(battle)
    switch (result) {
      case BattleResult.left:
        data.left += 1
        break
      case BattleResult.draw:
        data.draw += 1
        break
      case BattleResult.right:
        data.right += 1
        break
    }
  })
  return data
}
