import { doBombardment } from '../battle'
import { BattleInstance, ParticipantInstance } from '../battle-types'
import { BattleEffect } from '../battleeffect/battleEffects'
import { Faction, Place } from '../enums'
import { defaultRoll, UnitInstance, UnitType } from '../unit'

export const l1z1x: BattleEffect[] = [
  {
    type: 'faction',
    name: 'L1z1x flagship',
    place: Place.space,
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
    type: 'faction',
    name: 'L1z1x Harrow',
    place: Place.ground,
    onCombatRoundEnd: (
      participant: ParticipantInstance,
      battle: BattleInstance,
      _otherParticipant: ParticipantInstance,
    ) => {
      if (participant.side === 'attacker') {
        doBombardment(battle, true)
      }
    },
  },
  {
    type: 'faction-tech',
    name: 'L1z1x dreadnought upgrade',
    place: 'both',
    faction: Faction.l1z1x,
    unit: UnitType.dreadnought,
    transformUnit: (unit: UnitInstance) => {
      if (unit.type === UnitType.dreadnought) {
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
  {
    type: 'commander',
    description: 'Units that have PLANETARY SHIELD do not prevent you from using Bombardment.',
    name: 'L1z1x commander',
    place: Place.ground,
    transformEnemyUnit: (u: UnitInstance) => {
      return {
        ...u,
        planetaryShield: false,
      }
    },
  },
]
