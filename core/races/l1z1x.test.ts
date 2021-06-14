import getBattleReport from '..'
import { checkResult } from '../../util/util.test'
import { Participant } from '../battle-types'
import { getUnitMap } from '../battleSetup'
import { Race, Place } from '../enums'
import { DO_BATTLE_X_TIMES } from '../index.test'

describe('L1z1x', () => {
  it('ground combat with l1z1x harrow ability', () => {
    const attacker: Participant = {
      race: Race.l1z1x,
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
    attacker.units.dreadnought = 3
    attacker.units.infantry = 5
    defender.units.infantry = 8

    const result = getBattleReport(attacker, defender, Place.ground, DO_BATTLE_X_TIMES)

    checkResult(result.attacker, DO_BATTLE_X_TIMES * 0.803)
    checkResult(result.draw, DO_BATTLE_X_TIMES * 0.063)
    checkResult(result.defender, DO_BATTLE_X_TIMES * 0.132)
  })

  it('L1z1x flagship makes flagship and dreadnaughts target non-fighter ships', () => {
    const attacker: Participant = {
      race: Race.l1z1x,
      units: getUnitMap(),
      unitUpgrades: {},
      riskDirectHit: false,
      side: 'attacker',
      battleEffects: {},
    }
    const defender: Participant = {
      race: Race.arborec,
      units: getUnitMap(),
      unitUpgrades: {},
      riskDirectHit: false,
      side: 'defender',
      battleEffects: {},
    }
    attacker.units.flagship = 1
    attacker.units.dreadnought = 4
    defender.units.dreadnought = 5
    defender.units.fighter = 3

    const result = getBattleReport(attacker, defender, Place.space, DO_BATTLE_X_TIMES)

    checkResult(result.attacker, DO_BATTLE_X_TIMES * 0.296)
    checkResult(result.draw, DO_BATTLE_X_TIMES * 0.021)
    checkResult(result.defender, DO_BATTLE_X_TIMES * 0.682)
  })
})
