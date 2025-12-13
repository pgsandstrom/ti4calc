import { getTestParticipant, testBattleReport } from '../../util/util.test'
import { duraniumArmor } from '../battleeffect/tech'
import { Faction, Place } from '../enums'

describe('Barony of Letnev', () => {
  it('barony should always win with non-euclidian and duranium', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        dreadnought: 2,
      },
      Faction.barony_of_letnev,
      {
        'Non-Euclidean Shielding': 1,
        [duraniumArmor.name]: 1,
      },
    )

    const defender = getTestParticipant('defender', {
      dreadnought: 2,
    })

    testBattleReport(attacker, defender, Place.space, 500, [
      { side: 'attacker', percentage: 1 },
      { side: 'draw', percentage: 0 },
      { side: 'defender', percentage: 0 },
    ])
  })

  it('barony flagship should repair and always win vs dreadnought', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        flagship: 1,
      },
      Faction.barony_of_letnev,
    )

    const defender = getTestParticipant('defender', {
      dreadnought: 1,
    })

    testBattleReport(attacker, defender, Place.space, 500, [
      { side: 'attacker', percentage: 1 },
      { side: 'draw', percentage: 0 },
      { side: 'defender', percentage: 0 },
    ])
  })
})
