import getBattleReport from '..'
import { checkResult } from '../../util/util.test'
import { Participant } from '../battle-types'
import { getUnitMap } from '../battleSetup'
import { Race, Place } from '../enums'
import { DO_BATTLE_X_TIMES } from '../index.test'

describe('Mentak', () => {
  it('Mentak hero should resurrect upgraded units if mentak has the upgrade', () => {
    const attacker: Participant = {
      race: Race.mentak,
      units: getUnitMap(),
      unitUpgrades: {
        destroyer: true,
      },
      riskDirectHit: false,
      side: 'attacker',
      battleEffects: {
        'Mentak hero': 1,
      },
    }
    const defender: Participant = {
      race: Race.barony_of_letnev,
      units: getUnitMap(),
      unitUpgrades: {},
      riskDirectHit: false,
      side: 'defender',
      battleEffects: {},
    }
    attacker.units.dreadnought = 1
    defender.units.destroyer = 4

    const result = getBattleReport(attacker, defender, Place.space, DO_BATTLE_X_TIMES)

    checkResult(result.attacker, DO_BATTLE_X_TIMES * 0.647)
    checkResult(result.draw, DO_BATTLE_X_TIMES * 0.01, 1)
    checkResult(result.defender, DO_BATTLE_X_TIMES * 0.353)
  })
})
