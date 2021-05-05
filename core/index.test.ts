import doEverything from '.'
import { duraniumArmor, nonEuclideanShielding } from './battleeffect/battleEffects'
import { getUnitMap, Participant, Side } from './battleSetup'
import { Race } from './races/race'

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
      side: Side.attacker,
      battleEffects: [],
    }
    attacker.units.dreadnought = 2
    defender.units.dreadnought = 2

    const result = doEverything(attacker, defender)

    expect(result.draw).toEqual(0)
    expect(result.defender).toEqual(0)
  })
})
