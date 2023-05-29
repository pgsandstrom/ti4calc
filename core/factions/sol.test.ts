import getBattleReport from '..'
import { checkResult, getTestParticipant } from '../../util/util.test'
import { Faction, Place } from '../enums'
import { DO_BATTLE_X_TIMES } from '../index.test'

describe('Sol', () => {
  it('should have stronger infantry', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        infantry: 1,
      },
      Faction.sol,
    )

    const defender = getTestParticipant(
      'defender',
      {
        infantry: 1,
      },
      Faction.muaat,
    )

    const result = getBattleReport(attacker, defender, Place.ground, DO_BATTLE_X_TIMES)

    // using closed form for geometric series
    // P(Sol hitting, Muaat missing) / (1 - P(both missing))
    const attackerWinChance = (0.7 * 0.4) / (1 - 0.7 * 0.6)
    checkResult(result.attacker, DO_BATTLE_X_TIMES * attackerWinChance)
    // P(both hitting) / (1 - P(both missing))
    const drawChance = (0.3 * 0.4) / (1 - 0.7 * 0.6)
    checkResult(result.draw, DO_BATTLE_X_TIMES * drawChance)
    // P(Sol missing, Sol hitting) / (1 - P(both missing))
    const defenderWinChance = (0.3 * 0.6) / (1 - 0.7 * 0.6)
    checkResult(result.defender, DO_BATTLE_X_TIMES * defenderWinChance)
  })
})
