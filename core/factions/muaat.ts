import { BattleEffect } from '@/core/battleeffect/battleEffects'
import { Place } from '@/core/enums'
import { defaultRoll, UnitInstance, UnitType } from '@/core/unit'

export const muaat: BattleEffect[] = [
  {
    type: 'faction',
    name: 'Muaat flagship',
    place: Place.space,
    transformUnit: (unit: UnitInstance) => {
      if (unit.type === UnitType.flagship) {
        return {
          ...unit,
          combat: {
            ...defaultRoll,
            hit: 5,
            count: 2,
          },
        }
      } else {
        return unit
      }
    },
  },
]
