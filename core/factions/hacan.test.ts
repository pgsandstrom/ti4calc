import { describe, it } from 'node:test'

import { TEST_NUMBER_OF_ROLLS } from '@/core/constant'
import { getTestParticipant, testBattleReport } from '@/util/util.test'

describe('Hacan', () => {
  it('Hacan flagship should give different results with different numbers of trade goods bonuses', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        flagship: 1,
        cruiser: 5,
      },
      'Hacan',
      {
        'Hacan flagship trade goods': 1,
      },
    )

    const defender = getTestParticipant(
      'defender',
      {
        flagship: 1,
        cruiser: 5,
      },
      'Muaat',
    )

    testBattleReport(attacker, defender, 'space', TEST_NUMBER_OF_ROLLS, [
      { side: 'attacker', percentage: 0.386 },
      { side: 'draw', percentage: 0.106 },
      { side: 'defender', percentage: 0.507 },
    ])

    attacker.battleEffects['Hacan flagship trade goods'] = 100

    testBattleReport(attacker, defender, 'space', TEST_NUMBER_OF_ROLLS, [
      { side: 'attacker', percentage: 0.469 },
      { side: 'draw', percentage: 0.117 },
      { side: 'defender', percentage: 0.413 },
    ])
  })
})
