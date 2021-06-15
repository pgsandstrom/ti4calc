import getBattleReport from '..'
import { checkResult, getTestParticipant } from '../../util/util.test'
import { Place } from '../enums'
import { DO_BATTLE_X_TIMES } from '../index.test'
import { emergencyRepairs } from './actioncard'

describe('Action card', () => {
  it('Emergency Repairs', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        dreadnought: 2,
      },
      undefined,
      {
        [emergencyRepairs.name]: 1,
      },
    )
    const defender = getTestParticipant('defender', {
      dreadnought: 2,
    })

    const result = getBattleReport(attacker, defender, Place.space, DO_BATTLE_X_TIMES)

    checkResult(result.attacker, DO_BATTLE_X_TIMES * 0.778)
    checkResult(result.draw, DO_BATTLE_X_TIMES * 0.07)
    checkResult(result.defender, DO_BATTLE_X_TIMES * 0.152)
  })
})
