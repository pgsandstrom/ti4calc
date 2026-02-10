import { describe, it } from 'node:test'

import { TEST_NUMBER_OF_ROLLS } from '@/core/constant'
import { getTestParticipant, testBattleReport } from '@/util/util.test'

describe('Crimson Rebellion', () => {
  it('Crimson Rebellion upgraded destroyers should be better than base destroyers', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        destroyer: 2,
      },
      'Crimson Rebellion',
      {},
      {
        destroyer: true,
      },
    )

    const defender = getTestParticipant(
      'defender',
      {
        destroyer: 2,
      },
      'Crimson Rebellion',
    )

    testBattleReport(attacker, defender, 'space', TEST_NUMBER_OF_ROLLS, [
      { side: 'attacker', percentage: 0.584 },
      { side: 'draw', percentage: 0.087 },
      { side: 'defender', percentage: 0.329 },
    ])
  })
})
