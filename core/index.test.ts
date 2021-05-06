import doEverything from '.'
import { checkResult } from '../util/util-test'
import { duraniumArmor, nonEuclideanShielding } from './battleeffect/battleEffects'
import { getUnitMap, Participant, Side } from './battleSetup'
import { Race } from './races/race'

const DO_BATTLE_X_TIMES = 10000

describe('core', () => {
  it('barony should always win with non-euclidian and duranium', () => {
    const attacker: Participant = {
      race: Race.barony_of_letnev,
      units: getUnitMap(),
      unitUpgrades: {},
      riskDirectHit: false,
      side: Side.attacker,
      battleEffects: [nonEuclideanShielding, duraniumArmor],
    }
    const defender: Participant = {
      race: Race.barony_of_letnev,
      units: getUnitMap(),
      unitUpgrades: {},
      riskDirectHit: false,
      side: Side.defender,
      battleEffects: [],
    }
    attacker.units.dreadnought = 2
    defender.units.dreadnought = 2

    const result = doEverything(attacker, defender, 100)

    expect(result.draw).toEqual(0)
    expect(result.defender).toEqual(0)
  })

  it('Sardakk vs arborec flagship', () => {
    const attacker: Participant = {
      race: Race.sardakk_norr,
      units: getUnitMap(),
      unitUpgrades: {},
      riskDirectHit: false,
      side: Side.attacker,
      battleEffects: [],
    }
    const defender: Participant = {
      race: Race.arborec,
      units: getUnitMap(),
      unitUpgrades: {},
      riskDirectHit: false,
      side: Side.defender,
      battleEffects: [],
    }
    attacker.units.flagship = 1
    defender.units.flagship = 1

    const result = doEverything(attacker, defender, DO_BATTLE_X_TIMES)

    checkResult(result.attacker, DO_BATTLE_X_TIMES * 0.56)
    checkResult(result.draw, DO_BATTLE_X_TIMES * 0.26)
    checkResult(result.defender, DO_BATTLE_X_TIMES * 0.18)
  })
})
