import { ParticipantInstance } from './battle-types'
import { UnitInstance, UnitType } from './unit'

export function getBattleResultUnitString(p: ParticipantInstance) {
  return p.units
    .filter((u) => u.type !== UnitType.other)
    .sort((a, b) => {
      if (a.type === b.type) {
        if (a.takenDamage) {
          return 1
        } else {
          return -1
        }
      }
      return (a.diePriority ?? 50) - (b.diePriority ?? 50)
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
