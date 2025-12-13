import { getTestParticipant, testBattleReport } from '../util/util.test'
import { duraniumArmor } from './battleeffect/tech'
import { Faction, Place } from './enums'

export const DO_BATTLE_X_TIMES = 20_000

describe('core', () => {
  // TODO add test for damaged units
  it('Make sure battle effect isnt used if set to 0', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        dreadnought: 2,
      },
      undefined,
      {
        [duraniumArmor.name]: 0,
      },
    )

    const defender = getTestParticipant('defender', {
      dreadnought: 2,
    })

    testBattleReport(attacker, defender, Place.space, DO_BATTLE_X_TIMES, [
      { side: 'attacker', percentage: 0.438 },
      { side: 'draw', percentage: 0.123 },
      { side: 'defender', percentage: 0.438 },
    ])
  })

  it('basic ground combat', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        infantry: 2,
      },
      undefined,
      {},
      {
        infantry: true,
      },
    )

    const defender = getTestParticipant('defender', {
      mech: 2,
    })

    testBattleReport(attacker, defender, Place.ground, DO_BATTLE_X_TIMES, [
      { side: 'attacker', percentage: 0.033 },
      { side: 'draw', percentage: 0.017 },
      { side: 'defender', percentage: 0.949 },
    ])
  })

  it('ground combat with bombardment', () => {
    const attacker = getTestParticipant('attacker', {
      dreadnought: 3,
      infantry: 3,
    })

    const defender = getTestParticipant('defender', {
      infantry: 3,
    })

    testBattleReport(attacker, defender, Place.ground, DO_BATTLE_X_TIMES, [
      { side: 'attacker', percentage: 0.904 },
      { side: 'draw', percentage: 0.014 },
      { side: 'defender', percentage: 0.081 },
    ])
  })

  it('ground combat with bombardment but also planetary shield', () => {
    const attacker = getTestParticipant('attacker', {
      dreadnought: 3,
      infantry: 3,
    })

    const defender = getTestParticipant('defender', {
      infantry: 3,
      pds: 1,
    })

    testBattleReport(attacker, defender, Place.ground, DO_BATTLE_X_TIMES, [
      { side: 'attacker', percentage: 0.316 },
      { side: 'draw', percentage: 0.037 },
      { side: 'defender', percentage: 0.646 },
    ])
  })

  it('ground combat with bombardment but also planetary shield... but the planetary shield is DISABLED', () => {
    const attacker = getTestParticipant('attacker', {
      flagship: 1,
      infantry: 3,
    })

    const defender = getTestParticipant('defender', {
      infantry: 3,
      pds: 1,
    })

    testBattleReport(attacker, defender, Place.ground, DO_BATTLE_X_TIMES, [
      { side: 'attacker', percentage: 0.82 },
      { side: 'draw', percentage: 0.028 },
      { side: 'defender', percentage: 0.152 },
    ])
  })

  it('Make sure units killed by anti fighter barrage does not get to shoot', () => {
    const attacker = getTestParticipant('attacker', {
      fighter: 1,
    })

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

    testBattleReport(attacker, defender, Place.space, DO_BATTLE_X_TIMES, [
      { side: 'attacker', percentage: 0.0288 },
      { side: 'draw', percentage: 0.019 },
      { side: 'defender', percentage: 0.952 },
    ])
  })
})
