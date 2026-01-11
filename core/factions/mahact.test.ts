import { getTestParticipant, testBattleReport } from '../../util/util.test'
import { TEST_NUMBER_OF_ROLLS } from '../constant'
import { Faction, Place } from '../enums'

describe('Mahact', () => {
  it('Mahact flagship with bonus should be strong', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        flagship: 1,
        dreadnought: 3,
      },
      Faction.mahact,
      {
        'Mahact flagship bonus': 1,
      },
    )

    const defender = getTestParticipant('defender', {
      dreadnought: 5,
    })

    testBattleReport(attacker, defender, Place.space, TEST_NUMBER_OF_ROLLS, [
      { side: 'attacker', percentage: 0.305 },
      { side: 'draw', percentage: 0.102 },
      { side: 'defender', percentage: 0.592 },
    ])
  })
})
