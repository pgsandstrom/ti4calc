import { checkResult, getTestParticipant } from '../../util/util.test'
import getBattleReport from '..'
import { Faction, Place } from '../enums'
import { DO_BATTLE_X_TIMES } from '../index.test'

const ENDLESS_REPAIR = 1000

describe('Empyrean', () => {
  it('Empyrean flagship with endless repairs should always win vs a dread and PDS', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        flagship: 1,
      },
      Faction.empyrean,
      {
        'Empyrean flagship repair': ENDLESS_REPAIR,
      },
    )

    const defender = getTestParticipant(
      'defender',
      {
        dreadnought: 1,
        pds: 1,
      },
      Faction.muaat,
    )

    const result = getBattleReport(attacker, defender, Place.space, DO_BATTLE_X_TIMES)

    checkResult(result.attacker, DO_BATTLE_X_TIMES)
    checkResult(result.draw, 0)
    checkResult(result.defender, 0)
  })

  it('Empyrean flagship with endless repairs and mech should always win vs a mech and PDS', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        flagship: 1,
        mech: 1,
      },
      Faction.empyrean,
      {
        'Empyrean flagship repair': ENDLESS_REPAIR,
      },
    )

    const defender = getTestParticipant(
      'defender',
      {
        pds: 1,
        mech: 1,
      },
      Faction.muaat,
    )

    const result = getBattleReport(attacker, defender, Place.ground, DO_BATTLE_X_TIMES)

    checkResult(result.attacker, DO_BATTLE_X_TIMES)
    checkResult(result.draw, 0)
    checkResult(result.defender, 0)
  })

  it('Empyrean flagship and dread risking direct hit with endless repairs should always beat 2 dread', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        flagship: 1,
      },
      Faction.empyrean,
      {
        'Empyrean flagship repair': ENDLESS_REPAIR,
      },
    )
    attacker.riskDirectHit = true

    const defender = getTestParticipant(
      'defender',
      {
        dreadnought: 1,
      },
      Faction.muaat,
    )

    const result = getBattleReport(attacker, defender, Place.space, DO_BATTLE_X_TIMES)

    checkResult(result.attacker, DO_BATTLE_X_TIMES)
    checkResult(result.draw, 0)
    checkResult(result.defender, 0)
  })

  it('Empyrean flagship with endless repairs should lose more times than it wins vs 1 dread with direct hit', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        flagship: 1,
      },
      Faction.empyrean,
      {
        'Empyrean flagship repair': ENDLESS_REPAIR,
      },
    )

    const defender = getTestParticipant(
      'defender',
      {
        dreadnought: 1,
      },
      Faction.muaat,
      {
        'Direct Hit': 1,
      },
    )

    const attackerHitChance = 0.6
    const defenderHitChance = 0.6
    const a2Hit = Math.pow(attackerHitChance, 2)
    const aMiss = Math.pow(1 - attackerHitChance, 2)
    const a1Hit = 1 - aMiss - a2Hit
    const dHit = defenderHitChance
    const dMiss = 1 - dHit

    const attackerWin =
      a2Hit * dMiss + a1Hit * dMiss * a1Hit * dMiss + a1Hit * dMiss * a2Hit * dMiss
    const draw = a2Hit * dHit + a1Hit * dMiss * a1Hit * dHit + a1Hit * dMiss * a2Hit * dHit
    const defenderWinChance = aMiss * dHit + a1Hit * dMiss * aMiss * dHit + a1Hit * dHit

    const totalChance = attackerWin + draw + defenderWinChance

    const result = getBattleReport(attacker, defender, Place.space, DO_BATTLE_X_TIMES)

    checkResult(result.attacker, (DO_BATTLE_X_TIMES * attackerWin) / totalChance)
    checkResult(result.draw, (DO_BATTLE_X_TIMES * draw) / totalChance)
    checkResult(result.defender, (DO_BATTLE_X_TIMES * defenderWinChance) / totalChance)
  })

  it("Empyrean flagship with endless repairs should lose a 1v20 fighters, since it can't use sustain multiple times in the same combat round", () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        flagship: 1,
      },
      Faction.empyrean,
      {
        'Empyrean flagship repair': ENDLESS_REPAIR,
      },
    )

    const defender = getTestParticipant(
      'defender',
      {
        fighter: 20,
      },
      Faction.sardakk_norr,
    )

    const result = getBattleReport(attacker, defender, Place.space, DO_BATTLE_X_TIMES)

    checkResult(result.attacker, 0)
    checkResult(result.draw, 0)
    checkResult(result.defender, DO_BATTLE_X_TIMES)
  })
})
