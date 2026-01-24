import { describe, it } from 'node:test'

import { TEST_NUMBER_OF_ROLLS } from '@/core/constant'
import { getTestParticipant, testBattleReport } from '@/util/util.test'

describe('Sardakk', () => {
  it('Sardakk vs arborec flagship', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        flagship: 1,
      },
      "Sardakk N'orr",
    )

    const defender = getTestParticipant(
      'defender',
      {
        flagship: 1,
      },
      'Arborec',
    )

    testBattleReport(attacker, defender, 'space', TEST_NUMBER_OF_ROLLS, [
      { side: 'attacker', percentage: 0.56 },
      { side: 'draw', percentage: 0.26 },
      { side: 'defender', percentage: 0.18 },
    ])
  })

  it('Sardakk mech ability should not trigger during space cannon phase', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        mech: 1,
      },
      "Sardakk N'orr",
    )

    const defender = getTestParticipant(
      'defender',
      {
        infantry: 1,
        pds: 1,
      },
      'Arborec',
    )

    testBattleReport(attacker, defender, 'ground', TEST_NUMBER_OF_ROLLS, [
      { side: 'attacker', percentage: 0.792 },
      { side: 'draw', percentage: 0.125 },
      { side: 'defender', percentage: 0.083 },
    ])
  })

  // TODO add test to ensure that sardakk flagship does not affect ground combat
})
