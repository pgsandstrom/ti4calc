import { getTestParticipant, testBattleReport } from '../../util/util.test'
import { Faction, Place } from '../enums'
import { DO_BATTLE_X_TIMES } from '../index.test'
import { metaliVoidArmaments } from './relic'

describe('Tech', () => {
  it('Metali Void Armaments should not be buffed by argent commander or promissary note', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        // no units
      },
      Faction.argent_flight,
      {
        [metaliVoidArmaments.name]: 1,
        ['Strike Wing Ambuscade']: 1,
        ['Argent Flight Commander']: 1,
      },
    )

    const defender = getTestParticipant('defender', {
      fighter: 2,
    })

    testBattleReport(attacker, defender, Place.space, DO_BATTLE_X_TIMES, [
      { side: 'attacker', percentage: 0 },
      { side: 'draw', percentage: 0.5 },
      { side: 'defender', percentage: 0.5 },
    ])
  })
})
