import getBattleReport from '..'
import { checkResult, getTestParticipant } from '../../util/util.test'
import { Race, Place } from '../enums'
import { DO_BATTLE_X_TIMES } from '../index.test'

describe('creuss', () => {
  it('Dimensional splicer should work', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        destroyer: 2,
      },
      Race.creuss,
      {
        'Dimensional Splicer': 1,
      },
    )

    const defender = getTestParticipant('defender', {
      destroyer: 2,
      cruiser: 1,
    })

    const result = getBattleReport(attacker, defender, Place.space, DO_BATTLE_X_TIMES)

    checkResult(result.attacker, DO_BATTLE_X_TIMES * 0.479)
    checkResult(result.draw, DO_BATTLE_X_TIMES * 0.042)
    checkResult(result.defender, DO_BATTLE_X_TIMES * 0.479)
  })
})
