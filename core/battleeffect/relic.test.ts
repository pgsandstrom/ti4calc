import { describe, it } from 'node:test'

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

    testBattleReport(attacker, defender, Place.space, TEST_NUMBER_OF_ROLLS, [
      { side: 'attacker', percentage: 0.61 },
      { side: 'draw', percentage: 0.04 },
      { side: 'defender', percentage: 0.35 },
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

    testBattleReport(attacker, defender, Place.ground, TEST_NUMBER_OF_ROLLS, [
      { side: 'attacker', percentage: 0.67 },
      { side: 'draw', percentage: 0.03 },
      { side: 'defender', percentage: 0.3 },
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
