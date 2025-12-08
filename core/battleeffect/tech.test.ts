import { checkResult, getTestParticipant } from '../../util/util.test'
import getBattleReport from '..'
import { Faction, Place } from '../enums'
import { DO_BATTLE_X_TIMES } from '../index.test'
import { assaultCannon, duraniumArmor, plasmaScoring, x89BacterialWeapon } from './tech'

describe('Tech', () => {
  it('5v5 dreadnought with duranium', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        dreadnought: 5,
      },
      undefined,
      {
        [duraniumArmor.name]: 1,
      },
    )

    const defender = getTestParticipant('defender', {
      dreadnought: 5,
    })

    const result = getBattleReport(attacker, defender, Place.space, DO_BATTLE_X_TIMES)

    checkResult(result.attacker, DO_BATTLE_X_TIMES * 0.67)
    checkResult(result.draw, DO_BATTLE_X_TIMES * 0.0167)
    checkResult(result.defender, DO_BATTLE_X_TIMES * 0.313)
  })

  it('Assault cannon should not snipe mech', () => {
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

    const defender = getTestParticipant('defender', {
      cruiser: 1,
      mech: 1,
    })

    const result = getBattleReport(attacker, defender, Place.space, 100)

    expect(result.attacker).toEqual(100)
  })

  it('Assault cannon should not happen if PDS destroys one of the 3 ships', () => {
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
        pds: 1,
        warsun: 1,
      },
      undefined,
      {
        [plasmaScoring.name]: 1,
      },
    )
    const result = getBattleReport(attacker, defender, Place.space, DO_BATTLE_X_TIMES)
    expect(result.attacker).toBeLessThan(DO_BATTLE_X_TIMES / 2)
  })

  it('x89BacterialWeapon simple', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        mech: 1,
      },
      undefined,
      {
        [x89BacterialWeapon.name]: 1,
      },
    )

    const defender = getTestParticipant(
      'defender',
      {
        mech: 1,
      },
      Faction.mentak,
    )

    const result = getBattleReport(attacker, defender, Place.ground, DO_BATTLE_X_TIMES)

    checkResult(result.attacker, DO_BATTLE_X_TIMES * 0.33)
    checkResult(result.draw, DO_BATTLE_X_TIMES * 0.33)
    checkResult(result.defender, DO_BATTLE_X_TIMES * 0.33)
  })

  it('x89BacterialWeapon bombardment', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        dreadnought: 1,
      },
      undefined,
      {
        [x89BacterialWeapon.name]: 1,
      },
    )

    const defender = getTestParticipant('defender', {
      infantry: 2,
    })

    const result = getBattleReport(attacker, defender, Place.ground, DO_BATTLE_X_TIMES)

    checkResult(result.attacker, DO_BATTLE_X_TIMES * 0)
    checkResult(result.draw, DO_BATTLE_X_TIMES * 0.6)
    checkResult(result.defender, DO_BATTLE_X_TIMES * 0.4)
  })
})
