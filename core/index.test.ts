import getBattleReport from '.'
import { checkResult, getTestParticipant } from '../util/util.test'
import { Place } from './enums'
import { duraniumArmor } from './battleeffect/tech'

export const DO_BATTLE_X_TIMES = 15000

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

    const result = getBattleReport(attacker, defender, Place.space, DO_BATTLE_X_TIMES)

    checkResult(result.attacker, DO_BATTLE_X_TIMES * 0.438)
    checkResult(result.draw, DO_BATTLE_X_TIMES * 0.123)
    checkResult(result.defender, DO_BATTLE_X_TIMES * 0.438)
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

    const result = getBattleReport(attacker, defender, Place.ground, DO_BATTLE_X_TIMES)

    checkResult(result.attacker, DO_BATTLE_X_TIMES * 0.033)
    checkResult(result.draw, DO_BATTLE_X_TIMES * 0.017)
    checkResult(result.defender, DO_BATTLE_X_TIMES * 0.949)
  })

  it('ground combat with bombardment', () => {
    const attacker = getTestParticipant('attacker', {
      dreadnought: 3,
      infantry: 3,
    })

    const defender = getTestParticipant('defender', {
      infantry: 3,
    })

    const result = getBattleReport(attacker, defender, Place.ground, DO_BATTLE_X_TIMES)

    checkResult(result.attacker, DO_BATTLE_X_TIMES * 0.904)
    checkResult(result.draw, DO_BATTLE_X_TIMES * 0.014)
    checkResult(result.defender, DO_BATTLE_X_TIMES * 0.081)
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

    const result = getBattleReport(attacker, defender, Place.ground, DO_BATTLE_X_TIMES)

    checkResult(result.attacker, DO_BATTLE_X_TIMES * 0.316)
    checkResult(result.draw, DO_BATTLE_X_TIMES * 0.037)
    checkResult(result.defender, DO_BATTLE_X_TIMES * 0.646)
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

    const result = getBattleReport(attacker, defender, Place.ground, DO_BATTLE_X_TIMES)

    checkResult(result.attacker, DO_BATTLE_X_TIMES * 0.82)
    checkResult(result.draw, DO_BATTLE_X_TIMES * 0.028)
    checkResult(result.defender, DO_BATTLE_X_TIMES * 0.152)
  })
})
