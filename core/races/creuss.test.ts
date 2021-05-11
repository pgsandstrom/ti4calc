import getBattleReport from '..'
import { checkResult } from '../../util/util.test'
import { Participant } from '../battle-types'
import { getUnitMap } from '../battleSetup'
import { Race, Place } from '../enums'
import { DO_BATTLE_X_TIMES } from '../index.test'
import { creuss } from './creuss'

describe('creuss', () => {
  it('Dimensional splicer should work', () => {
    const dimensionalSplicer = creuss.find((e) => e.name === 'Dimensional Splicer')!
    const attacker: Participant = {
      race: Race.creuss,
      units: getUnitMap(),
      unitUpgrades: {},
      riskDirectHit: false,
      side: 'attacker',
      battleEffects: [dimensionalSplicer],
    }
    const defender: Participant = {
      race: Race.barony_of_letnev,
      units: getUnitMap(),
      unitUpgrades: {},
      riskDirectHit: false,
      side: 'defender',
      battleEffects: [],
    }
    attacker.units.destroyer = 2
    defender.units.destroyer = 2
    defender.units.cruiser = 1

    const result = getBattleReport(attacker, defender, Place.space, DO_BATTLE_X_TIMES)

    checkResult(result.attacker, DO_BATTLE_X_TIMES * 0.479)
    checkResult(result.draw, DO_BATTLE_X_TIMES * 0.042, 0.15)
    checkResult(result.defender, DO_BATTLE_X_TIMES * 0.479)
  })
})
