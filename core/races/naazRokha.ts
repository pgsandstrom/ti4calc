import { ParticipantInstance } from '../battle-types'
import { BattleEffect } from '../battleeffect/battleEffects'
import { Place } from '../enums'
import { defaultRoll, getUnitWithImproved, UnitInstance, UnitType } from '../unit'

export const naazRokha: BattleEffect[] = [
  {
    type: 'race',
    name: 'Naaz-Rokha flagship',
    transformUnit: (unit: UnitInstance) => {
      if (unit.type === UnitType.flagship) {
        return {
          ...unit,
          combat: {
            ...defaultRoll,
            hit: 9,
            count: 2,
          },
          aura: [
            {
              name: 'Naaz-Rokha flagship aura',
              type: 'other',
              place: 'both',
              transformUnit: (auraUnit: UnitInstance) => {
                if (auraUnit.type === UnitType.mech) {
                  return getUnitWithImproved(auraUnit, 'combat', 'count', 'temp')
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
    type: 'race',
    name: 'Naaz-Rokha mech',
    transformUnit: (unit: UnitInstance, _p: ParticipantInstance, place: Place) => {
      if (unit.type === UnitType.mech) {
        if (place === Place.space) {
          return {
            ...unit,
            combat: {
              ...defaultRoll,
              hit: 8,
              count: 2,
            },
            sustainDamage: false,
            isShip: true,
            isGroundForce: false,
          }
        } else {
          return {
            ...unit,
            combat: {
              ...defaultRoll,
              hit: 6,
              count: 2,
            },
            sustainDamage: true,
            isShip: false,
            isGroundForce: true,
          }
        }
      } else {
        return unit
      }
    },
  },
  {
    name: 'Supercharge',
    type: 'race-tech',
    transformUnit: (unit: UnitInstance) => {
      return getUnitWithImproved(unit, 'combat', 'hit', 'temp')
    },
  },
]
