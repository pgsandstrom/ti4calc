import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { setupBattle } from '@/core/battleSetup'
import { UnitType } from '@/core/unit'
import { getTestParticipant } from '@/util/util.test'

describe('Neutral', () => {
  it('Neutral infantry should use baseline combat (8)', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        infantry: 1,
      },
      'Neutral',
    )

    const defender = getTestParticipant('defender')

    const battleInstance = setupBattle({ place: 'ground', attacker, defender })
    const infantry = battleInstance.attacker.units.find((u) => u.type === UnitType.infantry)
    if (!infantry?.combat) {
      throw new Error('Expected attacker infantry to exist and have combat data')
    }
    assert.equal(infantry.combat.hit, 8)
  })

  it('Neutral infantry should ignore infantry upgrade toggle', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        infantry: 1,
      },
      'Neutral',
      {},
      {
        infantry: true,
      },
    )

    const defender = getTestParticipant('defender')

    const battleInstance = setupBattle({ place: 'ground', attacker, defender })
    const infantry = battleInstance.attacker.units.find((u) => u.type === UnitType.infantry)
    if (!infantry?.combat) {
      throw new Error('Expected attacker infantry to exist and have combat data')
    }
    assert.equal(infantry.combat.hit, 8)
  })
})
