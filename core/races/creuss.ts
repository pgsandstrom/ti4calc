import { BattleEffect } from '../battleeffect/battleEffects'
import { defaultRoll, UnitInstance, UnitType } from '../unit'

export const creuss: BattleEffect[] = [
  {
    type: 'race',
    name: 'Creuss flagship',
    transformUnit: (unit: UnitInstance) => {
      if (unit.type === UnitType.flagship) {
        return {
          ...unit,
          combat: {
            ...defaultRoll,
            hit: 5,
            count: 1,
          },
        }
      } else {
        return unit
      }
    },
  },
  // TODO Dimensional Splicer
]
