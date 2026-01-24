import { BattleEffect } from '@/core/battleeffect/battleEffects'
import { Place } from '@/core/enums'
import { defaultRoll, UnitInstance, UnitType } from '@/core/unit'

export const arborec: BattleEffect[] = [
  {
    type: 'faction',
    name: 'Arborec flagship',
    place: Place.space,
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
  {
    type: 'faction',
    name: 'Arborec mech',
    place: 'both',
    transformUnit: (unit: UnitInstance) => {
      if (unit.type === UnitType.mech) {
        return {
          ...unit,
          planetaryShield: true,
        }
      } else {
        return unit
      }
    },
  },
]
