import { getTestParticipant, testBattleReport } from '../../util/util.test'
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

    testBattleReport(attacker, defender, Place.space, DO_BATTLE_X_TIMES, [
      { side: 'attacker', percentage: 1 },
      { side: 'draw', percentage: 0 },
      { side: 'defender', percentage: 0 },
    ])
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

    testBattleReport(attacker, defender, Place.space, DO_BATTLE_X_TIMES, [
      { side: 'attacker', percentage: 1 },
      { side: 'draw', percentage: 0 },
      { side: 'defender', percentage: 0 },
    ])
  })

  // TODO this test name doesnt match the content.
  // Also I am pretty sure this is a bug. See this rule:
  // 1.18 Each ability can be resolved once for each occurrence of that ability’s timing event. For example, if an ability is resolved “At the start of combat,” it can be resolved at the start of each combat.
  // But it might be difficult to fix...
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

    testBattleReport(attacker, defender, Place.space, DO_BATTLE_X_TIMES, [
      { side: 'attacker', percentage: 1 },
      { side: 'draw', percentage: 0 },
      { side: 'defender', percentage: 0 },
    ])
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

    testBattleReport(attacker, defender, Place.space, DO_BATTLE_X_TIMES, [
      { side: 'attacker', percentage: attackerWin / totalChance },
      { side: 'draw', percentage: draw / totalChance },
      { side: 'defender', percentage: defenderWinChance / totalChance },
    ])
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

    testBattleReport(attacker, defender, Place.space, DO_BATTLE_X_TIMES, [
      { side: 'attacker', percentage: 0 },
      { side: 'draw', percentage: 0 },
      { side: 'defender', percentage: 1 },
    ])
  })
})
