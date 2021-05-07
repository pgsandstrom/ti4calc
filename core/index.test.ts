import getBattleReport from '.'
import { checkResult } from '../util/util-test'
import { getUnitMap } from './battleSetup'
import { duraniumArmor } from './battleeffect/battleEffects'
import { Participant } from './battle-types'
import { Race } from './enums'
import { baronyOfLetnev } from './races/baronyOfLetnev'

const DO_BATTLE_X_TIMES = 10000

describe('core', () => {
  it('barony should always win with non-euclidian and duranium', () => {
    const nonEuclideanShieldingTech = baronyOfLetnev.find(
      (e) => e.name === 'Non-Euclidean Shielding',
    )!
    const attacker: Participant = {
      race: Race.barony_of_letnev,
      units: getUnitMap(),
      unitUpgrades: {},
      riskDirectHit: false,
      side: 'attacker',
      battleEffects: [nonEuclideanShieldingTech, duraniumArmor],
    }
    const defender: Participant = {
      race: Race.barony_of_letnev,
      units: getUnitMap(),
      unitUpgrades: {},
      riskDirectHit: false,
      side: 'defender',
      battleEffects: [],
    }
    attacker.units.dreadnought = 2
    defender.units.dreadnought = 2

    const result = getBattleReport(attacker, defender, 100)

    expect(result.draw).toEqual(0)
    expect(result.defender).toEqual(0)
  })

  it('Sardakk vs arborec flagship', () => {
    const attacker: Participant = {
      race: Race.sardakk_norr,
      units: getUnitMap(),
      unitUpgrades: {},
      riskDirectHit: false,
      side: 'attacker',
      battleEffects: [],
    }
    const defender: Participant = {
      race: Race.arborec,
      units: getUnitMap(),
      unitUpgrades: {},
      riskDirectHit: false,
      side: 'defender',
      battleEffects: [],
    }
    attacker.units.flagship = 1
    defender.units.flagship = 1

    const result = getBattleReport(attacker, defender, DO_BATTLE_X_TIMES)

    checkResult(result.attacker, DO_BATTLE_X_TIMES * 0.56)
    checkResult(result.draw, DO_BATTLE_X_TIMES * 0.26)
    checkResult(result.defender, DO_BATTLE_X_TIMES * 0.18)
  })

  it('5v5 dreadnaught with duranium', () => {
    const attacker: Participant = {
      race: Race.barony_of_letnev,
      units: getUnitMap(),
      unitUpgrades: {},
      riskDirectHit: false,
      side: 'attacker',
      battleEffects: [duraniumArmor],
    }
    const defender: Participant = {
      race: Race.barony_of_letnev,
      units: getUnitMap(),
      unitUpgrades: {},
      riskDirectHit: false,
      side: 'defender',
      battleEffects: [],
    }
    attacker.units.dreadnought = 5
    defender.units.dreadnought = 5

    const result = getBattleReport(attacker, defender, DO_BATTLE_X_TIMES)

    checkResult(result.attacker, DO_BATTLE_X_TIMES * 0.67)
    checkResult(result.draw, DO_BATTLE_X_TIMES * 0.0167, 0.2)
    checkResult(result.defender, DO_BATTLE_X_TIMES * 0.313)
  })

  // TODO add a test where argent flight destroyers fudge up sustain armor

  it('argent flight upgraded destroyers should perform like cruisers', () => {
    const attacker: Participant = {
      race: Race.argent_flight,
      units: getUnitMap(),
      unitUpgrades: {
        destroyer: true,
      },
      riskDirectHit: false,
      side: 'attacker',
      battleEffects: [],
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
    defender.units.cruiser = 2

    const result = getBattleReport(attacker, defender, DO_BATTLE_X_TIMES)

    checkResult(result.attacker, DO_BATTLE_X_TIMES * 0.443)
    checkResult(result.draw, DO_BATTLE_X_TIMES * 0.113)
    checkResult(result.defender, DO_BATTLE_X_TIMES * 0.443)
  })
})
