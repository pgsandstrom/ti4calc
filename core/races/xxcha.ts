import { BattleEffect } from '../battleeffect/battleEffects'
import { defaultRoll, UnitInstance, UnitType } from '../unit'

export const xxcha: BattleEffect[] = [
  {
    type: 'race',
    name: 'Xxcha flagship',
    transformUnit: (unit: UnitInstance) => {
      if (unit.type === UnitType.flagship) {
        return {
          ...unit,
          combat: {
            ...defaultRoll,
            hit: 7,
            count: 2,
          },
          spaceCannon: {
            ...defaultRoll,
            hit: 5,
            count: 3,
          },
        }
      } else {
        return unit
      }
    },
  },
  {
    type: 'race',
    name: 'Xxcha mech',
    transformUnit: (unit: UnitInstance) => {
      if (unit.type === UnitType.mech) {
        return {
          ...unit,
          spaceCannon: {
            ...defaultRoll,
            hit: 8,
          },
        }
      } else {
        return unit
      }
    },
  },
]
