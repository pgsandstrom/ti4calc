import { isBattleOngoing } from '../battle'
import { BattleInstance, ParticipantInstance } from '../battle-types'
import { BattleEffect } from '../battleeffect/battleEffects'
import { Faction, Place } from '../enums'
import { UnitInstance, UnitType, defaultRoll, getUnitWithImproved } from '../unit'

const opponentHasRelicFragment = 'Naalu mech bonus'

export const naalu: BattleEffect[] = [
  {
    type: 'faction',
    name: 'Naalu flagship',
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
              name: 'Naalu flagship ability',
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
    type: 'faction',
    name: 'Naalu fighters',
    place: 'both',
    transformUnit: (unit: UnitInstance) => {
      if (unit.type === UnitType.fighter) {
        unit.combat!.hit = 8
      }
      return unit
    },
  },
  {
    type: 'faction-tech',
    name: 'Hybrid Crystal Fighter II',
    place: 'both',
    faction: Faction.naalu,
    unit: UnitType.fighter,
    transformUnit: (unit: UnitInstance) => {
      if (unit.type === UnitType.fighter) {
        unit.combat!.hit = 7
      }
      return unit
    },
  },
  {
    type: 'faction',
    name: 'Naalu mech',
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
    type: 'faction-ability',
    description:
      "Naalu mech text is: During combat against an opponent who has at least 1 relic fragment, apply +2 to the results of this unit's combat rolls.",
    faction: Faction.naalu,
    place: Place.ground,
    name: opponentHasRelicFragment,
  },
]
