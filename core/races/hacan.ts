import { BattleEffect } from '../battleeffect/battleEffects'
import { defaultRoll, UnitInstance, UnitType } from '../unit'

export const hacan: BattleEffect[] = [
  {
    type: 'race',
    name: 'Hacan flagship',
    transformUnit: (unit: UnitInstance) => {
      if (unit.type === UnitType.flagship) {
        return {
          ...unit,
          combat: {
            ...defaultRoll,
            hit: 7,
            count: 2,
          },
          // TODO add their weird aura
        }
      } else {
        return unit
      }
    },
  },
]
