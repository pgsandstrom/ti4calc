import assert from 'node:assert'
import { describe, it } from 'node:test'

import { getBattleReport } from '@/core'
import { getTestParticipant } from '@/util/util.test'

describe('Yin', () => {
  it('suicided units should be cleaned up before they get to fire', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        destroyer: 1,
      },
      'Yin',
      {
        'Impulse Core': 1,
      },
    )

    const defender = getTestParticipant('defender', {
      destroyer: 2,
    })

    const result = getBattleReport(attacker, defender, 'space', 100)

    assert.strictEqual(result.defender, 100)
  })
})
