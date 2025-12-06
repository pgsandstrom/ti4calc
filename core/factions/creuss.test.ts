import { getTestParticipant, testBattleReport } from '../../util/util.test'
import { Faction, Place } from '../enums'
import { DO_BATTLE_X_TIMES } from '../index.test'

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

    testBattleReport(attacker, defender, Place.space, DO_BATTLE_X_TIMES, [
      { side: 'attacker', percentage: 0.479 },
      { side: 'draw', percentage: 0.042 },
      { side: 'defender', percentage: 0.479 },
    ])
  })
})
