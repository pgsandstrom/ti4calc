import { getTestParticipant } from '../util/util.test'
import { Battle, Participant } from './battle-types'
import { setupBattle } from './battleSetup'
import { Faction, Place } from './enums'
import { UnitType } from './unit'
import {
  getHighestDiceCountUnit,
  getHighestWorthNonSustainUnit,
  getHighestWorthSustainUnit,
  getHighestWorthUnit,
  getLowestWorthSustainUnit,
  getLowestWorthUnit,
  getWeakestCombatUnit,
  isHighestHitUnit,
} from './unitGet'

describe('unitGet', () => {
  const getAttackerInstance = (attacker: Participant, defender: Participant) => {
    const battle: Battle = {
      attacker,
      defender,
      place: Place.space,
    }
    const battleInstance = setupBattle(battle)

    return battleInstance.attacker
  }

  it('getHighestWorthUnit', () => {
    const attacker = getTestParticipant('attacker', {
      warsun: 1,
      flagship: 1,
      dreadnought: 2,
      mech: 1,
      pds: 1,
    })

    const defender = getTestParticipant('defender')

    const participantInstance = getAttackerInstance(attacker, defender)

    const unit = getHighestWorthUnit(participantInstance, Place.space, true)

    expect(unit?.type).toEqual(UnitType.warsun)
  })

  it('getHighestWorthUnit when one is damaged', () => {
    const attacker = getTestParticipant('attacker', {
      dreadnought: 5,
    })

    const defender = getTestParticipant('defender')

    const participantInstance = getAttackerInstance(attacker, defender)

    participantInstance.units.forEach((u, index) => {
      if (index !== 2) {
        u.takenDamage = true
        u.takenDamageRound = 0
      }
    })

    const unit = getHighestWorthUnit(participantInstance, Place.space, true)

    expect(unit?.type).toEqual(UnitType.dreadnought)
    expect(unit?.takenDamage).toEqual(false)
  })

  it('getHighestWorthUnit should return an undamaged sustained', () => {
    const attacker = getTestParticipant('attacker', {
      dreadnought: 5,
    })

    const defender = getTestParticipant('defender')

    const participantInstance = getAttackerInstance(attacker, defender)

    participantInstance.units.forEach((u, index) => {
      if (index === 0) {
        // No damage
        u.usedSustain = true
      }
      if (index === 1) {
        // No damage
        // No sustain
      }
      if (index > 1) {
        u.takenDamage = true
        u.takenDamageRound = 0
      }
    })

    const unit = getHighestWorthUnit(participantInstance, Place.space, true)

    expect(unit?.type).toEqual(UnitType.dreadnought)
    expect(unit?.takenDamage).toEqual(false)
    expect(unit?.usedSustain).toEqual(true)
  })

  it('getHighestWorthUnit should respect place', () => {
    const attacker = getTestParticipant('attacker', {
      destroyer: 1,
      mech: 1,
    })

    const defender = getTestParticipant('defender')

    const participantInstance = getAttackerInstance(attacker, defender)

    const unit = getHighestWorthUnit(participantInstance, Place.space, true)

    expect(unit?.type).toEqual(UnitType.destroyer)
  })

  it('getHighestWorthSustainUnit', () => {
    const attacker = getTestParticipant('attacker', {
      warsun: 1,
      dreadnought: 1,
      destroyer: 1,
      mech: 1,
    })

    const defender = getTestParticipant('defender')

    const participantInstance = getAttackerInstance(attacker, defender)

    const unit = getHighestWorthSustainUnit(participantInstance, Place.space, true)

    expect(unit?.type).toEqual(UnitType.warsun)
  })

  it('getHighestWorthSustainUnit returning undefined', () => {
    const attacker = getTestParticipant('attacker', {
      destroyer: 1,
      mech: 1,
    })

    const defender = getTestParticipant('defender')

    const participantInstance = getAttackerInstance(attacker, defender)

    const unit = getHighestWorthSustainUnit(participantInstance, Place.space, true)

    expect(unit).toEqual(undefined)
  })

  it('getHighestWorthSustainUnit should ignore units that just sustained', () => {
    const attacker = getTestParticipant('attacker', {
      dreadnought: 1,
    })

    const defender = getTestParticipant('defender')

    const participantInstance = getAttackerInstance(attacker, defender)

    participantInstance.units[0].usedSustain = true

    const unit = getHighestWorthSustainUnit(participantInstance, Place.space, true)

    expect(unit).toBeUndefined()
  })

  it('getLowestWorthSustainUnit', () => {
    const attacker = getTestParticipant('attacker', {
      flagship: 1,
      dreadnought: 1,
    })

    const defender = getTestParticipant('defender')

    const participantInstance = getAttackerInstance(attacker, defender)

    const unit = getLowestWorthSustainUnit(participantInstance, Place.space, true)

    expect(unit?.type).toEqual(UnitType.dreadnought)
  })

  it('getLowestWorthSustainUnit should ignore units that just sustained', () => {
    const attacker = getTestParticipant('attacker', {
      dreadnought: 1,
    })

    const defender = getTestParticipant('defender')

    const participantInstance = getAttackerInstance(attacker, defender)

    participantInstance.units[0].usedSustain = true

    const unit = getLowestWorthSustainUnit(participantInstance, Place.space, true)

    expect(unit).toBeUndefined()
  })

  it('getHighestWorthNonSustainUnit', () => {
    const attacker = getTestParticipant('attacker', {
      flagship: 1,
      fighter: 1,
    })

    const defender = getTestParticipant('defender')

    const participantInstance = getAttackerInstance(attacker, defender)

    const unit = getHighestWorthNonSustainUnit(participantInstance, Place.space, true)

    expect(unit?.type).toEqual(UnitType.fighter)
  })

  it('getHighestWorthNonSustainUnit should fetch damaged units', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        flagship: 1,
        fighter: 1,
      },
      Faction.barony_of_letnev,
      {},
      {},
      {
        flagship: 1,
      },
    )

    const defender = getTestParticipant('defender')

    const participantInstance = getAttackerInstance(attacker, defender)

    const unit = getHighestWorthNonSustainUnit(participantInstance, Place.space, true)

    expect(unit?.type).toEqual(UnitType.flagship)
  })

  it('getHighestWorthNonSustainUnit should fetch sustained units', () => {
    const attacker = getTestParticipant('attacker', {
      dreadnought: 1,
    })

    const defender = getTestParticipant('defender')

    const participantInstance = getAttackerInstance(attacker, defender)

    participantInstance.units[0].usedSustain = true

    const unit = getHighestWorthNonSustainUnit(participantInstance, Place.space, true)

    expect(unit?.type).toEqual(UnitType.dreadnought)
    expect(unit?.usedSustain).toEqual(true)
  })

  it('getLowestWorthUnit', () => {
    const attacker = getTestParticipant('attacker', {
      flagship: 1,
      dreadnought: 1,
    })

    const defender = getTestParticipant('defender')

    const participantInstance = getAttackerInstance(attacker, defender)

    const unit = getLowestWorthUnit(participantInstance, Place.space, true)

    expect(unit?.type).toEqual(UnitType.dreadnought)
  })

  it('getLowestWorthUnit should fetch damaged units before sustained', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        dreadnought: 2,
      },
      Faction.barony_of_letnev,
      {},
      {},
      {
        dreadnought: 1,
      },
    )

    const defender = getTestParticipant('defender')

    const participantInstance = getAttackerInstance(attacker, defender)

    participantInstance.units.forEach((u) => {
      if (!u.takenDamage) {
        u.usedSustain = true
      }
    })

    const unit = getLowestWorthUnit(participantInstance, Place.space, true)

    expect(unit?.type).toEqual(UnitType.dreadnought)
    expect(unit?.takenDamage).toEqual(true)
  })

  it('getWeakestCombatUnit should return the unit that has the worst hit', () => {
    const attacker = getTestParticipant('attacker', {
      carrier: 1,
      cruiser: 1,
      mech: 1,
    })

    const defender = getTestParticipant('defender')

    const participantInstance = getAttackerInstance(attacker, defender)

    const unit = getWeakestCombatUnit(participantInstance, Place.space, true)

    expect(unit?.type).toEqual(UnitType.carrier)
  })

  it('getHighestHitUnit', () => {
    const attacker = getTestParticipant('attacker', {
      cruiser: 1,
      destroyer: 1,
      mech: 1,
    })

    const defender = getTestParticipant('defender')

    const participantInstance = getAttackerInstance(attacker, defender)

    const cruiser = participantInstance.units.find((u) => u.type === UnitType.cruiser)!
    const isCruiserHighest = isHighestHitUnit(cruiser, participantInstance, 'combat', Place.space)
    expect(isCruiserHighest).toEqual(true)

    const destroyer = participantInstance.units.find((u) => u.type === UnitType.destroyer)!
    const isDestroyerHighest = isHighestHitUnit(
      destroyer,
      participantInstance,
      'combat',
      Place.space,
    )
    expect(isDestroyerHighest).toEqual(false)
  })

  it('isHighestHitUnit should work with unit upgrades', () => {
    const attacker = getTestParticipant(
      'attacker',
      {
        flagship: 1,
        dreadnought: 1,
      },
      Faction.l1z1x,
      {},
      {
        dreadnought: true,
      },
    )

    const defender = getTestParticipant('defender')

    const participantInstance = getAttackerInstance(attacker, defender)

    const flagShip = participantInstance.units.find((u) => u.type === UnitType.flagship)!
    const isFlagshipHighest = isHighestHitUnit(flagShip, participantInstance, 'combat', Place.space)
    expect(isFlagshipHighest).toEqual(false)

    const dreadnought = participantInstance.units.find((u) => u.type === UnitType.dreadnought)!
    const isDreadnoughtHighest = isHighestHitUnit(
      dreadnought,
      participantInstance,
      'combat',
      Place.space,
    )
    expect(isDreadnoughtHighest).toEqual(true)
  })

  it('getHighestDiceCountUnit', () => {
    const attacker = getTestParticipant('attacker', {
      warsun: 1,
      cruiser: 1,
      destroyer: 1,
    })

    const defender = getTestParticipant('defender')
    const participantInstance = getAttackerInstance(attacker, defender)

    let highestDiceCountUnit = getHighestDiceCountUnit(participantInstance, 'combat', Place.space)
    expect(highestDiceCountUnit?.type).toEqual('warsun')

    participantInstance.units.find((u) => u.type === 'cruiser')!.combat!.countBonusTmp = 10

    highestDiceCountUnit = getHighestDiceCountUnit(participantInstance, 'combat', Place.space)
    expect(highestDiceCountUnit?.type).toEqual('cruiser')
  })
})
