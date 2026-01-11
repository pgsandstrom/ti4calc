import { getTestParticipant, testBattleReport } from '../../util/util.test'
import { TEST_NUMBER_OF_ROLLS } from '../constant'
import { Faction, Place } from '../enums'

describe('Sardakk', () => {
  it('Sardakk vs arborec flagship', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        flagship: 1,
      },
      Faction.sardakk_norr,
    )

    const defender = getTestParticipant(
      'defender',
      {
        flagship: 1,
      },
      Faction.arborec,
    )

    testBattleReport(attacker, defender, Place.space, TEST_NUMBER_OF_ROLLS, [
      { side: 'attacker', percentage: 0.56 },
      { side: 'draw', percentage: 0.26 },
      { side: 'defender', percentage: 0.18 },
    ])
  })

  it('Sardakk mech ability should not trigger during space cannon phase', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        mech: 1,
      },
      Faction.sardakk_norr,
    )

    const defender = getTestParticipant(
      'defender',
      {
        infantry: 1,
        pds: 1,
      },
      Faction.arborec,
    )

    testBattleReport(attacker, defender, Place.ground, TEST_NUMBER_OF_ROLLS, [
      { side: 'attacker', percentage: 0.8 },
      { side: 'draw', percentage: 0.12 },
      { side: 'defender', percentage: 0.08 },
    ])
  })

  // TODO add test to ensure that sardakk flagship does not affect ground combat
})
