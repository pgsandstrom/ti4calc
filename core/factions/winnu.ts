import { getOtherParticipant } from '../battle'
import { BattleInstance, ParticipantInstance } from '../battle-types'
import { BattleEffect } from '../battleeffect/battleEffects'
import { Place } from '../enums'
import { defaultRoll, getUnitWithImproved, UnitInstance, UnitType } from '../unit'
import { getNonFighterShips } from '../unitGet'

// TODO fix test for flagship, since it has an aura...
export const winnu: BattleEffect[] = [
  {
    type: 'faction',
    name: 'Winnu flagship',
    place: Place.space,
    transformUnit: (unit: UnitInstance) => {
      if (unit.type === UnitType.flagship) {
        return {
          ...unit,
          combat: {
            ...defaultRoll,
            hit: 7,
            count: 1,
          },
          aura: [
            {
              name: 'Winnu Flagship ability',
              type: 'other',
              place: Place.space,
              transformUnit: (
                auraUnit: UnitInstance,
                p: ParticipantInstance,
                battle: BattleInstance,
              ) => {
                if (auraUnit.type === UnitType.flagship) {
                  const opponent = getOtherParticipant(battle, p)
                  const nonFighterShips = getNonFighterShips(opponent)
                  return {
                    ...auraUnit,
                    combat: {
                      ...auraUnit.combat!,
                      count: nonFighterShips.length,
                    },
                  }
                }
                return auraUnit
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
    type: 'commander',
    description:
      "During combat: Apply +2 to the result of each of your unit's combat rolls in the Mecatol Rex system, your home system, and each system that contains a legendary planet.",
    name: 'Winnu commander',
    place: 'both',
    transformUnit: (u: UnitInstance) => {
      return getUnitWithImproved(u, 'combat', 'hit', 'permanent', 2)
    },
  },
]
