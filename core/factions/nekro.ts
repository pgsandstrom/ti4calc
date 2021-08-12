import { ParticipantInstance } from '../battle-types'
import { BattleEffect } from '../battleeffect/battleEffects'
import { Place, Faction } from '../enums'
import { defaultRoll, getUnitWithImproved, UnitInstance, UnitType } from '../unit'

const nekroMechBonus = 'Nekro mech bonus'

export const nekro: BattleEffect[] = [
  {
    type: 'faction',
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
                if (unit.isGroundForce) {
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
    type: 'faction',
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
    type: 'faction-ability',
    description:
      'Nekro mech text is: During combat against an opponent who has an "X" or "Y" token on 1 or more of their technologies, apply +2 to the result of each of this unit\'s combat rolls.',
    place: Place.ground,
    faction: Faction.nekro,
    name: nekroMechBonus,
  },
  // TODO should we care about copying technology mid combat? No, right?
  // TODO should we fix so nekro can copy faction techs?
  // If we do, make sure nekro does not gain all faction unit-techs just by trying to upgrade any unit
]
