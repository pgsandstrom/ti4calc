import { BattleEffect } from '../battleeffect/battleEffects'
import { defaultRoll, UnitInstance, UnitType } from '../unit'

export const nomad: BattleEffect[] = [
  {
    type: 'race',
    name: 'Nomad flagship',
    transformUnit: (unit: UnitInstance) => {
      if (unit.type === UnitType.flagship) {
        return {
          ...unit,
          combat: {
            ...defaultRoll,
            hit: 7,
            count: 2,
          },
          afb: {
            ...defaultRoll,
            hit: 8,
            count: 3,
          },
        }
      } else {
        return unit
      }
    },
  },
]
