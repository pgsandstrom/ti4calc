import getBattleReport from '..'
import { checkResult } from '../../util/util.test'
import { Participant } from '../battle-types'
import { getUnitMap } from '../battleSetup'
import { Race, Place } from '../enums'
import { DO_BATTLE_X_TIMES } from '../index.test'

describe('Argent flight', () => {
  it('Argent flight destroyers should destroy sustain', () => {
    const attacker: Participant = {
      race: Race.argent_flight,
      units: getUnitMap(),
      unitUpgrades: {
        destroyer: true,
      },
      riskDirectHit: false,
      side: 'attacker',
      battleEffects: {},
    }
    const defender: Participant = {
      race: Race.barony_of_letnev,
      units: getUnitMap(),
      unitUpgrades: {},
      riskDirectHit: false,
      side: 'defender',
      battleEffects: {},
    }
    attacker.units.dreadnought = 3
    attacker.units.destroyer = 3
    defender.units.dreadnought = 3
    defender.units.cruiser = 3

    const result = getBattleReport(attacker, defender, Place.space, DO_BATTLE_X_TIMES)

    checkResult(result.attacker, DO_BATTLE_X_TIMES * 0.719)
    checkResult(result.draw, DO_BATTLE_X_TIMES * 0.037, 0.2)
    checkResult(result.defender, DO_BATTLE_X_TIMES * 0.243)
  })
})
