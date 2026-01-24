import { describe, it } from 'node:test'

import { TEST_NUMBER_OF_ROLLS } from '@/core/constant'
import { getTestParticipant, testBattleReport } from '@/util/util.test'

describe('Firmament', () => {
  it("Heaven's Eye should repair flagship each combat round", () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        flagship: 1,
      },
      'Firmament',
      {
        "Heaven's Eye": 1,
      },
    )

    const defender = getTestParticipant('defender', {
      dreadnought: 1,
    })

    // Flagship repairs each round, so it should almost always win against a dreadnought
    testBattleReport(attacker, defender, 'space', TEST_NUMBER_OF_ROLLS, [
      { side: 'attacker', percentage: 1 },
      { side: 'draw', percentage: 0 },
      { side: 'defender', percentage: 0 },
    ])
  })

  it('Firmament Agent should disable enemy space cannon', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        destroyer: 1,
      },
      'Firmament',
      {
        'Firmament Agent': 1,
      },
    )

    const defender = getTestParticipant('defender', {
      pds: 1,
    })

    testBattleReport(attacker, defender, 'space', TEST_NUMBER_OF_ROLLS, [
      { side: 'attacker', percentage: 1 },
      { side: 'draw', percentage: 0 },
      { side: 'defender', percentage: 0 },
    ])
  })

  it('Asail plot card should give +1 to all combat rolls', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        cruiser: 2,
      },
      'Firmament',
      {
        'Asail (Firmament)': 1,
      },
    )

    const defender = getTestParticipant('defender', {
      cruiser: 2,
    })

    // Asail gives +1 to combat, so cruisers hit on 6 instead of 7
    testBattleReport(attacker, defender, 'space', TEST_NUMBER_OF_ROLLS, [
      { side: 'attacker', percentage: 0.54 },
      { side: 'draw', percentage: 0.135 },
      { side: 'defender', percentage: 0.325 },
    ])
  })

  it('Asail should also boost bombardment', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        dreadnought: 1,
      },
      'Firmament',
      {
        'Asail (Firmament)': 1,
      },
    )

    const defender = getTestParticipant('defender', {
      infantry: 1,
    })

    // Dreadnought bombardment hits on 5+ (60%), with Asail +1 hits on 4+ (70%)
    // If bombardment hits, draw (no ground forces remain)
    // If bombardment misses, defender wins
    testBattleReport(attacker, defender, 'ground', TEST_NUMBER_OF_ROLLS, [
      { side: 'attacker', percentage: 0 },
      { side: 'draw', percentage: 0.7 },
      { side: 'defender', percentage: 0.3 },
    ])
  })
})
