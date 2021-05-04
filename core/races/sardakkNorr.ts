import { BattleEffect } from '../battleEffects'
import { UnitInstance } from '../unit'

export const sardarkkNorr: BattleEffect[] = [
  {
    type: 'race',
    name: 'Sardakk Norr buff',
    onlyFirstRound: false,
    transformUnit: (unit: UnitInstance) => {
      if (unit.combat) {
        unit.combat.hit -= 1
      }
      return unit
    },
  },
]
