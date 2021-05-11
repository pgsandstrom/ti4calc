import { ParticipantInstance } from '../battle-types'
import { BattleEffect } from '../battleeffect/battleEffects'
import { Race } from '../enums'
import { defaultRoll, getUnitWithImproved, UnitInstance, UnitType } from '../unit'

const missingCommandToken = 'Mahact missing enemy command token'

export const mahact: BattleEffect[] = [
  {
    type: 'race',
    name: 'Mahact flagship',
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
              transformUnit: (auraUnit: UnitInstance, participant: ParticipantInstance) => {
                if (auraUnit.type === UnitType.flagship) {
                  if (participant.effects[missingCommandToken] === true) {
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
    race: Race.mahact,
    name: missingCommandToken,
  },
]
