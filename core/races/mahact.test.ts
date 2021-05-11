import getBattleReport from '..'
import { checkResult } from '../../util/util.test'
import { Participant } from '../battle-types'
import { getUnitMap } from '../battleSetup'
import { Race, Place } from '../enums'
import { DO_BATTLE_X_TIMES } from '../index.test'
import { mahact } from './mahact'

describe('Mahact', () => {
  it('barony should always win with non-euclidian and duranium', () => {
    const missingEnemyCommandToken = mahact.find(
      (e) => e.name === 'Mahact missing enemy command token',
    )!
    const attacker: Participant = {
      race: Race.mahact,
      units: getUnitMap(),
      unitUpgrades: {},
      riskDirectHit: false,
      side: 'attacker',
      battleEffects: [missingEnemyCommandToken],
    }
    const defender: Participant = {
      race: Race.barony_of_letnev,
      units: getUnitMap(),
      unitUpgrades: {},
      riskDirectHit: false,
      side: 'defender',
      battleEffects: [],
    }
    attacker.units.flagship = 1
    attacker.units.dreadnought = 3
    defender.units.dreadnought = 5

    const result = getBattleReport(attacker, defender, Place.space, DO_BATTLE_X_TIMES)

    checkResult(result.attacker, DO_BATTLE_X_TIMES * 0.306)
    checkResult(result.draw, DO_BATTLE_X_TIMES * 0.102, 0.15)
    checkResult(result.defender, DO_BATTLE_X_TIMES * 0.592)
  })
})
