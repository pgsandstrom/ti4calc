import { BattleEffect } from '@/core/battleeffect/battleEffects'
import { defaultRoll, UnitInstance, UnitType } from '@/core/unit'

export const deepwrought: BattleEffect[] = [
  {
    type: 'faction',
    name: 'Deepwrought flagship',
    place: 'space',
    transformUnit: (unit: UnitInstance) => {
      if (unit.type === UnitType.flagship) {
        return {
          ...unit,
          combat: {
            ...defaultRoll,
            hit: 7,
            count: 2,
          },
        }
      } else {
        return unit
      }
    },
  },
]
