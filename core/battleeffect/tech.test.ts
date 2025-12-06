import { getTestParticipant, testBattleReport } from '../../util/util.test'
import getBattleReport from '..'
import { Faction, Place } from '../enums'
import { DO_BATTLE_X_TIMES } from '../index.test'
import { assaultCannon, duraniumArmor, x89BacterialWeapon } from './tech'

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

    testBattleReport(attacker, defender, Place.space, DO_BATTLE_X_TIMES, [
      { side: 'attacker', percentage: 0.67 },
      { side: 'draw', percentage: 0.0167 },
      { side: 'defender', percentage: 0.313 },
    ])
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

    testBattleReport(attacker, defender, Place.ground, DO_BATTLE_X_TIMES, [
      { side: 'attacker', percentage: 0.33 },
      { side: 'draw', percentage: 0.33 },
      { side: 'defender', percentage: 0.33 },
    ])
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

    testBattleReport(attacker, defender, Place.ground, DO_BATTLE_X_TIMES, [
      { side: 'attacker', percentage: 0 },
      { side: 'draw', percentage: 0.6 },
      { side: 'defender', percentage: 0.4 },
    ])
  })
})
