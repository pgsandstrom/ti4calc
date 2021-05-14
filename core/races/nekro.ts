import { BattleEffect } from '../battleeffect/battleEffects'
import { defaultRoll, UnitInstance, UnitType } from '../unit'

export const nekro: BattleEffect[] = [
  {
    type: 'race',
    name: 'Nekro flagship',
    transformUnit: (unit: UnitInstance) => {
      if (unit.type === UnitType.flagship) {
        // TODO add flagship ability
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
  // TODO add mech
  // TODO should we care about copying technology? No, right?
  // TODO should we fix so nekro can copy faction techs?

  // TODO make sure nekro does not gain all faction unit-techs just by trying to upgrade any unit
]
