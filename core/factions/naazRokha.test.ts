import { getTestParticipant, testBattleReport } from '../../util/util.test'
import { Faction, Place } from '../enums'
import { DO_BATTLE_X_TIMES } from '../index.test'

describe('Naaz-Rokha', () => {
  it('Naaz-Rokha flagship should help in ground combat', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        flagship: 1,
        mech: 1,
        infantry: 5,
      },
      Faction.naaz_rokha,
    )

    const defender = getTestParticipant('defender', {
      mech: 2,
      infantry: 5,
    })

    testBattleReport(attacker, defender, Place.ground, DO_BATTLE_X_TIMES, [
      { side: 'attacker', percentage: 0.44 },
      { side: 'draw', percentage: 0.086 },
      { side: 'defender', percentage: 0.474 },
    ])
  })

  it('Naaz-Rokha mech should help in space combat', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        dreadnought: 2,
        mech: 1,
      },
      Faction.naaz_rokha,
    )

    const defender = getTestParticipant('defender', {
      dreadnought: 2,
    })

    testBattleReport(attacker, defender, Place.space, DO_BATTLE_X_TIMES, [
      { side: 'attacker', percentage: 0.796 },
      { side: 'draw', percentage: 0.062 },
      { side: 'defender', percentage: 0.142 },
    ])
  })
})
