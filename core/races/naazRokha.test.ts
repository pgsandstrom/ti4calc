import getBattleReport from '..'
import { checkResult } from '../../util/util.test'
import { Participant } from '../battle-types'
import { getUnitMap } from '../battleSetup'
import { Race, Place } from '../enums'
import { DO_BATTLE_X_TIMES } from '../index.test'

describe('Naaz-Rokha', () => {
  it('Naaz-Rokha flagship should help in ground combat', () => {
    const attacker: Participant = {
      race: Race.naaz_rokha,
      units: getUnitMap(),
      unitUpgrades: {},
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
    attacker.units.flagship = 1
    attacker.units.mech = 1
    attacker.units.infantry = 5
    defender.units.mech = 2
    defender.units.infantry = 5

    const result = getBattleReport(attacker, defender, Place.ground, DO_BATTLE_X_TIMES)

    checkResult(result.attacker, DO_BATTLE_X_TIMES * 0.525)
    checkResult(result.draw, DO_BATTLE_X_TIMES * 0.087, 0.1)
    checkResult(result.defender, DO_BATTLE_X_TIMES * 0.387)
  })

  it('Naaz-Rokha mech should help in space combat', () => {
    const attacker: Participant = {
      race: Race.naaz_rokha,
      units: getUnitMap(),
      unitUpgrades: {},
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
    attacker.units.mech = 1
    attacker.units.dreadnought = 2
    defender.units.dreadnought = 2

    const result = getBattleReport(attacker, defender, Place.space, DO_BATTLE_X_TIMES)

    checkResult(result.attacker, DO_BATTLE_X_TIMES * 0.796)
    checkResult(result.draw, DO_BATTLE_X_TIMES * 0.062, 0.1)
    checkResult(result.defender, DO_BATTLE_X_TIMES * 0.142)
  })
})
