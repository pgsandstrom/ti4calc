import { checkResult, getTestParticipant } from '../../util/util.test'
import getBattleReport from '..'
import { Place } from '../enums'
import { DO_BATTLE_X_TIMES } from '../index.test'
import {
  emergencyRepairs,
  experimentalBattlestation,
  shieldsHolding,
  solarFlare,
} from './actioncard'
import { assaultCannon } from './tech'

describe('Action card', () => {
  it('Emergency Repairs', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        dreadnought: 2,
      },
      undefined,
      {
        [emergencyRepairs.name]: 1,
      },
    )
    const defender = getTestParticipant('defender', {
      dreadnought: 2,
    })

    const result = getBattleReport(attacker, defender, Place.space, DO_BATTLE_X_TIMES)

    checkResult(result.attacker, DO_BATTLE_X_TIMES * 0.778)
    checkResult(result.draw, DO_BATTLE_X_TIMES * 0.07)
    checkResult(result.defender, DO_BATTLE_X_TIMES * 0.152)
  })

  it('Shields holding', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        destroyer: 1,
      },
      undefined,
      {
        [shieldsHolding.name]: 15,
      },
    )
    const defender = getTestParticipant('defender', {
      dreadnought: 2,
    })

    const result = getBattleReport(attacker, defender, Place.space, DO_BATTLE_X_TIMES)

    checkResult(result.attacker, DO_BATTLE_X_TIMES * 0.562)
    checkResult(result.draw, DO_BATTLE_X_TIMES * 0.033)
    checkResult(result.defender, DO_BATTLE_X_TIMES * 0.405)
  })

  it('Experimental battlestation and solar flare', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        destroyer: 1,
      },
      undefined,
      {
        [solarFlare.name]: 1,
      },
    )
    const defender = getTestParticipant('defender', {}, undefined, {
      [experimentalBattlestation.name]: 1,
    })

    const result = getBattleReport(attacker, defender, Place.space, DO_BATTLE_X_TIMES)

    // solar flare should disable experimental battlestation, thus attacker should always win
    expect(result.attacker).toEqual(DO_BATTLE_X_TIMES)
    expect(result.draw).toEqual(0)
    expect(result.defender).toEqual(0)
  })
  it('Experimental battlestation can prevent assault cannon', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        destroyer: 3,
      },
      undefined,
      {
        [assaultCannon.name]: 1,
      },
    )
    const defender = getTestParticipant(
      'defender',
      {
        warsun: 1,
      },
      undefined,
      {
        [experimentalBattlestation.name]: 1,
      },
    )
    const result = getBattleReport(attacker, defender, Place.space, DO_BATTLE_X_TIMES)
    expect(result.attacker).toBeLessThan(DO_BATTLE_X_TIMES / 2)
  })
})
