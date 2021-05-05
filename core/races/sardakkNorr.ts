import { BattleEffect } from '../battleeffect/battleEffects'
import { UnitInstance } from '../unit'

export const sardarkkNorr: BattleEffect[] = [
  {
    type: 'race',
    name: 'Sardakk Norr buff',
    transformUnit: (unit: UnitInstance) => {
      if (unit.combat) {
        unit.combat.hitBonus += 1
      }
      return unit
    },
  },
]
