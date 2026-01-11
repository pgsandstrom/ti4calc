import { getTestParticipant, testBattleReport } from '../../util/util.test'
import { TEST_NUMBER_OF_ROLLS } from '../constant'
import { Faction, Place } from '../enums'
import { heartOfIxth, metaliVoidArmaments } from './relic'

describe('Relics', () => {
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

    testBattleReport(attacker, defender, Place.space, TEST_NUMBER_OF_ROLLS, [
      { side: 'attacker', percentage: 0 },
      { side: 'draw', percentage: 0.5 },
      { side: 'defender', percentage: 0.5 },
    ])
  })

  it('Heart of Ixth should improve attacker rolls and worsen defender rolls', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        destroyer: 2,
      },
      Faction.xxcha,
      {
        [heartOfIxth.name]: 1,
      },
    )

    const defender = getTestParticipant('defender', {
      destroyer: 2,
    })

    // With Heart of Ixth, attacker gets +1 to rolls (destroyer hits on 8, becomes 7 effective)
    // and defender gets -1 to hit (destroyer hits on 8, becomes 9 effective)
    // This should significantly favor the attacker
    testBattleReport(attacker, defender, Place.space, TEST_NUMBER_OF_ROLLS, [
      { side: 'attacker', percentage: 0.85 },
      { side: 'draw', percentage: 0.02 },
      { side: 'defender', percentage: 0.13 },
    ])
  })

  it('Heart of Ixth should work in ground combat', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        infantry: 4,
      },
      Faction.xxcha,
      {
        [heartOfIxth.name]: 1,
      },
    )

    const defender = getTestParticipant('defender', {
      infantry: 4,
    })

    // Heart of Ixth should favor the attacker in ground combat too
    // Infantry hit on 8, so with +1/-1 modifier: attacker hits on 7+ (40%), defender on 9+ (20%)
    testBattleReport(attacker, defender, Place.ground, TEST_NUMBER_OF_ROLLS, [
      { side: 'attacker', percentage: 0.85 },
      { side: 'draw', percentage: 0.02 },
      { side: 'defender', percentage: 0.13 },
    ])
  })

  it('Heart of Ixth should improve bombardment', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        dreadnought: 1,
      },
      Faction.xxcha,
      {
        [heartOfIxth.name]: 1,
      },
    )

    const defender = getTestParticipant('defender', {
      infantry: 1,
    })

    testBattleReport(attacker, defender, Place.ground, TEST_NUMBER_OF_ROLLS, [
      { side: 'attacker', percentage: 0 },
      { side: 'draw', percentage: 0.7 },
      { side: 'defender', percentage: 0.3 },
    ])
  })
})
