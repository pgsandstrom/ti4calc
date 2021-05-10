import { BattleEffect } from '../battleeffect/battleEffects'
import { defaultRoll, UnitInstance, UnitType } from '../unit'

export const mentak: BattleEffect[] = [
  {
    type: 'race',
    name: 'Mentak flagship',
    transformUnit: (unit: UnitInstance) => {
      if (unit.type === UnitType.flagship) {
        return {
          ...unit,
          combat: {
            ...defaultRoll,
            hit: 7,
            count: 2,
          },
        }
      } else {
        return unit
      }
    },
  },
  // TODO add flagship ability
  // TODO add mech
  // TODO add ambush
  // TODO maybe add hero???
]
