import { getTestParticipant, testBattleReport } from '../../util/util.test'
import { Faction, Place } from '../enums'
import { DO_BATTLE_X_TIMES } from '../index.test'

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

    testBattleReport(attacker, defender, Place.space, DO_BATTLE_X_TIMES, [
      { side: 'attacker', percentage: 0.305 },
      { side: 'draw', percentage: 0.102 },
      { side: 'defender', percentage: 0.592 },
    ])
  })
})
