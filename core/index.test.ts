import getBattleReport from '.'
import { checkResult } from '../util/util.test'
import { getUnitMap } from './battleSetup'
import { Participant } from './battle-types'
import { Place, Race } from './enums'
import { duraniumArmor } from './battleeffect/tech'

export const DO_BATTLE_X_TIMES = 15000

describe('core', () => {
  it('Make sure battle effect isnt used if set to 0', () => {
    const attacker: Participant = {
      race: Race.barony_of_letnev,
      units: getUnitMap(),
      unitUpgrades: {},
      riskDirectHit: false,
      side: 'attacker',
      battleEffects: {
        [duraniumArmor.name]: 0,
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
    attacker.units.dreadnought = 2
    defender.units.dreadnought = 2

    const result = getBattleReport(attacker, defender, Place.space, DO_BATTLE_X_TIMES)

    checkResult(result.attacker, DO_BATTLE_X_TIMES * 0.438)
    checkResult(result.draw, DO_BATTLE_X_TIMES * 0.123, 0.1)
    checkResult(result.defender, DO_BATTLE_X_TIMES * 0.438)
  })

  it('basic ground combat', () => {
    const attacker: Participant = {
      race: Race.argent_flight,
      units: getUnitMap(),
      unitUpgrades: {
        infantry: true,
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
    attacker.units.infantry = 2
    defender.units.mech = 2

    const result = getBattleReport(attacker, defender, Place.ground, DO_BATTLE_X_TIMES)

    checkResult(result.attacker, DO_BATTLE_X_TIMES * 0.033, 0.2)
    checkResult(result.draw, DO_BATTLE_X_TIMES * 0.017, 0.2)
    checkResult(result.defender, DO_BATTLE_X_TIMES * 0.949)
  })

  it('ground combat with bombardment', () => {
    const attacker: Participant = {
      race: Race.argent_flight,
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
    attacker.units.infantry = 3
    attacker.units.dreadnought = 3
    defender.units.infantry = 3

    const result = getBattleReport(attacker, defender, Place.ground, DO_BATTLE_X_TIMES)

    checkResult(result.attacker, DO_BATTLE_X_TIMES * 0.904)
    checkResult(result.draw, DO_BATTLE_X_TIMES * 0.014, 0.5)
    checkResult(result.defender, DO_BATTLE_X_TIMES * 0.081, 0.15)
  })

  it('ground combat with bombardment but also planetary shield', () => {
    const attacker: Participant = {
      race: Race.argent_flight,
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
    attacker.units.infantry = 3
    attacker.units.dreadnought = 3
    defender.units.infantry = 3
    defender.units.pds = 1

    const result = getBattleReport(attacker, defender, Place.ground, DO_BATTLE_X_TIMES)

    checkResult(result.attacker, DO_BATTLE_X_TIMES * 0.316)
    checkResult(result.draw, DO_BATTLE_X_TIMES * 0.037, 0.2)
    checkResult(result.defender, DO_BATTLE_X_TIMES * 0.646)
  })

  it('ground combat with bombardment but also planetary shield... but the planetary shield is DISABLED', () => {
    const attacker: Participant = {
      race: Race.barony_of_letnev,
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
    attacker.units.infantry = 3
    attacker.units.flagship = 1
    defender.units.infantry = 3
    defender.units.pds = 1

    const result = getBattleReport(attacker, defender, Place.ground, DO_BATTLE_X_TIMES)

    checkResult(result.attacker, DO_BATTLE_X_TIMES * 0.82)
    checkResult(result.draw, DO_BATTLE_X_TIMES * 0.028, 0.2)
    checkResult(result.defender, DO_BATTLE_X_TIMES * 0.152)
  })
})
