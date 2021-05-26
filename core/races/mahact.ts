import { ParticipantInstance } from '../battle-types'
import { BattleEffect } from '../battleeffect/battleEffects'
import { Place, Race } from '../enums'
import { defaultRoll, getUnitWithImproved, UnitInstance, UnitType } from '../unit'

const missingCommandToken = 'Mahact flagship bonus'

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
          battleEffects: [
            {
              name: 'Mahact flagship effect',
              type: 'other',
              place: Place.space,
              transformUnit: (u: UnitInstance, participant: ParticipantInstance) => {
                if (u.type === UnitType.flagship) {
                  if (participant.effects[missingCommandToken] > 0) {
                    return getUnitWithImproved(u, 'combat', 'hit', 'permanent', 2)
                  } else {
                    return u
                  }
                } else {
                  return u
                }
              },
            },
          ],
        }
      } else {
        return unit
      }
    },
  },
  {
    type: 'race-ability',
    place: Place.space,
    race: Race.mahact,
    name: missingCommandToken,
  },
]
