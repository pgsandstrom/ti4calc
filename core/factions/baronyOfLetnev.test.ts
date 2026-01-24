import { describe, it } from 'node:test'

import { duraniumArmor } from '@/core/battleeffect/tech'
import { getTestParticipant, testBattleReport } from '@/util/util.test'

describe('Barony of Letnev', () => {
  it('barony should always win with non-euclidian and duranium', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        dreadnought: 2,
      },
      'Barony of Letnev',
      {
        'Non-Euclidean Shielding': 1,
        [duraniumArmor.name]: 1,
      },
    )

    const defender = getTestParticipant('defender', {
      dreadnought: 2,
    })

    testBattleReport(attacker, defender, 'space', 500, [
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
      'Barony of Letnev',
    )

    const defender = getTestParticipant('defender', {
      dreadnought: 1,
    })

    testBattleReport(attacker, defender, 'space', 500, [
      { side: 'attacker', percentage: 1 },
      { side: 'draw', percentage: 0 },
      { side: 'defender', percentage: 0 },
    ])
  })
})
