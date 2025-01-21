import { ParticipantInstance } from './battle-types'
import { Place } from './enums'
import { UnitInstance, UnitType } from './unit'

export function getHighestWorthUnit(p: ParticipantInstance, place: Place, includeFighter: boolean) {
  const units = getUnits(p, place, includeFighter)

  if (units.length === 0) {
    return undefined
  }

  return units.reduce((a, b) => {
    if (a.diePriority === b.diePriority) {
      if (a.takenDamage !== b.takenDamage) {
        return a.takenDamage ? b : a
      }
      return a.usedSustain ? a : b
    }
    return a.diePriority! > b.diePriority! ? b : a
  })
}

export function getNonFighterShips(p: ParticipantInstance) {
  return getUnits(p, Place.space, false)
}

export function getHighestWorthSustainUnit(
  p: ParticipantInstance,
  place: Place,
  includeFighter: boolean,
) {
  const units = getUnits(p, place, includeFighter, true)
  if (units.length === 0) {
    return undefined
  } else {
    // TODO should I replace all these reduces with a lodash maxby?
    return units.reduce((a, b) => {
      return (a.useSustainDamagePriority ?? 50) > (b.useSustainDamagePriority ?? 50) ? b : a
    })
  }
}

export function getLowestWorthSustainUnit(
  p: ParticipantInstance,
  place: Place,
  includeFighter: boolean,
) {
  const units = getUnits(p, place, includeFighter, true)
  if (units.length === 0) {
    return undefined
  } else {
    return units.reduce((a, b) => {
      return (a.useSustainDamagePriority ?? 50) > (b.useSustainDamagePriority ?? 50) ? a : b
    })
  }
}

export function getHighestWorthNonSustainUnit(
  p: ParticipantInstance,
  place: Place,
  includeFighter: boolean,
) {
  const units = getUnits(p, place, includeFighter, false)

  if (units.length === 0) {
    return undefined
  }

  return units.reduce((a, b) => {
    return a.diePriority! > b.diePriority! ? b : a
  })
}

export function getLowestWorthUnit(p: ParticipantInstance, place: Place, includeFighter: boolean) {
  const units = getUnits(p, place, includeFighter)
  if (units.length === 0) {
    return undefined
  } else {
    return units.reduce((a, b) => {
      if (a.diePriority === b.diePriority) {
        if (a.takenDamage !== b.takenDamage) {
          return a.takenDamage && !b.usedSustain ? b : a
        }
        return a.usedSustain ? b : a
      }
      return a.diePriority! > b.diePriority! ? a : b
    })
  }
}

export function getUnits(
  p: ParticipantInstance,
  place: Place | undefined,
  includeFighter: boolean,
  withSustain?: boolean,
) {
  return p.units.filter((u) => {
    if (!includeFighter && u.type === UnitType.fighter) {
      return false
    }
    if (place != null && !doesUnitFitPlace(u, place)) {
      return false
    }
    if (u.isDestroyed) {
      return false
    }

    if (withSustain === true) {
      return u.sustainDamage && !u.takenDamage && !u.usedSustain
    } else if (withSustain === false) {
      return !u.sustainDamage || u.takenDamage || u.usedSustain
    } else {
      return true
    }
  })
}

export function isHighestHitUnit(
  unit: UnitInstance,
  p: ParticipantInstance,
  attackType: 'combat' | 'bombardment' | 'spaceCannon' | 'afb',
  place: Place | undefined,
) {
  const highestHitUnit = getHighestHitUnit(p, attackType, place)
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
  place: Place | undefined,
) {
  const units = getUnits(p, place, true).filter((u) => !!u[attackType])
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
