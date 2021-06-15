import getBattleReport from '..'
import { checkResult, getTestParticipant } from '../../util/util.test'
import { Race, Place } from '../enums'
import { DO_BATTLE_X_TIMES } from '../index.test'

describe('Hacan', () => {
  it('Hacan flagship should give different results with different numbers of trade goods bonuses', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        flagship: 1,
        cruiser: 5,
      },
      Race.hacan,
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
      Race.muaat,
    )

    const result = getBattleReport(attacker, defender, Place.space, DO_BATTLE_X_TIMES)

    checkResult(result.attacker, DO_BATTLE_X_TIMES * 0.386)
    checkResult(result.draw, DO_BATTLE_X_TIMES * 0.106)
    checkResult(result.defender, DO_BATTLE_X_TIMES * 0.507)

    attacker.battleEffects['Hacan flagship trade goods'] = 100

    const result2 = getBattleReport(attacker, defender, Place.space, DO_BATTLE_X_TIMES)

    checkResult(result2.attacker, DO_BATTLE_X_TIMES * 0.469)
    checkResult(result2.draw, DO_BATTLE_X_TIMES * 0.117)
    checkResult(result2.defender, DO_BATTLE_X_TIMES * 0.413)
  })
})
