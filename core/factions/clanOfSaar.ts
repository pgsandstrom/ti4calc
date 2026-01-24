import { BattleEffect } from '@/core/battleeffect/battleEffects'
import { defaultRoll, UnitInstance, UnitType } from '@/core/unit'

export const clanOfSaar: BattleEffect[] = [
  {
    type: 'faction',
    name: 'Clan of Saar flagship',
    place: 'space',
    transformUnit: (unit: UnitInstance) => {
      if (unit.type === UnitType.flagship) {
        return {
          ...unit,
          combat: {
            ...defaultRoll,
            hit: 5,
            count: 2,
          },
          afb: {
            ...defaultRoll,
            hit: 6,
            count: 4,
          },
        }
      } else {
        return unit
      }
    },
  },
]
