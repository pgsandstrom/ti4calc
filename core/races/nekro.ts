import { ParticipantInstance } from '../battle-types'
import { BattleEffect } from '../battleeffect/battleEffects'
import { Place, Race } from '../enums'
import { defaultRoll, getUnitWithImproved, UnitInstance, UnitType } from '../unit'

const nekroMechBonus = 'Necro mech bonus'

export const nekro: BattleEffect[] = [
  {
    type: 'race',
    name: 'Nekro flagship',
    place: Place.space,
    transformUnit: (unit: UnitInstance) => {
      if (unit.type === UnitType.flagship) {
        return {
          ...unit,
          combat: {
            ...defaultRoll,
            hit: 9,
            count: 2,
          },
          battleEffects: [
            {
              type: 'other',
              name: 'Nekro flagship ability',
              place: Place.space,
              transformUnit: (unit: UnitInstance) => {
                if (unit.type === UnitType.infantry) {
                  return {
                    ...unit,
                    isShip: true,
                  }
                } else {
                  return unit
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
    name: 'Nekro mech',
    place: Place.ground,
    transformUnit: (unit: UnitInstance, p: ParticipantInstance) => {
      if (unit.type === UnitType.mech && p.effects[nekroMechBonus] > 0) {
        return getUnitWithImproved(unit, 'combat', 'hit', 'permanent', 2)
      } else {
        return unit
      }
    },
  },
  {
    // TODO add test to make sure all race-techs has a race specified
    type: 'race-ability',
    place: Place.ground,
    race: Race.nekro,
    name: nekroMechBonus,
  },
  // TODO certain abilities should not be able to be copied. Like the naluu mech bonus. It should be categorized as something else.
  // TODO should we care about copying technology mid combat? No, right?
  // TODO should we fix so nekro can copy faction techs?
  // If we do, make sure nekro does not gain all faction unit-techs just by trying to upgrade any unit
]
