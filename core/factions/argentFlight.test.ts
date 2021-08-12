import getBattleReport from '..'
import { checkResult, getTestParticipant } from '../../util/util.test'
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

    const result = getBattleReport(attacker, defender, Place.space, DO_BATTLE_X_TIMES)

    checkResult(result.attacker, DO_BATTLE_X_TIMES * 0.863)
    checkResult(result.draw, DO_BATTLE_X_TIMES * 0.026)
    checkResult(result.defender, DO_BATTLE_X_TIMES * 0.111)
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

    const result = getBattleReport(attacker, defender, Place.space, DO_BATTLE_X_TIMES)

    checkResult(result.attacker, DO_BATTLE_X_TIMES * 0.99)
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

    const result = getBattleReport(attacker, defender, Place.space, DO_BATTLE_X_TIMES)

    checkResult(result.attacker, DO_BATTLE_X_TIMES * 0.443)
    checkResult(result.draw, DO_BATTLE_X_TIMES * 0.113)
    checkResult(result.defender, DO_BATTLE_X_TIMES * 0.443)
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

    const result = getBattleReport(attacker, defender, Place.space, DO_BATTLE_X_TIMES)

    checkResult(result.attacker, DO_BATTLE_X_TIMES * 0.8)
    checkResult(result.draw, DO_BATTLE_X_TIMES * 0.024)
    checkResult(result.defender, DO_BATTLE_X_TIMES * 0.176)
  })
})
