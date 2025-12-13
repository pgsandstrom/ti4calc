import { checkResult, getTestParticipant, testBattleReport } from '../../util/util.test'
import { Faction, Place } from '../enums'
import { DO_BATTLE_X_TIMES } from '../index.test'

describe('Argent flight', () => {
  it('Argent flight destroyers should destroy sustain', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        dreadnought: 3,
        destroyer: 3,
      },
      Faction.argent_flight,
      {},
      {
        destroyer: true,
      },
    )

    const defender = getTestParticipant('defender', {
      dreadnought: 3,
      cruiser: 3,
    })

    testBattleReport(attacker, defender, Place.space, DO_BATTLE_X_TIMES, [
      { side: 'attacker', percentage: 0.863 },
      { side: 'draw', percentage: 0.026 },
      { side: 'defender', percentage: 0.111 },
    ])
  })

  it('Argent flight upgraded destroyers should destroy infantry', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        dreadnought: 10,
        infantry: 5,
      },
      Faction.jol_nar,
      {},
      {
        dreadnought: true,
      },
    )

    const defender = getTestParticipant(
      'defender',
      {
        destroyer: 1,
      },
      Faction.argent_flight,
      {},
      {
        destroyer: true,
      },
    )

    const result = testBattleReport(attacker, defender, Place.space, 100_000, [
      { side: 'attacker', percentage: 1.0 },
      { side: 'draw', percentage: 0.0 },
      { side: 'defender', percentage: 0.0 },
    ])

    let noInfantryDestroyed = 0
    for (const [survivors, count] of Object.entries(result.attackerSurvivers)) {
      if (survivors.endsWith('iiiii') && count !== undefined) {
        noInfantryDestroyed += count
      }
    }
    // 80% chans to not kill infantry. 3 AFB shots:  0.8^3 = 0.512
    checkResult(noInfantryDestroyed, result.numberOfRolls * 0.512, true)
  })

  it('Argent flight flagship prevents pds fire in space', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        flagship: 1,
        destroyer: 2,
      },
      Faction.argent_flight,
    )

    const defender = getTestParticipant('defender', {
      destroyer: 2,
      pds: 10,
    })

    testBattleReport(attacker, defender, Place.space, DO_BATTLE_X_TIMES, [
      { side: 'attacker', percentage: 0.99 },
    ])
  })

  it('argent flight upgraded destroyers should perform like cruisers', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        destroyer: 2,
      },
      Faction.argent_flight,
      {},
      {
        destroyer: true,
      },
    )

    const defender = getTestParticipant('defender', {
      cruiser: 2,
    })

    testBattleReport(attacker, defender, Place.space, DO_BATTLE_X_TIMES, [
      { side: 'attacker', percentage: 0.443 },
      { side: 'draw', percentage: 0.113 },
      { side: 'defender', percentage: 0.443 },
    ])
  })

  it('Using Strike Wing ambuscade', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        destroyer: 2,
        pds: 1,
      },
      undefined,
      {
        'Strike Wing Ambuscade': 1,
      },
    )

    const defender = getTestParticipant('defender', {
      destroyer: 2,
    })

    testBattleReport(attacker, defender, Place.space, DO_BATTLE_X_TIMES, [
      { side: 'attacker', percentage: 0.8 },
      { side: 'draw', percentage: 0.024 },
      { side: 'defender', percentage: 0.176 },
    ])
  })
})
