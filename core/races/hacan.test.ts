import getBattleReport from '..'
import { checkResult } from '../../util/util.test'
import { Participant } from '../battle-types'
import { getUnitMap } from '../battleSetup'
import { Race, Place } from '../enums'
import { DO_BATTLE_X_TIMES } from '../index.test'

describe('Hacan', () => {
  it('Hacan flagship should give different results with different numbers of trade goods bonuses', () => {
    const attacker: Participant = {
      race: Race.hacan,
      units: getUnitMap(),
      unitUpgrades: {},
      riskDirectHit: false,
      side: 'attacker',
      battleEffects: { 'Hacan flagship trade goods': 1 },
    }
    const defender: Participant = {
      race: Race.muaat,
      units: getUnitMap(),
      unitUpgrades: {},
      riskDirectHit: false,
      side: 'defender',
      battleEffects: {},
    }
    attacker.units.flagship = 1
    attacker.units.cruiser = 5
    defender.units.flagship = 1
    defender.units.cruiser = 5

    const result = getBattleReport(attacker, defender, Place.space, DO_BATTLE_X_TIMES)

    checkResult(result.attacker, DO_BATTLE_X_TIMES * 0.386)
    checkResult(result.draw, DO_BATTLE_X_TIMES * 0.106, 0.1)
    checkResult(result.defender, DO_BATTLE_X_TIMES * 0.507)

    attacker.battleEffects['Hacan flagship trade goods'] = 100

    const result2 = getBattleReport(attacker, defender, Place.space, DO_BATTLE_X_TIMES)

    checkResult(result2.attacker, DO_BATTLE_X_TIMES * 0.469)
    checkResult(result2.draw, DO_BATTLE_X_TIMES * 0.117, 0.1)
    checkResult(result2.defender, DO_BATTLE_X_TIMES * 0.413)
  })
})
