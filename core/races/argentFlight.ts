import { BattleEffect } from '../battleeffect/battleEffects'
import { UnitInstance, UnitType } from '../unit'

export const argentFlight: BattleEffect[] = [
  {
    type: 'race',
    name: 'Argent Flight destroyers',
    transformUnit: (unit: UnitInstance) => {
      if (unit.type === UnitType.destroyer) {
        unit.combat!.hit = 8
      }
      return unit
    },
  },
]
