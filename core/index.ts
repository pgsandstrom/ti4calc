import _times from 'lodash/times'
import _cloneDeep from 'lodash/cloneDeep'
import { Participant, Battle, BattleWinner } from './battle-types'
import { setupBattle, startBattle } from './battleSetup'
import { Place } from './enums'
import { PartialRecord } from '../util/util-types'

// TODO change tsconfig target... for all projects

export interface BattleReport {
  attacker: number
  attackerSurvivers: PartialRecord<string, number>
  draw: number
  defender: number
  defenderSurvivers: PartialRecord<string, number>
}

export default function getBattleReport(
  attacker: Participant,
  defender: Participant,
  place: Place,
  times = 1000,
): BattleReport {
  if (attacker.side !== 'attacker' || defender.side !== 'defender') {
    throw new Error(`side error: ${attacker.side}, ${defender.side}`)
  }

  const battle: Battle = {
    attacker,
    defender,
    place,
  }

  const data: BattleReport = {
    attacker: 0,
    attackerSurvivers: {},
    draw: 0,
    defender: 0,
    defenderSurvivers: {},
  }

  const battleInstance = setupBattle(battle)
  // TODO bunch of copied code from webworker...
  _times(times, () => {
    const tmp = _cloneDeep(battleInstance)
    const result = startBattle(tmp)
    switch (result.winner) {
      case BattleWinner.attacker:
        data.attacker += 1
        if (data.attackerSurvivers[result.units] === undefined) {
          data.attackerSurvivers[result.units] = 1
        } else {
          data.attackerSurvivers[result.units]! += 1
        }
        break
      case BattleWinner.draw:
        data.draw += 1
        break
      case BattleWinner.defender:
        data.defender += 1
        if (data.defenderSurvivers[result.units] === undefined) {
          data.defenderSurvivers[result.units] = 1
        } else {
          data.defenderSurvivers[result.units]! += 1
        }
        break
    }
  })
  return data
}
