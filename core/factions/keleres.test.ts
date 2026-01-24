import { describe, it } from 'node:test'

import { solarFlare } from '@/core/battleeffect/actioncard'
import { TEST_NUMBER_OF_ROLLS } from '@/core/constant'
import { getTestParticipant, testBattleReport } from '@/util/util.test'

describe('keleres', () => {
  it('mecatol space cannon to work', () => {
    const attacker = getTestParticipant('attacker', {
      fighter: 1,
    })

    const defender = getTestParticipant('defender', {}, 'Keleres', {
      'I.I.H.Q. MODERNIZATION space cannon': 1,
    })

    testBattleReport(attacker, defender, 'space', TEST_NUMBER_OF_ROLLS, [
      { side: 'attacker', percentage: 0.4 },
      { side: 'draw', percentage: 0.6 },
      { side: 'defender', percentage: 0 },
    ])
  })

  it('mecatol space cannon to NOT work with solar flare', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        fighter: 1,
      },
      undefined,
      {
        [solarFlare.name]: 1,
      },
    )

    const defender = getTestParticipant('defender', {}, 'Keleres', {
      'I.I.H.Q. MODERNIZATION space cannon': 1,
    })

    testBattleReport(attacker, defender, 'space', TEST_NUMBER_OF_ROLLS, [
      { side: 'attacker', percentage: 1 },
      { side: 'draw', percentage: 0 },
      { side: 'defender', percentage: 0 },
    ])
  })
})
