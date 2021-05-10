import { BattleEffect } from '../battleeffect/battleEffects'
import { defaultRoll, UnitInstance, UnitType } from '../unit'

export const naazRokha: BattleEffect[] = [
  {
    type: 'race',
    name: 'Naaz-Rokha flagship',
    transformUnit: (unit: UnitInstance) => {
      if (unit.type === UnitType.flagship) {
        // TODO add flagship battle effect (both space and ground)
        return {
          ...unit,
          combat: {
            ...defaultRoll,
            hit: 9,
            count: 2,
          },
        }
      } else {
        return unit
      }
    },
  },
  // TODO supercharge
  // TODO add mech
]
