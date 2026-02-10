import { describe, it } from 'node:test'

import { TEST_NUMBER_OF_ROLLS } from '@/core/constant'
import { getTestParticipant, testBattleReport } from '@/util/util.test'

describe('Neutral', () => {
  it('Neutral infantry should be stronger than default infantry', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        infantry: 2,
      },
      'Neutral',
    )

    const defender = getTestParticipant('defender', {
      infantry: 2,
    })

    testBattleReport(attacker, defender, 'ground', TEST_NUMBER_OF_ROLLS, [
      { side: 'attacker', percentage: 0.677 },
      { side: 'draw', percentage: 0.096 },
      { side: 'defender', percentage: 0.227 },
    ])
  })
})
