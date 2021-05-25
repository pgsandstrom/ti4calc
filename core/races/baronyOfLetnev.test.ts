import getBattleReport from '..'
import { Participant } from '../battle-types'
import { duraniumArmor } from '../battleeffect/tech'
import { getUnitMap } from '../battleSetup'
import { Race, Place } from '../enums'

describe('Barony of Letnev', () => {
  it('barony should always win with non-euclidian and duranium', () => {
    const attacker: Participant = {
      race: Race.barony_of_letnev,
      units: getUnitMap(),
      unitUpgrades: {},
      riskDirectHit: false,
      side: 'attacker',
      battleEffects: {
        'Non-Euclidean Shielding': 1,
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
    attacker.units.dreadnought = 2
    defender.units.dreadnought = 2

    const result = getBattleReport(attacker, defender, Place.space, 100)

    expect(result.draw).toEqual(0)
    expect(result.defender).toEqual(0)
  })

  it('barony flagship should repair and always win vs dreadnought', () => {
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
    attacker.units.flagship = 1
    defender.units.dreadnought = 1

    const result = getBattleReport(attacker, defender, Place.space, 100)

    expect(result.draw).toEqual(0)
    expect(result.defender).toEqual(0)
  })
})
