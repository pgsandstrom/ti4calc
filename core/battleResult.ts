import { ParticipantInstance } from '@/core/battle-types'
import { UnitInstance, UnitType } from '@/core/unit'

export function getBattleResultUnitString(p: ParticipantInstance) {
  return p.units
    .filter((u) => u.type !== UnitType.other)
    .sort((a, b) => {
      if (a.diePriority !== b.diePriority) {
        return (a.diePriority ?? 50) - (b.diePriority ?? 50)
      }

      const aDamaged = a.takenDamage ? 1 : 0
      const bDamaged = b.takenDamage ? 1 : 0
      return aDamaged - bDamaged
    })
    .map((u) => {
      if (u.takenDamage) {
        return `${getChar(u)}-`
      } else {
        return getChar(u)
      }
    })
    .join('')
}

function getChar(u: UnitInstance): string {
  switch (u.type) {
    case UnitType.flagship:
      return 'F'
    case UnitType.warsun:
      return 'W'
    case UnitType.dreadnought:
      return 'D'
    case UnitType.carrier:
      return 'C'
    case UnitType.cruiser:
      return 'c'
    case UnitType.destroyer:
      return 'd'
    case UnitType.fighter:
      return 'f'
    case UnitType.mech:
      return 'M'
    case UnitType.infantry:
      return 'i'
    case UnitType.pds:
      return 'p'
    case UnitType.other:
      return 'o' // should never happen
    case UnitType.nonunit:
      return 'n' // should never happen
  }
}
