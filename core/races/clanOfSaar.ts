import { BattleEffect } from '../battleeffect/battleEffects'
import { defaultRoll, UnitInstance, UnitType } from '../unit'

export const clanOfSaar: BattleEffect[] = [
  {
    type: 'race',
    name: 'Clan of Saar flagship',
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
