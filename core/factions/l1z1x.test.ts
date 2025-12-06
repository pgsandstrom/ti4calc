import { checkResult, getTestParticipant } from '../../util/util.test'
import getBattleReport from '..'
import { Faction, Place } from '../enums'
import { DO_BATTLE_X_TIMES } from '../index.test'

describe('L1z1x', () => {
  it('ground combat with l1z1x harrow ability', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        dreadnought: 3,
        infantry: 5,
      },
      Faction.l1z1x,
    )

    const defender = getTestParticipant('defender', {
      infantry: 8,
    })

    const result = getBattleReport(attacker, defender, Place.ground, DO_BATTLE_X_TIMES)

    checkResult(result.attacker, DO_BATTLE_X_TIMES * 0.803)
    checkResult(result.draw, DO_BATTLE_X_TIMES * 0.063)
    checkResult(result.defender, DO_BATTLE_X_TIMES * 0.132)
  })

  it('L1z1x flagship makes flagship and dreadnoughts target non-fighter ships', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        flagship: 1,
        dreadnought: 4,
      },
      Faction.l1z1x,
    )

    const defender = getTestParticipant('defender', {
      dreadnought: 5,
      fighter: 3,
    })

    const result = getBattleReport(attacker, defender, Place.space, DO_BATTLE_X_TIMES)

    checkResult(result.attacker, DO_BATTLE_X_TIMES * 0.296)
    checkResult(result.draw, DO_BATTLE_X_TIMES * 0.021)
    checkResult(result.defender, DO_BATTLE_X_TIMES * 0.682)
  })
})
