import { describe, it } from 'node:test'

import { getTestParticipant, testBattleReport } from '../../util/util.test'
import { TEST_NUMBER_OF_ROLLS } from '../constant'
import { Faction, Place } from '../enums'

describe('L1z1x', () => {
  it('ground combat with l1z1x harrow ability', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        dreadnought: 3,
        infantry: 5,
      },
      Faction.l1z1x,
    )

    const defender = getTestParticipant('defender', {
      infantry: 8,
    })

    testBattleReport(attacker, defender, Place.ground, TEST_NUMBER_OF_ROLLS, [
      { side: 'attacker', percentage: 0.803 },
      { side: 'draw', percentage: 0.063 },
      { side: 'defender', percentage: 0.132 },
    ])
  })

  it('L1z1x flagship makes flagship and dreadnoughts target non-fighter ships', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        flagship: 1,
        dreadnought: 4,
      },
      Faction.l1z1x,
    )

    const defender = getTestParticipant('defender', {
      dreadnought: 5,
      fighter: 3,
    })

    testBattleReport(attacker, defender, Place.space, TEST_NUMBER_OF_ROLLS, [
      { side: 'attacker', percentage: 0.296 },
      { side: 'draw', percentage: 0.021 },
      { side: 'defender', percentage: 0.682 },
    ])
  })
})
