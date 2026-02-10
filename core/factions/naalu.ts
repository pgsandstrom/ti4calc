import { isBattleOngoing } from '@/core/battle'
import { BattleInstance, EFFECT_HIGH_PRIORITY, ParticipantInstance } from '@/core/battle-types'
import { BattleEffect } from '@/core/battleeffect/battleEffects'
import { defaultRoll, UnitInstance, UnitType } from '@/core/unit'

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
              place: 'ground',
              transformUnit: (unit: UnitInstance, p: ParticipantInstance) => {
                if (unit.type === UnitType.fighter && p.side === 'attacker') {
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
    priority: EFFECT_HIGH_PRIORITY,
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
    faction: 'Naalu',
    unit: UnitType.fighter,
    transformUnit: (unit: UnitInstance) => {
      if (unit.type === UnitType.fighter) {
        unit.combat!.hit = 7
      }
      return unit
    },
  },
  {
    type: 'faction-ability',
    name: 'Codex mech',
    description:
      "Use Naalu's Codex III Mech: Other players cannot use ANTI-FIGHTER BARRAGE against your units in this system.",
    place: 'both',
    faction: 'Naalu',
    transformUnit: (unit: UnitInstance, p: ParticipantInstance) => {
      if (unit.type === UnitType.mech) {
        return {
          ...unit,
          battleEffects: [
            {
              name: 'Naalu mech remove afb',
              type: 'other',
              place: 'both',
              transformEnemyUnit: (u: UnitInstance) => {
                return {
                  ...u,
                  afb: undefined,
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
]
