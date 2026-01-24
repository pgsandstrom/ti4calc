import assert from 'node:assert'
import { describe, it } from 'node:test'

import { getBattleReport } from '@/core'
import {
  assaultCannon,
  duraniumArmor,
  plasmaScoring,
  x89BacterialWeapon,
} from '@/core/battleeffect/tech'
import { TEST_NUMBER_OF_ROLLS } from '@/core/constant'
import { getTestParticipant, testBattleReport } from '@/util/util.test'

describe('Tech', () => {
  it('5v5 dreadnought with duranium', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        dreadnought: 5,
      },
      undefined,
      {
        [duraniumArmor.name]: 1,
      },
    )

    const defender = getTestParticipant('defender', {
      dreadnought: 5,
    })

    testBattleReport(attacker, defender, 'space', TEST_NUMBER_OF_ROLLS, [
      { side: 'attacker', percentage: 0.655 },
      { side: 'draw', percentage: 0.019 },
      { side: 'defender', percentage: 0.325 },
    ])
  })

  it('Assault cannon should not snipe mech', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        destroyer: 3,
      },
      undefined,
      {
        [assaultCannon.name]: 1,
      },
    )

    const defender = getTestParticipant('defender', {
      cruiser: 1,
      mech: 1,
    })

    const result = getBattleReport(attacker, defender, 'space', 100)

    assert.strictEqual(result.attacker, 100)
  })

  it('Assault cannon should not happen if PDS destroys one of the 3 ships', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        destroyer: 3,
      },
      undefined,
      {
        [assaultCannon.name]: 1,
      },
    )
    const defender = getTestParticipant(
      'defender',
      {
        pds: 1,
        warsun: 1,
      },
      undefined,
      {
        [plasmaScoring.name]: 1,
      },
    )
    const result = getBattleReport(attacker, defender, 'space', TEST_NUMBER_OF_ROLLS)
    assert.ok(result.attacker < TEST_NUMBER_OF_ROLLS / 2)
  })

  it('x89BacterialWeapon simple', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        mech: 1,
      },
      undefined,
      {
        [x89BacterialWeapon.name]: 1,
      },
    )

    const defender = getTestParticipant(
      'defender',
      {
        mech: 1,
      },
      'Mentak',
    )

    testBattleReport(attacker, defender, 'ground', TEST_NUMBER_OF_ROLLS, [
      { side: 'attacker', percentage: 0.33 },
      { side: 'draw', percentage: 0.33 },
      { side: 'defender', percentage: 0.33 },
    ])
  })

  it('x89BacterialWeapon bombardment', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        dreadnought: 1,
      },
      undefined,
      {
        [x89BacterialWeapon.name]: 1,
      },
    )

    const defender = getTestParticipant('defender', {
      infantry: 2,
    })

    testBattleReport(attacker, defender, 'ground', TEST_NUMBER_OF_ROLLS, [
      { side: 'attacker', percentage: 0 },
      { side: 'draw', percentage: 0.6 },
      { side: 'defender', percentage: 0.4 },
    ])
  })
})
