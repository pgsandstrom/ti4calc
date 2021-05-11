import { Battle } from '../battle-types'
import { createParticipant, setupBattle } from '../battleSetup'
import { Place, Race } from '../enums'
import { UnitType } from '../unit'
import { isHighestHitUnit } from '../unitGet'

describe('unitGet', () => {
  it('getHighestHitUnit', () => {
    const attacker = createParticipant('attacker')
    attacker.race = Race.l1z1x
    attacker.units.fighter = 1
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
