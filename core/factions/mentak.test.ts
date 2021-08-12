import getBattleReport from '..'
import { checkResult, getTestParticipant } from '../../util/util.test'
import { Faction, Place } from '../enums'
import { DO_BATTLE_X_TIMES } from '../index.test'

describe('Mentak', () => {
  it('Mentak hero should resurrect upgraded units if mentak has the upgrade', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        dreadnought: 1,
      },
      Faction.mentak,
      {
        'Mentak hero': 1,
      },
      {
        destroyer: true,
      },
    )

    const defender = getTestParticipant('defender', {
      destroyer: 4,
    })

    const result = getBattleReport(attacker, defender, Place.space, DO_BATTLE_X_TIMES)

    checkResult(result.attacker, DO_BATTLE_X_TIMES * 0.642)
    checkResult(result.draw, DO_BATTLE_X_TIMES * 0.01)
    checkResult(result.defender, DO_BATTLE_X_TIMES * 0.358)

    // and the results should be equal even with attacker/defender flipped:

    defender.side = 'attacker'
    attacker.side = 'defender'

    const result2 = getBattleReport(defender, attacker, Place.space, DO_BATTLE_X_TIMES)

    checkResult(result2.attacker, DO_BATTLE_X_TIMES * 0.358)
    checkResult(result2.draw, DO_BATTLE_X_TIMES * 0.01)
    checkResult(result2.defender, DO_BATTLE_X_TIMES * 0.642)
  })

  it('Mentak flagship should not affect ground combat', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        flagship: 1,
        infantry: 2,
      },
      Faction.mentak,
      {
        'Mentak hero': 1,
      },
    )

    const defender = getTestParticipant('defender', {
      mech: 1,
    })

    const result = getBattleReport(attacker, defender, Place.ground, DO_BATTLE_X_TIMES)

    checkResult(result.attacker, DO_BATTLE_X_TIMES * 0.41)
    checkResult(result.draw, DO_BATTLE_X_TIMES * 0.101)
    checkResult(result.defender, DO_BATTLE_X_TIMES * 0.49)
  })

  it('Check so preventEnemySustain works symmetrically', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        flagship: 2,
      },
      Faction.mentak,
    )

    const defender = getTestParticipant(
      'defender',
      {
        flagship: 2,
      },
      Faction.mentak,
    )

    const result = getBattleReport(attacker, defender, Place.space, DO_BATTLE_X_TIMES)

    checkResult(result.attacker, DO_BATTLE_X_TIMES * 0.323)
    checkResult(result.draw, DO_BATTLE_X_TIMES * 0.354)
    checkResult(result.defender, DO_BATTLE_X_TIMES * 0.323)
  })
})
