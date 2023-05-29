import getBattleReport, { BattleReport } from '..'
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

    check1v1InfantryResult(result, 0.4, 0.3)
  })

  it('should have stronger upgraded infantry', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        infantry: 1,
      },
      Faction.sol,
      {},
      {
        infantry: true,
      },
    )

    const defender = getTestParticipant(
      'defender',
      {
        infantry: 1,
      },
      Faction.muaat,
      {},
      {
        infantry: true,
      },
    )

    const result = getBattleReport(attacker, defender, Place.ground, DO_BATTLE_X_TIMES)

    check1v1InfantryResult(result, 0.5, 0.4)
  })
})

function check1v1InfantryResult(
  result: BattleReport,
  attackerHitChance: number,
  defenderHitChance: number,
) {
  const aHitChance = attackerHitChance
  const aMissChance = 1 - aHitChance
  const dHitChance = defenderHitChance
  const dMissChance = 1 - dHitChance
  // using closed form for geometric series
  // P(Muaat missing and Sol hitting) / (1 - P(both missing))
  const attackerWinChance = (dMissChance * aHitChance) / (1 - dMissChance * aMissChance)
  checkResult(result.attacker, DO_BATTLE_X_TIMES * attackerWinChance)
  // P(both hitting) / (1 - P(both missing))
  const drawChance = (dHitChance * aHitChance) / (1 - dMissChance * aMissChance)
  checkResult(result.draw, DO_BATTLE_X_TIMES * drawChance)
  // P(Muaat hitting and Sol missing) / (1 - P(both missing))
  const defenderWinChance = (dHitChance * aMissChance) / (1 - dMissChance * aMissChance)
  checkResult(result.defender, DO_BATTLE_X_TIMES * defenderWinChance)
}
