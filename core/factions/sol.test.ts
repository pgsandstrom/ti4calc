import { checkResult, getTestParticipant } from '../../util/util.test'
import { BattleReport, getBattleReport } from '..'
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

  it('should have better ground combat odds with its agent', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        infantry: 1,
      },
      Faction.sol,
      {
        'Sol agent': 1,
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

    const attackerHitChance = 0.4
    const defenderHitChance = 0.4
    const aHit = attackerHitChance
    const aMiss = 1 - aHit
    const dHit = defenderHitChance
    const dMiss = 1 - dHit
    // using closed form for geometric series
    // A = attacker, D = defender, h = hit, m = miss
    // P(Ah Am Dm) +
    // P(Am Ah Dm) +
    // P(Ah Ah Dm) +
    // P(Am Am Dm) * P(Ah Dm) / (1 - P(Am Dm))
    const attackerWinChance =
      aHit * aMiss * dMiss +
      aMiss * aHit * dMiss +
      aHit * aHit * dMiss +
      (aMiss * aMiss * dMiss * aHit * dMiss) / (1 - aMiss * dMiss)
    checkResult(result.attacker, DO_BATTLE_X_TIMES * attackerWinChance)
    // P(Ah Am Dh) +
    // P(Am Ah Dh) +
    // P(Ah Ah Dh) +
    // P(Am Am Dm) * P(Ah Dh) / (1 - P(Am Dm))
    const drawChance =
      aHit * aMiss * dHit +
      aMiss * aHit * dHit +
      aHit * aHit * dHit +
      (aMiss * aMiss * dMiss * aHit * dHit) / (1 - aMiss * dMiss)
    checkResult(result.draw, DO_BATTLE_X_TIMES * drawChance)
    // P(Am Am Dh) + P(Am Am Dm) * P(Am Dh) / (1 - P(Am Dm))
    const defenderWinChance =
      aMiss * aMiss * dHit + (aMiss * aMiss * dMiss * aMiss * dHit) / (1 - aMiss * dMiss)
    checkResult(result.defender, DO_BATTLE_X_TIMES * defenderWinChance)
  })

  it('should have better space combat odds with its upgraded carrier', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        carrier: 1,
      },
      Faction.sol,
      {},
      {
        carrier: true,
      },
    )

    const defender = getTestParticipant(
      'defender',
      {
        carrier: 1,
      },
      Faction.muaat,
      {},
      {
        carrier: true,
      },
    )

    const result = getBattleReport(attacker, defender, Place.space, DO_BATTLE_X_TIMES)

    const attackerHitChance = 0.2
    const defenderHitChance = 0.2
    const aHit = attackerHitChance
    const aMiss = 1 - aHit
    const dHit = defenderHitChance
    const dMiss = 1 - dHit
    // A = attacker, D = defender, h = hit, m = miss
    // this is the more complicated case
    // 1. defender always misses,
    // 2. both hit at the same time
    // 3. defender hits once before attacker hits at some point after
    // double summation produces the squared denominator
    // (P(Ah Dm) + P(Ah Dh)) / (1 - P(Am Dm)) + P(Am Dh) * P(Ah Dm) / (1 - P(Am Dm))^2
    const attackerWinChance =
      (aHit * dMiss + aHit * dHit) / (1 - aMiss * dMiss) +
      (aMiss * dHit * aHit * dMiss) / (1 - aMiss * dMiss) / (1 - aMiss * dMiss)
    checkResult(result.attacker, DO_BATTLE_X_TIMES * attackerWinChance)
    // defender hits once before they both hit at some point after
    // P(Ah Dh) * P(Am Dh) / (1 - P(Am Dm))^2
    const drawChance = (aHit * dHit * aMiss * dHit) / (1 - aMiss * dMiss) / (1 - aMiss * dMiss)
    checkResult(result.draw, DO_BATTLE_X_TIMES * drawChance)
    // same as draw, but instead of ending on both hitting, it's only the defender hitting:
    // P(Am Dh) * P(Am Dh) / (1 - P(Am Dm))^2
    const defenderWinChance =
      (aMiss * dHit * aMiss * dHit) / (1 - aMiss * dMiss) / (1 - aMiss * dMiss)
    checkResult(result.defender, DO_BATTLE_X_TIMES * defenderWinChance)
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
  // P(defender missing and attacker hitting) / (1 - P(both missing))
  const attackerWinChance = (dMissChance * aHitChance) / (1 - dMissChance * aMissChance)
  checkResult(result.attacker, DO_BATTLE_X_TIMES * attackerWinChance)
  // P(both hitting) / (1 - P(both missing))
  const drawChance = (dHitChance * aHitChance) / (1 - dMissChance * aMissChance)
  checkResult(result.draw, DO_BATTLE_X_TIMES * drawChance)
  // P(defender hitting and attacker missing) / (1 - P(both missing))
  const defenderWinChance = (dHitChance * aMissChance) / (1 - dMissChance * aMissChance)
  checkResult(result.defender, DO_BATTLE_X_TIMES * defenderWinChance)
}
