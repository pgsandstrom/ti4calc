import { getTestParticipant, testBattleReport } from '../../util/util.test'
import { Faction, Place } from '../enums'
import { DO_BATTLE_X_TIMES } from '../index.test'

describe('Necro', () => {
  it('mech ability should not affect infantry', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        infantry: 2,
      },
      Faction.nekro,
      { 'Nekro mech bonus': 1 },
    )

    const defender = getTestParticipant('defender', {
      infantry: 2,
    })

    testBattleReport(attacker, defender, Place.ground, DO_BATTLE_X_TIMES, [
      { side: 'attacker', percentage: 0.463 },
      { side: 'draw', percentage: 0.072 },
      { side: 'defender', percentage: 0.463 },
    ])
  })

  it('mech ability should affect mech', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        infantry: 2,
        mech: 1,
      },
      Faction.nekro,
      { 'Nekro mech bonus': 1 },
    )

    const defender = getTestParticipant('defender', {
      infantry: 2,
      mech: 1,
    })

    testBattleReport(attacker, defender, Place.ground, DO_BATTLE_X_TIMES, [
      { side: 'attacker', percentage: 0.599 },
      { side: 'draw', percentage: 0.084 },
      { side: 'defender', percentage: 0.315 },
    ])
  })
})
