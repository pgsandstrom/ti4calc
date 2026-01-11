import { getTestParticipant, testBattleReport } from '../../util/util.test'
import { solarFlare } from '../battleeffect/actioncard'
import { TEST_NUMBER_OF_ROLLS } from '../constant'
import { Faction, Place } from '../enums'

describe('keleres', () => {
  it('mecatol space cannon to work', () => {
    const attacker = getTestParticipant('attacker', {
      fighter: 1,
    })

    const defender = getTestParticipant('defender', {}, Faction.keleres, {
      'I.I.H.Q. MODERNIZATION space cannon': 1,
    })

    testBattleReport(attacker, defender, Place.space, TEST_NUMBER_OF_ROLLS, [
      { side: 'attacker', percentage: 0.4 },
      { side: 'draw', percentage: 0.6 },
      { side: 'defender', percentage: 0 },
    ])
  })

  it('mecatol space cannon to NOT work with solar flare', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        fighter: 1,
      },
      undefined,
      {
        [solarFlare.name]: 1,
      },
    )

    const defender = getTestParticipant('defender', {}, Faction.keleres, {
      'I.I.H.Q. MODERNIZATION space cannon': 1,
    })

    testBattleReport(attacker, defender, Place.space, TEST_NUMBER_OF_ROLLS, [
      { side: 'attacker', percentage: 1 },
      { side: 'draw', percentage: 0 },
      { side: 'defender', percentage: 0 },
    ])
  })
})
