import getBattleReport from '..'
import { checkResult } from '../../util/util.test'
import { Participant } from '../battle-types'
import { getUnitMap } from '../battleSetup'
import { Race, Place } from '../enums'
import { DO_BATTLE_X_TIMES } from '../index.test'
import { assaultCannon, duraniumArmor } from './tech'

describe('Tech', () => {
  it('5v5 dreadnought with duranium', () => {
    const attacker: Participant = {
      race: Race.barony_of_letnev,
      units: getUnitMap(),
      unitUpgrades: {},
      riskDirectHit: false,
      side: 'attacker',
      battleEffects: {
        [duraniumArmor.name]: 1,
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
    attacker.units.dreadnought = 5
    defender.units.dreadnought = 5

    const result = getBattleReport(attacker, defender, Place.space, DO_BATTLE_X_TIMES)

    checkResult(result.attacker, DO_BATTLE_X_TIMES * 0.67)
    checkResult(result.draw, DO_BATTLE_X_TIMES * 0.0167)
    checkResult(result.defender, DO_BATTLE_X_TIMES * 0.313)
  })

  it('Assault cannon should not snipe mech', () => {
    const attacker: Participant = {
      race: Race.barony_of_letnev,
      units: getUnitMap(),
      unitUpgrades: {},
      riskDirectHit: false,
      side: 'attacker',
      battleEffects: {
        [assaultCannon.name]: 1,
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
    attacker.units.destroyer = 3
    defender.units.cruiser = 1
    defender.units.mech = 1

    const result = getBattleReport(attacker, defender, Place.space, 100)

    expect(result.attacker).toEqual(100)
  })
})
