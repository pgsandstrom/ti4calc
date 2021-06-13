import { isBattleOngoing } from '../battle'
import { BattleInstance, ParticipantInstance } from '../battle-types'
import { BattleEffect } from '../battleeffect/battleEffects'
import { Place, Race } from '../enums'
import { defaultRoll, getUnitWithImproved, UnitInstance, UnitType } from '../unit'

const opponentHasRelicFragment = 'Naluu mech bonus'

export const naluu: BattleEffect[] = [
  {
    type: 'race',
    name: 'Naluu flagship',
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
          battleEffects: [
            {
              name: 'Naluu flagship ability',
              type: 'other',
              place: Place.ground,
              transformUnit: (unit: UnitInstance) => {
                if (unit.type === UnitType.fighter) {
                  return {
                    ...unit,
                    isGroundForce: true,
                  }
                } else {
                  return unit
                }
              },
              onCombatRoundEnd: (participant: ParticipantInstance, battle: BattleInstance) => {
                // TODO there is a complicated situation here. If fighters are upgraded, they are better than infantry but are killed first.
                // Optimal strategy is to kill all but one infantry, and then fighters, but our model does not support that.

                // return fighters to space!
                if (!isBattleOngoing(battle)) {
                  participant.units.forEach((unit) => {
                    if (unit.type === UnitType.fighter) {
                      unit.isGroundForce = false
                    }
                  })
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
    name: 'Naluu fighters',
    place: 'both',
    transformUnit: (unit: UnitInstance) => {
      if (unit.type === UnitType.fighter) {
        unit.combat!.hit = 8
      }
      return unit
    },
  },
  {
    type: 'race-tech',
    name: 'Hybrid Crystal Fighter II',
    place: 'both',
    race: Race.naluu,
    unit: UnitType.fighter,
    transformUnit: (unit: UnitInstance) => {
      if (unit.type === UnitType.fighter) {
        unit.combat!.hit = 7
      }
      return unit
    },
  },
  {
    type: 'race',
    name: 'Naluu mech',
    place: Place.ground,
    transformUnit: (unit: UnitInstance, p: ParticipantInstance) => {
      if (unit.type === UnitType.mech && p.effects[opponentHasRelicFragment] > 0) {
        return getUnitWithImproved(unit, 'combat', 'hit', 'permanent', 2)
      } else {
        return unit
      }
    },
  },
  {
    type: 'race-ability',
    description:
      "Naluu mech text is: During combat against an opponent who has at least 1 relic fragment, apply +2 to the results of this unit's combat rolls.",
    race: Race.naluu,
    place: Place.ground,
    name: opponentHasRelicFragment,
  },
]
