import { doBombardment } from '../battle'
import { ParticipantInstance, BattleInstance } from '../battle-types'
import { BattleEffect } from '../battleeffect/battleEffects'
import { Place, Race } from '../enums'
import { defaultRoll, UnitInstance, UnitType } from '../unit'

export const l1z1x: BattleEffect[] = [
  {
    type: 'race',
    name: 'L1z1x flagship',
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
              name: 'L1z1x flagship forcing shots on non-fighters',
              place: Place.space,
              transformUnit: (auraUnit: UnitInstance) => {
                if (auraUnit.type === UnitType.flagship || auraUnit.type === UnitType.dreadnought) {
                  return {
                    ...auraUnit,
                    assignHitsToNonFighters: true,
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
    type: 'race',
    name: 'L1z1x Harrow',
    onCombatRoundEnd: (
      participant: ParticipantInstance,
      battle: BattleInstance,
      _otherParticipant: ParticipantInstance,
    ) => {
      if (participant.side === 'attacker') {
        doBombardment(battle)
      }
    },
  },
  {
    type: 'race-tech',
    name: 'L1z1x dreadnaught upgrade',
    race: Race.l1z1x,
    unit: UnitType.dreadnought,
    transformUnit: (unit: UnitInstance) => {
      if (unit.type === UnitType.dreadnought) {
        // TODO use that function u know
        return {
          ...unit,
          combat: {
            ...unit.combat!,
            hit: 4,
          },
          bombardment: {
            ...unit.bombardment!,
            hit: 4,
          },
        }
      } else {
        return unit
      }
    },
  },
  // TODO add mech
  // TODO add commander
]
