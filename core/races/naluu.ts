import { isBattleOngoing } from '../battle'
import { BattleInstance, ParticipantInstance } from '../battle-types'
import { BattleEffect } from '../battleeffect/battleEffects'
import { Race } from '../enums'
import { defaultRoll, getUnitWithImproved, UnitInstance, UnitType } from '../unit'

const opponentHasRelicFragment = 'Naluu mech bonus'

export const naluu: BattleEffect[] = [
  {
    type: 'race',
    name: 'Naluu flagship',
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
    transformUnit: (unit: UnitInstance, p: ParticipantInstance) => {
      if (unit.type === UnitType.mech && p.effects[opponentHasRelicFragment] > 0) {
        return getUnitWithImproved(unit, 'combat', 'hit', 'permanent', 2)
      } else {
        return unit
      }
    },
  },
  {
    type: 'race-tech',
    race: Race.naluu,
    name: opponentHasRelicFragment,
  },
]
