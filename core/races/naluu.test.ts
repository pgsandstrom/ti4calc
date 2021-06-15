import getBattleReport from '..'
import { checkResult, getTestParticipant } from '../../util/util.test'
import { Race, Place } from '../enums'
import { DO_BATTLE_X_TIMES } from '../index.test'

describe('Naluu', () => {
  it('Naluu flagship should help in ground combat', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        flagship: 1,
        fighter: 2,
        infantry: 1,
      },
      Race.naluu,
    )

    const defender = getTestParticipant('defender', {
      infantry: 3,
    })

    const result = getBattleReport(attacker, defender, Place.ground, DO_BATTLE_X_TIMES)

    checkResult(result.attacker, DO_BATTLE_X_TIMES * 0.477)
    checkResult(result.draw, DO_BATTLE_X_TIMES * 0.044)
    checkResult(result.defender, DO_BATTLE_X_TIMES * 0.479)
  })

  it('Naluu fighters should never be able to win ground combat', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        flagship: 1,
        fighter: 2,
      },
      Race.naluu,
    )

    const defender = getTestParticipant('defender', {
      infantry: 1,
    })

    const result = getBattleReport(attacker, defender, Place.ground, DO_BATTLE_X_TIMES)

    checkResult(result.attacker, 0)
    checkResult(result.draw, DO_BATTLE_X_TIMES * 0.908)
    checkResult(result.defender, DO_BATTLE_X_TIMES * 0.092)
  })
})
