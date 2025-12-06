import { getTestParticipant, testBattleReport } from '../../util/util.test'
import { Faction, Place } from '../enums'
import { DO_BATTLE_X_TIMES } from '../index.test'

describe('Hacan', () => {
  it('Hacan flagship should give different results with different numbers of trade goods bonuses', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        flagship: 1,
        cruiser: 5,
      },
      Faction.hacan,
      {
        'Hacan flagship trade goods': 1,
      },
    )

    const defender = getTestParticipant(
      'defender',
      {
        flagship: 1,
        cruiser: 5,
      },
      Faction.muaat,
    )

    testBattleReport(attacker, defender, Place.space, DO_BATTLE_X_TIMES, [
      { side: 'attacker', percentage: 0.386 },
      { side: 'draw', percentage: 0.106 },
      { side: 'defender', percentage: 0.507 },
    ])

    attacker.battleEffects['Hacan flagship trade goods'] = 100

    testBattleReport(attacker, defender, Place.space, DO_BATTLE_X_TIMES, [
      { side: 'attacker', percentage: 0.469 },
      { side: 'draw', percentage: 0.117 },
      { side: 'defender', percentage: 0.413 },
    ])
  })
})
