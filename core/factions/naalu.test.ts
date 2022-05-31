import getBattleReport from '..'
import { checkResult, getTestParticipant } from '../../util/util.test'
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

    const result = getBattleReport(attacker, defender, Place.ground, DO_BATTLE_X_TIMES)

    checkResult(result.attacker, DO_BATTLE_X_TIMES * 0.477)
    checkResult(result.draw, DO_BATTLE_X_TIMES * 0.044)
    checkResult(result.defender, DO_BATTLE_X_TIMES * 0.479)
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

    const result = getBattleReport(attacker, defender, Place.ground, DO_BATTLE_X_TIMES)

    checkResult(result.attacker, 0)
    checkResult(result.draw, DO_BATTLE_X_TIMES * 0.908)
    checkResult(result.defender, DO_BATTLE_X_TIMES * 0.092)
  })

  it.only('Naalu fighters should not be sent back to space just because enemy temporarily have zero units', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        flagship: 1,
        fighter: 10,
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

    const result = getBattleReport(attacker, defender, Place.ground, DO_BATTLE_X_TIMES)

    checkResult(result.attacker, DO_BATTLE_X_TIMES * 1)
    checkResult(result.draw, DO_BATTLE_X_TIMES * 0)
    checkResult(result.defender, DO_BATTLE_X_TIMES * 0)
  })
})
