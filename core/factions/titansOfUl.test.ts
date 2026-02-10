import { describe, it } from 'node:test'

import { TEST_NUMBER_OF_ROLLS } from '@/core/constant'
import { getTestParticipant, testBattleReport } from '@/util/util.test'

describe('Titans of Ul', () => {
  it('Titans of Ul upgraded pds should be better than base pds in ground combat', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        pds: 2,
      },
      'Titans of Ul',
      {},
      {
        pds: true,
      },
    )

    const defender = getTestParticipant(
      'defender',
      {
        pds: 2,
      },
      'Titans of Ul',
    )

    testBattleReport(attacker, defender, 'ground', TEST_NUMBER_OF_ROLLS, [
      { side: 'attacker', percentage: 0.373 },
      { side: 'draw', percentage: 0.063 },
      { side: 'defender', percentage: 0.564 },
    ])
  })
})
