import { Battle, Participant } from './battle-types'
import { createParticipant, getUnitMap, setupBattle } from './battleSetup'
import { Race, Place } from './enums'
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
  it('getHighestWorthUnit', () => {
    const attacker: Participant = {
      race: Race.barony_of_letnev,
      units: getUnitMap(),
      unitUpgrades: {},
      riskDirectHit: false,
      side: 'attacker',
      battleEffects: {},
    }
    const defender: Participant = {
      race: Race.barony_of_letnev,
      units: getUnitMap(),
      unitUpgrades: {},
      riskDirectHit: false,
      side: 'defender',
      battleEffects: {},
    }
    attacker.units.warsun = 1
    attacker.units.flagship = 1
    attacker.units.dreadnought = 2
    attacker.units.mech = 1
    attacker.units.pds = 1

    const battle: Battle = {
      attacker,
      defender,
      place: Place.space,
    }
    const battleInstance = setupBattle(battle)

    const participantInstance = battleInstance.attacker

    const unit = getHighestWorthUnit(participantInstance, Place.space)

    expect(unit?.type).toEqual(UnitType.warsun)
  })

  it('getHighestWorthUnit when one is damaged', () => {
    const attacker: Participant = {
      race: Race.barony_of_letnev,
      units: getUnitMap(),
      unitUpgrades: {},
      riskDirectHit: false,
      side: 'attacker',
      battleEffects: {},
    }
    const defender: Participant = {
      race: Race.barony_of_letnev,
      units: getUnitMap(),
      unitUpgrades: {},
      riskDirectHit: false,
      side: 'defender',
      battleEffects: {},
    }
    attacker.units.dreadnought = 5

    const battle: Battle = {
      attacker,
      defender,
      place: Place.space,
    }
    const battleInstance = setupBattle(battle)

    const participantInstance = battleInstance.attacker

    participantInstance.units.forEach((u, index) => {
      if (index !== 2) {
        u.takenDamage = true
        u.takenDamageRound = 0
      }
    })

    const unit = getHighestWorthUnit(participantInstance, Place.space)

    expect(unit?.type).toEqual(UnitType.dreadnought)
    expect(unit?.takenDamage).toEqual(false)
  })

  it('getHighestWorthUnit should respect place', () => {
    const attacker: Participant = {
      race: Race.barony_of_letnev,
      units: getUnitMap(),
      unitUpgrades: {},
      riskDirectHit: false,
      side: 'attacker',
      battleEffects: {},
    }
    const defender: Participant = {
      race: Race.barony_of_letnev,
      units: getUnitMap(),
      unitUpgrades: {},
      riskDirectHit: false,
      side: 'defender',
      battleEffects: {},
    }
    attacker.units.destroyer = 1
    attacker.units.mech = 1

    const battle: Battle = {
      attacker,
      defender,
      place: Place.space,
    }
    const battleInstance = setupBattle(battle)

    const participantInstance = battleInstance.attacker

    const unit = getHighestWorthUnit(participantInstance, Place.space)

    expect(unit?.type).toEqual(UnitType.destroyer)
  })

  it('getHighestWorthSustainUnit', () => {
    const attacker: Participant = {
      race: Race.barony_of_letnev,
      units: getUnitMap(),
      unitUpgrades: {},
      riskDirectHit: false,
      side: 'attacker',
      battleEffects: {},
    }
    const defender: Participant = {
      race: Race.barony_of_letnev,
      units: getUnitMap(),
      unitUpgrades: {},
      riskDirectHit: false,
      side: 'defender',
      battleEffects: {},
    }

    attacker.units.warsun = 1
    attacker.units.dreadnought = 1
    attacker.units.destroyer = 1
    attacker.units.mech = 1

    const battle: Battle = {
      attacker,
      defender,
      place: Place.space,
    }
    const battleInstance = setupBattle(battle)

    const participantInstance = battleInstance.attacker

    const unit = getHighestWorthSustainUnit(participantInstance, Place.space, true)

    expect(unit?.type).toEqual(UnitType.warsun)
  })

  it('getHighestWorthSustainUnit returning undefined', () => {
    const attacker: Participant = {
      race: Race.barony_of_letnev,
      units: getUnitMap(),
      unitUpgrades: {},
      riskDirectHit: false,
      side: 'attacker',
      battleEffects: {},
    }
    const defender: Participant = {
      race: Race.barony_of_letnev,
      units: getUnitMap(),
      unitUpgrades: {},
      riskDirectHit: false,
      side: 'defender',
      battleEffects: {},
    }
    attacker.units.destroyer = 1
    attacker.units.mech = 1

    const battle: Battle = {
      attacker,
      defender,
      place: Place.space,
    }
    const battleInstance = setupBattle(battle)

    const participantInstance = battleInstance.attacker

    const unit = getHighestWorthSustainUnit(participantInstance, Place.space, true)

    expect(unit).toEqual(undefined)
  })

  it('getLowestWorthSustainUnit', () => {
    const attacker: Participant = {
      race: Race.barony_of_letnev,
      units: getUnitMap(),
      unitUpgrades: {},
      riskDirectHit: false,
      side: 'attacker',
      battleEffects: {},
    }
    const defender: Participant = {
      race: Race.barony_of_letnev,
      units: getUnitMap(),
      unitUpgrades: {},
      riskDirectHit: false,
      side: 'defender',
      battleEffects: {},
    }
    attacker.units.dreadnought = 1
    attacker.units.flagship = 1

    const battle: Battle = {
      attacker,
      defender,
      place: Place.space,
    }
    const battleInstance = setupBattle(battle)

    const participantInstance = battleInstance.attacker

    const unit = getLowestWorthSustainUnit(participantInstance, Place.space, true)

    expect(unit?.type).toEqual(UnitType.dreadnought)
  })

  it('getHighestWorthNonSustainUnit', () => {
    const attacker: Participant = {
      race: Race.barony_of_letnev,
      units: getUnitMap(),
      unitUpgrades: {},
      riskDirectHit: false,
      side: 'attacker',
      battleEffects: {},
    }
    const defender: Participant = {
      race: Race.barony_of_letnev,
      units: getUnitMap(),
      unitUpgrades: {},
      riskDirectHit: false,
      side: 'defender',
      battleEffects: {},
    }
    attacker.units.fighter = 1
    attacker.units.flagship = 1

    const battle: Battle = {
      attacker,
      defender,
      place: Place.space,
    }
    const battleInstance = setupBattle(battle)

    const participantInstance = battleInstance.attacker

    const unit = getHighestWorthNonSustainUnit(participantInstance, Place.space, true)

    expect(unit?.type).toEqual(UnitType.fighter)
  })

  it('getLowestWorthUnit', () => {
    const attacker: Participant = {
      race: Race.barony_of_letnev,
      units: getUnitMap(),
      unitUpgrades: {},
      riskDirectHit: false,
      side: 'attacker',
      battleEffects: {},
    }
    const defender: Participant = {
      race: Race.barony_of_letnev,
      units: getUnitMap(),
      unitUpgrades: {},
      riskDirectHit: false,
      side: 'defender',
      battleEffects: {},
    }
    attacker.units.dreadnought = 1
    attacker.units.flagship = 1

    const battle: Battle = {
      attacker,
      defender,
      place: Place.space,
    }
    const battleInstance = setupBattle(battle)

    const participantInstance = battleInstance.attacker

    const unit = getLowestWorthUnit(participantInstance, Place.space, true)

    expect(unit?.type).toEqual(UnitType.dreadnought)
  })

  it('getHighestHitUnit', () => {
    const attacker = createParticipant('attacker')
    attacker.race = Race.l1z1x
    attacker.units.destroyer = 1
    attacker.units.cruiser = 1
    attacker.units.mech = 1
    const defender = createParticipant('defender')
    const battle: Battle = {
      attacker,
      defender,
      place: Place.space,
    }
    const battleInstance = setupBattle(battle)

    const cruiser = battleInstance.attacker.units.find((u) => u.type === UnitType.cruiser)!
    const isCruiserHighest = isHighestHitUnit(
      cruiser,
      battleInstance.attacker,
      'combat',
      Place.space,
    )
    expect(isCruiserHighest).toEqual(true)

    const destroyer = battleInstance.attacker.units.find((u) => u.type === UnitType.destroyer)!
    const isDestroyerHighest = isHighestHitUnit(
      destroyer,
      battleInstance.attacker,
      'combat',
      Place.space,
    )
    expect(isDestroyerHighest).toEqual(false)
  })

  it('isHighestHitUnit should work with unit upgrades', () => {
    const attacker = createParticipant('attacker')
    attacker.race = Race.l1z1x
    attacker.units.flagship = 1
    attacker.units.dreadnought = 1
    attacker.unitUpgrades[UnitType.dreadnought] = true
    const defender = createParticipant('defender')
    const battle: Battle = {
      attacker,
      defender,
      place: Place.space,
    }
    const battleInstance = setupBattle(battle)

    const flagShip = battleInstance.attacker.units.find((u) => u.type === UnitType.flagship)!
    const isFlagshipHighest = isHighestHitUnit(
      flagShip,
      battleInstance.attacker,
      'combat',
      Place.space,
    )
    expect(isFlagshipHighest).toEqual(false)

    const dreadnought = battleInstance.attacker.units.find((u) => u.type === UnitType.dreadnought)!
    const isDreadnoughtHighest = isHighestHitUnit(
      dreadnought,
      battleInstance.attacker,
      'combat',
      Place.space,
    )
    expect(isDreadnoughtHighest).toEqual(true)
  })
})
