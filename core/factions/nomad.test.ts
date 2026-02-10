import { describe, it } from 'node:test'

import { TEST_NUMBER_OF_ROLLS } from '@/core/constant'
import { getTestParticipant, testBattleReport } from '@/util/util.test'

describe('Nomad', () => {
  it('Nomad upgraded flagship should be better than base flagship', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        flagship: 1,
      },
      'Nomad',
      {},
      {
        flagship: true,
      },
    )

    const defender = getTestParticipant(
      'defender',
      {
        flagship: 1,
      },
      'Nomad',
    )

    testBattleReport(attacker, defender, 'space', TEST_NUMBER_OF_ROLLS, [
      { side: 'attacker', percentage: 0.558 },
      { side: 'draw', percentage: 0.263 },
      { side: 'defender', percentage: 0.179 },
    ])
  })
})
