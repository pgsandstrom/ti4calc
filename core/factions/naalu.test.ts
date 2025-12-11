import { getTestParticipant, testBattleReport } from '../../util/util.test'
import { Faction, Place } from '../enums'
import { DO_BATTLE_X_TIMES } from '../index.test'

describe('Naalu', () => {
  it('Naalu flagship should help in ground combat', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        flagship: 1,
        fighter: 2,
        infantry: 1,
      },
      Faction.naalu,
    )

    const defender = getTestParticipant('defender', {
      infantry: 3,
    })

    testBattleReport(attacker, defender, Place.ground, DO_BATTLE_X_TIMES, [
      { side: 'attacker', percentage: 0.477 },
      { side: 'draw', percentage: 0.044 },
      { side: 'defender', percentage: 0.479 },
    ])
  })

  it('Naalu fighters should never be able to win ground combat', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        flagship: 1,
        fighter: 2,
      },
      Faction.naalu,
    )

    const defender = getTestParticipant('defender', {
      infantry: 1,
    })

    testBattleReport(attacker, defender, Place.ground, DO_BATTLE_X_TIMES, [
      { side: 'attacker', percentage: 0 },
      { side: 'draw', percentage: 0.908 },
      { side: 'defender', percentage: 0.092 },
    ])
  })

  it('Naalu fighters should not be sent back to space just because enemy temporarily have zero units', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        flagship: 1,
        fighter: 20,
        infantry: 1,
      },
      Faction.naalu,
    )

    const defender = getTestParticipant(
      'defender',
      {
        infantry: 1,
      },
      Faction.yin,
      {
        'Yin agent': 1,
      },
    )

    testBattleReport(attacker, defender, Place.ground, DO_BATTLE_X_TIMES, [
      { side: 'attacker', percentage: 1 },
      { side: 'draw', percentage: 0 },
      { side: 'defender', percentage: 0 },
    ])
  })
})
