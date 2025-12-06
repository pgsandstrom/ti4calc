import { getTestParticipant, testBattleReport } from '../../util/util.test'
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

    testBattleReport(attacker, defender, Place.space, DO_BATTLE_X_TIMES, [
      { side: 'attacker', percentage: 0.642 },
      { side: 'draw', percentage: 0 },
      { side: 'defender', percentage: 0.358 },
    ])

    // and the results should be equal even with attacker/defender flipped:

    defender.side = 'attacker'
    attacker.side = 'defender'

    testBattleReport(defender, attacker, Place.space, DO_BATTLE_X_TIMES, [
      { side: 'attacker', percentage: 0.358 },
      { side: 'draw', percentage: 0 },
      { side: 'defender', percentage: 0.642 },
    ])
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

    testBattleReport(attacker, defender, Place.ground, DO_BATTLE_X_TIMES, [
      { side: 'attacker', percentage: 0.41 },
      { side: 'draw', percentage: 0.101 },
      { side: 'defender', percentage: 0.49 },
    ])
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

    testBattleReport(attacker, defender, Place.space, DO_BATTLE_X_TIMES, [
      { side: 'attacker', percentage: 0.323 },
      { side: 'draw', percentage: 0.354 },
      { side: 'defender', percentage: 0.323 },
    ])
  })

  it('Mentak mech should not affect sustain during bombardment', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        mech: 1,
        dreadnought: 1,
      },
      Faction.mentak,
    )

    const defender = getTestParticipant(
      'defender',
      {
        mech: 1,
      },
      Faction.mentak,
    )

    testBattleReport(attacker, defender, Place.ground, DO_BATTLE_X_TIMES, [
      { side: 'attacker', percentage: 0.333 },
      { side: 'draw', percentage: 0.333 },
      { side: 'defender', percentage: 0.333 },
    ])
  })

  it('Mentak mech should affect sustain during PDS defence', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        mech: 1,
      },
      Faction.mentak,
    )

    const defender = getTestParticipant(
      'defender',
      {
        mech: 1,
        pds: 1,
      },
      Faction.mentak,
    )

    testBattleReport(attacker, defender, Place.ground, DO_BATTLE_X_TIMES, [
      { side: 'attacker', percentage: 1 / 6 },
      { side: 'draw', percentage: 1 / 6 },
      { side: 'defender', percentage: 2 / 3 },
    ])
  })
})
