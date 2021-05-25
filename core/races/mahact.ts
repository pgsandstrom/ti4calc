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
          aura: [
            {
              name: 'Mahact flagship aura',
              place: Place.space,
              transformUnit: (auraUnit: UnitInstance, participant: ParticipantInstance) => {
                // TODO this could be a battle effect instead of an aura
                if (auraUnit.type === UnitType.flagship) {
                  if (participant.effects[missingCommandToken] > 0) {
                    return getUnitWithImproved(auraUnit, 'combat', 'hit', 'temp', 2)
                  } else {
                    return auraUnit
                  }
                } else {
                  return auraUnit
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
    type: 'race-tech',
    place: Place.space,
    race: Race.mahact,
    name: missingCommandToken,
  },
]
