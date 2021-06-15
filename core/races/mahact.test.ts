import getBattleReport from '..'
import { checkResult, getTestParticipant } from '../../util/util.test'
import { Race, Place } from '../enums'
import { DO_BATTLE_X_TIMES } from '../index.test'

describe('Mahact', () => {
  it('Mahact flagship with bonus should be strong', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        flagship: 1,
        dreadnought: 3,
      },
      Race.mahact,
      {
        'Mahact flagship bonus': 1,
      },
    )

    const defender = getTestParticipant('defender', {
      dreadnought: 5,
    })

    const result = getBattleReport(attacker, defender, Place.space, DO_BATTLE_X_TIMES)

    checkResult(result.attacker, DO_BATTLE_X_TIMES * 0.305)
    checkResult(result.draw, DO_BATTLE_X_TIMES * 0.102)
    checkResult(result.defender, DO_BATTLE_X_TIMES * 0.592)
  })
})
