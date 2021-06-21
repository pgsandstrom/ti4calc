import { EFFECT_LOW_PRIORITY } from '../battle-types'
import { BattleEffect } from '../battleeffect/battleEffects'
import { Place, Race } from '../enums'
import { defaultRoll, getUnitWithImproved, UnitInstance, UnitType } from '../unit'

export const mahact: BattleEffect[] = [
  {
    type: 'race',
    name: 'Mahact flagship',
    place: Place.space,
    transformUnit: (unit: UnitInstance) => {
      if (unit.type === UnitType.flagship) {
        return {
          ...unit,
          combat: {
            ...defaultRoll,
            hit: 5,
            count: 2,
          },
        }
      } else {
        return unit
      }
    },
  },
  {
    type: 'race-ability',
    name: 'Mahact flagship bonus',
    description:
      "Mahact flagship bonus. Flagship text is: During combat against an opponent whose command token is not in your fleet pool, apply +2 to the results of this unit's combat rolls.",
    place: Place.space,
    race: Race.mahact,
    priority: EFFECT_LOW_PRIORITY,
    transformUnit: (u: UnitInstance) => {
      if (u.type === UnitType.flagship) {
        return getUnitWithImproved(u, 'combat', 'hit', 'permanent', 2)
      } else {
        return u
      }
    },
  },
]
