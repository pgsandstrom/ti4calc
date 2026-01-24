import { describe, it } from 'node:test'

import { TEST_NUMBER_OF_ROLLS } from '@/core/constant'
import { getTestParticipant, testBattleReport } from '@/util/util.test'

describe('Necro', () => {
  it('mech ability should not affect infantry', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        infantry: 2,
      },
      'Nekro',
      { 'Nekro mech bonus': 1 },
    )

    const defender = getTestParticipant('defender', {
      infantry: 2,
    })

    testBattleReport(attacker, defender, 'ground', TEST_NUMBER_OF_ROLLS, [
      { side: 'attacker', percentage: 0.463 },
      { side: 'draw', percentage: 0.072 },
      { side: 'defender', percentage: 0.463 },
    ])
  })

  it('mech ability should affect mech', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        infantry: 2,
        mech: 1,
      },
      'Nekro',
      { 'Nekro mech bonus': 1 },
    )

    const defender = getTestParticipant('defender', {
      infantry: 2,
      mech: 1,
    })

    testBattleReport(attacker, defender, 'ground', TEST_NUMBER_OF_ROLLS, [
      { side: 'attacker', percentage: 0.599 },
      { side: 'draw', percentage: 0.084 },
      { side: 'defender', percentage: 0.315 },
    ])
  })
})
