import getBattleReport from '..'
import { checkResult } from '../../util/util.test'
import { Participant } from '../battle-types'
import { getUnitMap } from '../battleSetup'
import { Race, Place } from '../enums'
import { DO_BATTLE_X_TIMES } from '../index.test'

describe('Naluu', () => {
  it('Naluu flagship should help in ground combat', () => {
    const attacker: Participant = {
      race: Race.naluu,
      units: getUnitMap(),
      unitUpgrades: {},
      riskDirectHit: false,
      side: 'attacker',
      battleEffects: { 'Mahact flagship bonus': 1 },
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
    attacker.units.fighter = 2
    attacker.units.infantry = 1
    defender.units.infantry = 3

    const result = getBattleReport(attacker, defender, Place.ground, DO_BATTLE_X_TIMES)

    checkResult(result.attacker, DO_BATTLE_X_TIMES * 0.477)
    checkResult(result.draw, DO_BATTLE_X_TIMES * 0.044, 0.25)
    checkResult(result.defender, DO_BATTLE_X_TIMES * 0.479)
  })

  it('Naluu fighters should never be able to win ground combat', () => {
    const attacker: Participant = {
      race: Race.naluu,
      units: getUnitMap(),
      unitUpgrades: {},
      riskDirectHit: false,
      side: 'attacker',
      battleEffects: { 'Mahact flagship bonus': 1 },
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
    attacker.units.fighter = 2
    defender.units.infantry = 1

    const result = getBattleReport(attacker, defender, Place.ground, DO_BATTLE_X_TIMES)

    checkResult(result.attacker, 0, 0)
    checkResult(result.draw, DO_BATTLE_X_TIMES * 0.908, 0.1)
    checkResult(result.defender, DO_BATTLE_X_TIMES * 0.092, 0.1)
  })
})
