import { ParticipantInstance } from './battle-types'
import { Place } from './enums'
import { UnitInstance, UnitType } from './unit'

// TODO could this list be replaced by every units priority?
const NON_FIGHTER_SHIP_BY_USELESSNESS = [
  UnitType.carrier,
  UnitType.destroyer,
  UnitType.cruiser,
  UnitType.dreadnought,
  UnitType.flagship,
  UnitType.warsun,
]

export function getWorstNonFighterShip(p: ParticipantInstance) {
  if (p.units.length === 0) {
    return undefined
  }
  return p.units.reduce((a, b) => {
    const aIndex = NON_FIGHTER_SHIP_BY_USELESSNESS.findIndex((type) => type === a.type)
    const bIndex = NON_FIGHTER_SHIP_BY_USELESSNESS.findIndex((type) => type === b.type)
    if (aIndex === -1) {
      return b
    }
    if (bIndex === -1) {
      return a
    }
    if (a < b) {
      return a
    } else {
      return b
    }
  })
}

export function getNonFighterShips(p: ParticipantInstance) {
  return p.units.filter((unit) => unit.isShip && unit.type !== UnitType.fighter)
}

// return the unit that the owner prefers dies
export function getBestDieUnit(p: ParticipantInstance, place: Place, includeFighter: boolean) {
  const units = getAliveUnits(p, place, includeFighter)
  if (units.length === 0) {
    return undefined
  } else {
    return units.reduce((a, b) => {
      if (a.diePriority === b.diePriority && a.takenDamage !== b.takenDamage) {
        return a.takenDamage ? b : a
      }
      return a.diePriority! > b.diePriority! ? a : b
    })
  }
}

// returns the unit that the enemy wants to kill
export function getBestNonSustainUnit(p: ParticipantInstance) {
  const nonSustainUnits = p.units.filter((u) => !u.sustainDamage)

  if (nonSustainUnits.length === 0) {
    return undefined
  }

  return nonSustainUnits.reduce((a, b) => {
    return a.diePriority! < b.diePriority! ? a : b
  })
}

export function getAliveUnits(p: ParticipantInstance, place: Place, includeFighter: boolean) {
  return p.units.filter((u) => {
    if (!includeFighter && u.type === UnitType.fighter) {
      return false
    }
    if (!doesUnitFitPlace(u, place)) {
      return false
    }
    return !u.isDestroyed
  })
}

// returns the unit that the owner prefers sustains
// TODO add a test maybe.
export function getBestSustainUnit(p: ParticipantInstance, place: Place, includeFighter: boolean) {
  const units = getUnitsWithSustain(p, place, includeFighter)
  if (units.length === 0) {
    return undefined
  } else {
    return units
      .filter((u) => includeFighter || u.type !== UnitType.fighter)
      .reduce((a, b) => {
        // TODO could it work to just pre-sort this and then never sort again?
        return (a.useSustainDamagePriority ?? 50) > (b.useSustainDamagePriority ?? 50) ? a : b
      })
  }
}

export function getUnitsWithSustain(p: ParticipantInstance, place: Place, includeFighter: boolean) {
  return p.units.filter((u) => {
    if (!includeFighter && u.type === UnitType.fighter) {
      return false
    }
    if (!doesUnitFitPlace(u, place)) {
      return false
    }
    return u.sustainDamage && !u.takenDamage && !u.isDestroyed
  })
}

export function isHighestHitUnit(
  unit: UnitInstance,
  p: ParticipantInstance,
  attackType: 'combat' | 'bombardment' | 'spaceCannon' | 'afb',
) {
  const highestHitUnit = getHighestHitUnit(p, attackType)
  if (!highestHitUnit) {
    return true
  }
  const unitHit = unit[attackType]!.hit - unit[attackType]!.hitBonus - unit[attackType]!.hitBonusTmp
  const bestHit =
    highestHitUnit[attackType]!.hit -
    highestHitUnit[attackType]!.hitBonus -
    highestHitUnit[attackType]!.hitBonusTmp
  return unitHit <= bestHit
}

export function getHighestHitUnit(
  p: ParticipantInstance,
  attackType: 'combat' | 'bombardment' | 'spaceCannon' | 'afb',
) {
  const units = p.units.filter((u) => u[attackType])
  if (units.length === 0) {
    return undefined
  }
  const bestUnit = units.reduce((a, b) => {
    if (
      a[attackType]!.hit - a[attackType]!.hitBonus - a[attackType]!.hitBonusTmp <
      b[attackType]!.hit - b[attackType]!.hitBonus - b[attackType]!.hitBonusTmp
    ) {
      return a
    } else {
      return b
    }
  })
  return bestUnit
}

export function hasAttackType(
  p: ParticipantInstance,
  type: 'combat' | 'bombardment' | 'spaceCannon' | 'afb',
): boolean {
  return p.units.some((u) => u[type] !== undefined)
}

export function doesUnitFitPlace(u: UnitInstance, place: Place) {
  if (place === Place.space && !u.isShip) {
    return false
  }
  if (place === Place.ground && !u.isGroundForce) {
    return false
  }
  return true
}
