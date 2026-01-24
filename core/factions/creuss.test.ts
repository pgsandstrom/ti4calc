import { describe, it } from 'node:test'

import { TEST_NUMBER_OF_ROLLS } from '@/core/constant'
import { getTestParticipant, testBattleReport } from '@/util/util.test'

describe('creuss', () => {
  it('Dimensional splicer should work', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        destroyer: 2,
      },
      'Creuss',
      {
        'Dimensional Splicer': 1,
      },
    )

    const defender = getTestParticipant('defender', {
      destroyer: 2,
      cruiser: 1,
    })

    testBattleReport(attacker, defender, 'space', TEST_NUMBER_OF_ROLLS, [
      { side: 'attacker', percentage: 0.479 },
      { side: 'draw', percentage: 0.042 },
      { side: 'defender', percentage: 0.479 },
    ])
  })
})
