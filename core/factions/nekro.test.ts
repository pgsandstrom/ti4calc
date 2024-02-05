import getBattleReport from '..'
import { checkResult, getTestParticipant } from '../../util/util.test'
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

    const result = getBattleReport(attacker, defender, Place.ground, DO_BATTLE_X_TIMES)

    checkResult(result.attacker, DO_BATTLE_X_TIMES * 0.46)
    checkResult(result.draw, DO_BATTLE_X_TIMES * 0.08)
    checkResult(result.defender, DO_BATTLE_X_TIMES * 0.46)
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

    const result = getBattleReport(attacker, defender, Place.ground, DO_BATTLE_X_TIMES)

    checkResult(result.attacker, DO_BATTLE_X_TIMES * 0.6)
    checkResult(result.draw, DO_BATTLE_X_TIMES * 0.08)
    checkResult(result.defender, DO_BATTLE_X_TIMES * 0.32)
  })
})
