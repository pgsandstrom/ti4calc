import { Battle, Participant } from './battle-types'
import { createParticipant, getUnitMap, setupBattle } from './battleSetup'
import { Race, Place } from './enums'
import { UnitType } from './unit'
import { getBestShip, isHighestHitUnit } from './unitGet'

describe('unitGet', () => {
  it('getBestShip', () => {
    const attacker: Participant = {
      race: Race.mahact,
      units: getUnitMap(),
      unitUpgrades: {},
      riskDirectHit: false,
      side: 'attacker',
      battleEffects: { 'Mahact flagship bonus': 1 },
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

    const bestShip = getBestShip(participantInstance)

    expect(bestShip!.type).toEqual(UnitType.warsun)
  })

  it('getHighestHitUnit', () => {
    const attacker = createParticipant('attacker')
    attacker.race = Race.l1z1x
    attacker.units.destroyer = 1
    attacker.units.cruiser = 1
    const defender = createParticipant('defender')
    const battle: Battle = {
      attacker,
      defender,
      place: Place.space,
    }
    const battleInstance = setupBattle(battle)

    const cruiser = battleInstance.attacker.units.find((u) => u.type === UnitType.cruiser)!
    const isCruiserHighest = isHighestHitUnit(cruiser, battleInstance.attacker, 'combat')
    expect(isCruiserHighest).toEqual(true)

    const destroyer = battleInstance.attacker.units.find((u) => u.type === UnitType.destroyer)!
    const isDestroyerHighest = isHighestHitUnit(destroyer, battleInstance.attacker, 'combat')
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
    const isFlagshipHighest = isHighestHitUnit(flagShip, battleInstance.attacker, 'combat')
    expect(isFlagshipHighest).toEqual(false)

    const dreadnought = battleInstance.attacker.units.find((u) => u.type === UnitType.dreadnought)!
    const isDreadnoughtHighest = isHighestHitUnit(dreadnought, battleInstance.attacker, 'combat')
    expect(isDreadnoughtHighest).toEqual(true)
  })
})
