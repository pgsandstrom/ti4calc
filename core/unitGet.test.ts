import assert from 'node:assert'
import { describe, it } from 'node:test'

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

    assert.strictEqual(unit?.type, UnitType.warsun)
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

    if (!unit) {
      assert.fail()
    }
    assert.strictEqual(unit.type, UnitType.dreadnought)
    assert.strictEqual(unit.takenDamage, false)
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
        u.usedSustainThisTimingWindow = true
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

    if (!unit) {
      assert.fail()
    }
    assert.strictEqual(unit.type, UnitType.dreadnought)
    assert.strictEqual(unit.takenDamage, false)
    assert.strictEqual(unit.usedSustainThisTimingWindow, true)
  })

  it('getHighestWorthUnit should respect place', () => {
    const attacker = getTestParticipant('attacker', {
      destroyer: 1,
      mech: 1,
    })

    const defender = getTestParticipant('defender')

    const participantInstance = getAttackerInstance(attacker, defender)

    const unit = getHighestWorthUnit(participantInstance, Place.space, true)

    assert.strictEqual(unit?.type, UnitType.destroyer)
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

    assert.strictEqual(unit?.type, UnitType.warsun)
  })

  it('getHighestWorthSustainUnit returning undefined', () => {
    const attacker = getTestParticipant('attacker', {
      destroyer: 1,
      mech: 1,
    })

    const defender = getTestParticipant('defender')

    const participantInstance = getAttackerInstance(attacker, defender)

    const unit = getHighestWorthSustainUnit(participantInstance, Place.space, true)

    assert.strictEqual(unit, undefined)
  })

  it('getHighestWorthSustainUnit should ignore units that just sustained', () => {
    const attacker = getTestParticipant('attacker', {
      dreadnought: 1,
    })

    const defender = getTestParticipant('defender')

    const participantInstance = getAttackerInstance(attacker, defender)

    participantInstance.units[0].usedSustainThisTimingWindow = true

    const unit = getHighestWorthSustainUnit(participantInstance, Place.space, true)

    assert.strictEqual(unit, undefined)
  })

  it('getLowestWorthSustainUnit', () => {
    const attacker = getTestParticipant('attacker', {
      flagship: 1,
      dreadnought: 1,
    })

    const defender = getTestParticipant('defender')

    const participantInstance = getAttackerInstance(attacker, defender)

    const unit = getLowestWorthSustainUnit(participantInstance, Place.space, true)

    assert.strictEqual(unit?.type, UnitType.dreadnought)
  })

  it('getLowestWorthSustainUnit should ignore units that just sustained', () => {
    const attacker = getTestParticipant('attacker', {
      dreadnought: 1,
    })

    const defender = getTestParticipant('defender')

    const participantInstance = getAttackerInstance(attacker, defender)

    participantInstance.units[0].usedSustainThisTimingWindow = true

    const unit = getLowestWorthSustainUnit(participantInstance, Place.space, true)

    assert.strictEqual(unit, undefined)
  })

  it('getHighestWorthNonSustainUnit', () => {
    const attacker = getTestParticipant('attacker', {
      flagship: 1,
      fighter: 1,
    })

    const defender = getTestParticipant('defender')

    const participantInstance = getAttackerInstance(attacker, defender)

    const unit = getHighestWorthNonSustainUnit(participantInstance, Place.space, true)

    assert.strictEqual(unit?.type, UnitType.fighter)
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

    assert.strictEqual(unit?.type, UnitType.flagship)
  })

  it('getHighestWorthNonSustainUnit should fetch sustained units', () => {
    const attacker = getTestParticipant('attacker', {
      dreadnought: 1,
    })

    const defender = getTestParticipant('defender')

    const participantInstance = getAttackerInstance(attacker, defender)

    participantInstance.units[0].usedSustainThisTimingWindow = true

    const unit = getHighestWorthNonSustainUnit(participantInstance, Place.space, true)

    if (!unit) {
      assert.fail()
    }
    assert.strictEqual(unit.type, UnitType.dreadnought)
    assert.strictEqual(unit.usedSustainThisTimingWindow, true)
  })

  it('getLowestWorthUnit', () => {
    const attacker = getTestParticipant('attacker', {
      flagship: 1,
      dreadnought: 1,
    })

    const defender = getTestParticipant('defender')

    const participantInstance = getAttackerInstance(attacker, defender)

    const unit = getLowestWorthUnit(participantInstance, Place.space, true)

    assert.strictEqual(unit?.type, UnitType.dreadnought)
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
        u.usedSustainThisTimingWindow = true
      }
    })

    const unit = getLowestWorthUnit(participantInstance, Place.space, true)

    if (!unit) {
      assert.fail()
    }
    assert.strictEqual(unit.type, UnitType.dreadnought)
    assert.strictEqual(unit.takenDamage, true)
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

    assert.strictEqual(unit?.type, UnitType.carrier)
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
    assert.strictEqual(isCruiserHighest, true)

    const destroyer = participantInstance.units.find((u) => u.type === UnitType.destroyer)!
    const isDestroyerHighest = isHighestHitUnit(
      destroyer,
      participantInstance,
      'combat',
      Place.space,
    )
    assert.strictEqual(isDestroyerHighest, false)
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
    assert.strictEqual(isFlagshipHighest, false)

    const dreadnought = participantInstance.units.find((u) => u.type === UnitType.dreadnought)!
    const isDreadnoughtHighest = isHighestHitUnit(
      dreadnought,
      participantInstance,
      'combat',
      Place.space,
    )
    assert.strictEqual(isDreadnoughtHighest, true)
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
    assert.strictEqual(highestDiceCountUnit?.type, 'warsun')

    participantInstance.units.find((u) => u.type === 'cruiser')!.combat!.countBonusTmp = 10

    highestDiceCountUnit = getHighestDiceCountUnit(participantInstance, 'combat', Place.space)
    assert.strictEqual(highestDiceCountUnit?.type, 'cruiser')
  })
})
