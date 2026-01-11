import { getTestParticipant, testBattleReport } from '../../util/util.test'
import { TEST_NUMBER_OF_ROLLS } from '../constant'
import { Faction, Place } from '../enums'

describe('creuss', () => {
  it('Dimensional splicer should work', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        destroyer: 2,
      },
      Faction.creuss,
      {
        'Dimensional Splicer': 1,
      },
    )

    const defender = getTestParticipant('defender', {
      destroyer: 2,
      cruiser: 1,
    })

    testBattleReport(attacker, defender, Place.space, TEST_NUMBER_OF_ROLLS, [
      { side: 'attacker', percentage: 0.479 },
      { side: 'draw', percentage: 0.042 },
      { side: 'defender', percentage: 0.479 },
    ])
  })
})
