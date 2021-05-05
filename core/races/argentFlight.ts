import { BattleEffect } from '../battleeffect/battleEffects'
import { UnitInstance, UnitType } from '../unit'

export const argentFlight: BattleEffect[] = [
  {
    type: 'race',
    name: 'Argent Flight destroyers',
    onlyFirstRound: false,
    transformUnit: (unit: UnitInstance) => {
      if (unit.type === UnitType.destroyer) {
        unit.combat!.hit -= 1
      }
      return unit
    },
  },
]
