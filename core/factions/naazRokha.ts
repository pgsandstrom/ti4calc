import { ParticipantInstance } from '../battle-types'
import { BattleEffect } from '../battleeffect/battleEffects'
import { Faction, Place } from '../enums'
import { UnitInstance, UnitType, defaultRoll, getUnitWithImproved } from '../unit'

export const naazRokha: BattleEffect[] = [
  {
    type: 'faction',
    name: 'Naaz-Rokha flagship',
    place: 'both',
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
    type: 'faction',
    name: 'Naaz-Rokha mech',
    place: 'both',
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
    description:
      "At the start of a combat round, you may exhaust this card to apply +1 to the result of each of your unit's combat rolls during this combat round",
    type: 'faction-tech',
    place: 'both',
    faction: Faction.naaz_rokha,
    transformUnit: (unit: UnitInstance) => {
      return getUnitWithImproved(unit, 'combat', 'hit', 'temp')
    },
  },
]
