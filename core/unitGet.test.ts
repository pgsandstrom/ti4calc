import { getTestParticipant } from '../util/util.test'
import { Battle, Participant } from './battle-types'
import { setupBattle } from './battleSetup'
import { Faction, Place } from './enums'
import { UnitType } from './unit'
import {
  getHighestWorthNonSustainUnit,
  getHighestWorthSustainUnit,
  getHighestWorthUnit,
  getLowestWorthSustainUnit,
  getLowestWorthUnit,
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
})
