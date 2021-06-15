import getBattleReport from '..'
import { checkResult, getTestParticipant } from '../../util/util.test'
import { Race, Place } from '../enums'
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
      Race.naaz_rokha,
    )

    const defender = getTestParticipant('defender', {
      mech: 2,
      infantry: 5,
    })

    const result = getBattleReport(attacker, defender, Place.ground, DO_BATTLE_X_TIMES)

    checkResult(result.attacker, DO_BATTLE_X_TIMES * 0.44)
    checkResult(result.draw, DO_BATTLE_X_TIMES * 0.086)
    checkResult(result.defender, DO_BATTLE_X_TIMES * 0.474)
  })

  it('Naaz-Rokha mech should help in space combat', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        dreadnought: 2,
        mech: 1,
      },
      Race.naaz_rokha,
    )

    const defender = getTestParticipant('defender', {
      dreadnought: 2,
    })

    const result = getBattleReport(attacker, defender, Place.space, DO_BATTLE_X_TIMES)

    checkResult(result.attacker, DO_BATTLE_X_TIMES * 0.796)
    checkResult(result.draw, DO_BATTLE_X_TIMES * 0.062)
    checkResult(result.defender, DO_BATTLE_X_TIMES * 0.142)
  })
})
