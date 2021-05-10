import { BattleEffect } from '../battleeffect/battleEffects'
import { defaultRoll, UnitInstance, UnitType } from '../unit'

export const jolNar: BattleEffect[] = [
  {
    type: 'race',
    name: 'Jol-Nar flagship',
    transformUnit: (unit: UnitInstance) => {
      if (unit.type === UnitType.flagship) {
        // TODO add flagship ability
        return {
          ...unit,
          combat: {
            ...defaultRoll,
            hit: 6,
            count: 2,
          },
        }
      } else {
        return unit
      }
    },
  },
  // TODO add racial ability
  // TODO add mech
  // TODO add commander
]
